from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import heapq

# Import PIRS modules
from database_setup import setup_database
from data_ingestion import get_product_lookup
from prediction_engine import calculate_priority_score
from prioritization import build_reorder_heap
from reporting import InventoryBST, AuditList
from floor_operations import ShippingQueue, SafetyCheck, BlockedQueue

app = FastAPI(title="PIRS API", description="Predictive Inventory & Reorder System API")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
setup_database()

# --- Data Models ---
class Order(BaseModel):
    order_id: str
    customer: str
    item_sku: str

class StockUpdate(BaseModel):
    sku: str
    new_stock: int

# --- Global State (Simulation) ---
# --- Global State (Simulation) ---
# In a real app, these would be in a proper DB or persistent store
shipping_queue = ShippingQueue()
blocked_queue = BlockedQueue() # New Blocked Queue
safety_officer = SafetyCheck()
safety_officer.add_blocked_lot("LOT-EXP-202X") # Sample blocked lot

# Populate Queues from DB on Startup
def populate_queues():
    from data_ingestion import get_all_orders
    all_orders = get_all_orders()
    products = get_product_lookup()
    
    print(f"Populating queues with {len(all_orders)} orders...")
    for order in all_orders:
        product = products.get(order['sku'], {})
        # Calculate days remaining (Mock logic based on stock)
        days_left = 30
        if product and product.get('stock', 0) > 0:
             days_left = max(1, int(product['stock'] / 5))
             
        order_details = {
            'order_id': order['order_id'],
            'customer': f"Customer {order['customer_tier']}", # Mock name
            'item_sku': order['sku'],
            'item_name': order.get('product_name', product.get('name', 'Unknown')),
            'tier': order['customer_tier'],
            'days_remaining': days_left,
            'qty': order['qty_requested'],
            'total_amount': order.get('total_amount', 0),
            'status': order['status']
        }
        
        if order['status'] == 'BLOCKED':
            blocked_queue.add_blocked_order(order_details, "Manual Block / Stock Issue")
        elif order['status'] == 'PENDING':
             shipping_queue.add_order(order_details)
        # SHIPPED orders are ignored for the active queue

@app.on_event("startup")
async def startup_event():
    populate_queues()

@app.get("/")
def read_root():
    return {"status": "PIRS System Online"}

# ... (Previous endpoints) ...

@app.post("/api/orders/enqueue")
def enqueue_order(order: Order):
    # Fetch product details for priority calculation
    products = get_product_lookup()
    product = products.get(order.item_sku, {})
    
    # Calculate simplistic "Days Remaining" (Inverse of stock for simulation)
    days_left = 30 
    if product and product.get('stock', 0) > 0:
        days_left = max(1, int(product['stock'] / 5)) 
        
    order_details = {
        'order_id': order.order_id,
        'customer': order.customer,
        'item_sku': order.item_sku,
        'item_name': product.get('name', 'Unknown Product'),
        'tier': 1 if "VIP" not in order.customer else 2, 
        'days_remaining': days_left,
        'qty': 1,
        'total_amount': product.get('price', 0) * 1, # Default qty 1 for new enqueue
        'status': 'PENDING'
    }
    
    shipping_queue.add_order(order_details)
    return {"status": "queued", "message": f"Order {order.order_id} added to Smart Batch Queue."}

@app.get("/api/shipping/queue")
def view_queue():
    return shipping_queue.get_queue_status()

@app.get("/api/shipping/dashboard")
def get_shipping_dashboard():
    """
    Returns data for the Smart Shipment Dashboard (Command Center).
    """
    # 1. Main Priority Queue (Sorted by Score)
    raw_queue = shipping_queue.get_queue_status()
    
    # --- SELF-HEALING: Verify against DB to remove "Zombie" Shipped Orders ---
    # This fixes state mismatch if in-memory queue wasn't updated correctly
    if raw_queue:
        import sqlite3
        try:
            conn = sqlite3.connect('pirs_warehouse.db')
            cursor = conn.cursor()
            
            # Get IDs currently in the queue
            queue_ids = [o['order_id'] for o in raw_queue]
            
            # Check which of these are actually SHIPPED in the DB
            placeholders = ','.join(['?'] * len(queue_ids))
            query = f"SELECT order_id FROM customer_orders WHERE order_id IN ({placeholders}) AND status = 'SHIPPED'"
            cursor.execute(query, queue_ids)
            shipped_in_db = {row[0] for row in cursor.fetchall()}
            
            conn.close()
            
            # Filter them out from our display list AND clean up the heap
            if shipped_in_db:
                print(f"[SELF-HEAL] Found {len(shipped_in_db)} shipped orders still in queue. Removing: {shipped_in_db}")
                raw_queue = [o for o in raw_queue if o['order_id'] not in shipped_in_db]
                for oid in shipped_in_db:
                    shipping_queue.remove_order(oid)
                    
        except Exception as e:
            print(f"[SELF-HEAL ERROR] Could not verify DB status: {e}")

    # Inject Real-Time Stock Data
    products = get_product_lookup()
    priority_queue = []
    
    for order in raw_queue:
        sku = order.get('item_sku')
        current_stock = products.get(sku, {}).get('stock', 0)
        
        # Add stock status to the order object
        priority_queue.append({
            **order,
            'current_stock': current_stock,
            'stock_available': current_stock >= order.get('qty', 1)
        })

    # 2. Optimized Pick List (Aggregated)
    pick_list = shipping_queue.get_optimized_pick_list()
    
    # 3. Blocked Orders (Safety Gate)
    blocked_orders = blocked_queue.get_blocked_list()
    
    return {
        "priority_queue": priority_queue, 
        "pick_list": pick_list,
        "blocked_orders": blocked_orders,
        "queue_count": len(priority_queue)
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    print("DEBUG: Entering get_dashboard_summary")
    try:
        products = get_product_lookup()
        print(f"DEBUG: Found {len(products)} products")
        bst = InventoryBST()
        for sku, details in products.items():
            # Approx logic for days remaining
            days = max(1, int(details['stock'] / 5)) 
            bst.insert(days, sku, details) 
        
        print("DEBUG: BST Built")
        report = bst.get_stability_report()
        print(f"DEBUG: Report size: {len(report)}")
        critical_count = len([i for i in report if i['days_remaining'] < 7])
        
        return {
            "total_sku_count": len(products),
            "critical_stock_alert": critical_count,
            "system_status": "Operational"
        }
    except Exception as e:
        print(f"DEBUG ERROR in summary: {e}")
        return {"error": str(e)}

@app.get("/api/priority/top")
def get_top_priority():
    heap = build_reorder_heap()
    if not heap:
        return {}
    
    score, sku = heapq.heappop(heap)
    products = get_product_lookup()
    product = products.get(sku, {})
    
    # Approx logic again
    days = max(1, int(product.get('stock', 0) / 5))
    
    return {
        "name": product.get('name', 'Unknown'),
        "days_remaining": days,
        "current_stock": product.get('stock', 0),
        "sku": sku,
        "score": score
    }

@app.get("/api/inventory/stability")
def get_inventory_stability():
    products = get_product_lookup()
    bst = InventoryBST()
    for sku, details in products.items():
        days = max(1, int(details['stock'] / 5))
        bst.insert(days, sku, details)
        
    return bst.get_stability_report()

@app.get("/api/audit/next")
def get_audit_list():
    # Build a fresh list for the view
    products = get_product_lookup()
    audit_list = AuditList()
    for sku in products.keys():
        audit_list.add_product(sku)
        
    # Get next 5
    sequence = []
    for _ in range(5):
        sequence.append(audit_list.get_next_to_audit())
        
    return {"audit_sequence": sequence}

@app.get("/api/orders/history")
def get_order_history():
    from data_ingestion import get_all_orders
    return get_all_orders()

@app.post("/api/orders/{order_id}/dispatch")
def dispatch_order(order_id: str):
    import sqlite3
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. Get Order Details
        cursor.execute("SELECT * FROM customer_orders WHERE order_id = ?", (order_id,))
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        if order['status'] == 'SHIPPED':
             return {"message": f"Order {order_id} is already shipped."}

        # 2. Check Stock
        cursor.execute("SELECT current_stock FROM products WHERE sku = ?", (order['sku'],))
        product = cursor.fetchone()
        
        if not product:
             raise HTTPException(status_code=404, detail="Product not found")
             
        if product['current_stock'] < order['qty_requested']:
            raise HTTPException(status_code=400, detail="Insufficient stock to dispatch.")

        # 3. Update Stock
        new_stock = product['current_stock'] - order['qty_requested']
        cursor.execute("UPDATE products SET current_stock = ? WHERE sku = ?", (new_stock, order['sku']))
        
        # 4. Update Order Status
        cursor.execute("UPDATE customer_orders SET status = 'SHIPPED' WHERE order_id = ?", (order_id,))
        
        conn.commit()
        conn.close()
        
        # 5. Remove from In-Memory Queue (Simulation)
        shipping_queue.remove_order(order_id)
        
        return {"message": f"Order {order_id} dispatched successfully. Stock updated."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Inventory Management (CRUD) ---

class ProductCreate(BaseModel):
    sku: str
    name: str
    current_stock: int
    lead_time_days: int
    unit_cost: float

@app.post("/api/products")
def create_product(prod: ProductCreate):
    import sqlite3
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (sku, name, current_stock, lead_time_days, unit_cost) VALUES (?, ?, ?, ?, ?)",
            (prod.sku, prod.name, prod.current_stock, prod.lead_time_days, prod.unit_cost)
        )
        conn.commit()
        conn.close()
        return {"message": f"Product {prod.sku} created successfully."}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="SKU already exists.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/products/{sku}/stock")
def update_stock(sku: str, update: StockUpdate):
    import sqlite3
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE products SET current_stock = ? WHERE sku = ?", (update.new_stock, sku))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found.")
        conn.commit()
        conn.close()
        return {"message": f"Stock for {sku} updated to {update.new_stock}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products/{sku}")
def delete_product(sku: str):
    import sqlite3
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE sku = ?", (sku,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found.")
        conn.commit()
        conn.close()
        return {"message": f"Product {sku} deleted."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import sqlite3

def setup_database():
    # Connect to (or create) the database file
    # Connect to (or create) the database file
    conn = sqlite3.connect('pirs_warehouse.db')
    cursor = conn.cursor()

    # Reset tables to clean slate
    cursor.execute("DROP TABLE IF EXISTS sales_history")
    cursor.execute("DROP TABLE IF EXISTS inventory_lots")
    cursor.execute("DROP TABLE IF EXISTS customer_orders")
    cursor.execute("DROP TABLE IF EXISTS products") # Drop master last or verify FK constraints? SQLite defaults usually lax, but better safe.

    # 1. Product Master Table (For Hash Table & BST)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            sku TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            current_stock INTEGER DEFAULT 0,
            lead_time_days INTEGER DEFAULT 7,
            unit_cost REAL
        )
    ''')

    # 2. Sales History Table (For Dynamic Array/Prediction)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales_history (
            txn_id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT,
            qty_sold INTEGER,
            sale_date DATE,
            FOREIGN KEY (sku) REFERENCES products(sku)
        )
    ''')

    # 3. Lot Tracking Table (For Set/Safety Checks)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory_lots (
            lot_id TEXT PRIMARY KEY,
            sku TEXT,
            expiry_date DATE,
            is_recalled INTEGER DEFAULT 0,
            FOREIGN KEY (sku) REFERENCES products(sku)
        )
    ''')

    # Seed initial product data
    # Seed Synthetic Data (100+ Products)
    import random
    from datetime import datetime, timedelta

    # Explicit Product Catalog from User Images
    products_catalog = [
        # Electronics
        ('SKU001', 'Mouse (Electronics)', 349.00), ('SKU002', 'Keyboard (Electronics)', 599.00),
        ('SKU003', 'Monitor (Electronics)', 7499.00), ('SKU004', 'Cable (Electronics)', 199.00),
        ('SKU005', 'Charger (Electronics)', 449.00), ('SKU006', 'Headset (Electronics)', 899.00),
        ('SKU007', 'Webcam (Electronics)', 1499.00), ('SKU008', 'Microphone (Electronics)', 599.00),
        ('SKU009', 'Laptop Stand (Electronics)', 699.00), ('SKU010', 'USB Hub (Electronics)', 399.00),
        ('SKU011', 'Power Bank (Electronics)', 999.00), ('SKU012', 'HDMI Adapter (Electronics)', 299.00),
        ('SKU013', 'Router (Electronics)', 1299.00), ('SKU014', 'Switch (Electronics)', 799.00),
        ('SKU015', 'Speaker (Electronics)', 1199.00),
        
        # Office
        ('SKU016', 'Paper (Office)', 260.00), ('SKU017', 'Pen (Office)', 50.00),
        ('SKU018', 'Stapler (Office)', 149.00), ('SKU019', 'Binder (Office)', 120.00),
        ('SKU020', 'Folder (Office)', 25.00), ('SKU021', 'Notepad (Office)', 60.00),
        ('SKU022', 'Desk Lamp (Office)', 799.00), ('SKU023', 'Chair (Office)', 3499.00),
        ('SKU024', 'Whiteboard (Office)', 899.00), ('SKU025', 'Marker (Office)', 30.00),
        ('SKU026', 'Highlighter (Office)', 25.00), ('SKU027', 'Scissors (Office)', 129.00),
        ('SKU028', 'Tape (Office)', 49.00), ('SKU029', 'Calculator (Office)', 399.00),
        ('SKU030', 'Shredder (Office)', 2499.00),

        # Kitchen
        ('SKU031', 'Mug (Kitchen)', 149.00), ('SKU032', 'Plate (Kitchen)', 199.00),
        ('SKU033', 'Fork (Kitchen)', 249.00), ('SKU034', 'Spoon (Kitchen)', 249.00),
        ('SKU035', 'Knife (Kitchen)', 299.00), ('SKU036', 'Bowl (Kitchen)', 99.00),
        ('SKU037', 'Glass (Kitchen)', 399.00), ('SKU038', 'Napkin (Kitchen)', 79.00),
        ('SKU039', 'Towel (Kitchen)', 149.00), ('SKU040', 'Soap (Kitchen)', 89.00),
        ('SKU041', 'Sponge (Kitchen)', 49.00), ('SKU042', 'Toaster (Kitchen)', 1199.00),
        ('SKU043', 'Blender (Kitchen)', 1499.00), ('SKU044', 'Mixer (Kitchen)', 2899.00),
        ('SKU045', 'Kettle (Kitchen)', 799.00),

        # Automotive
        ('SKU046', 'Wiper Blade (Automotive)', 349.00), ('SKU047', 'Car Wax (Automotive)', 399.00),
        ('SKU048', 'Air Freshener (Automotive)', 199.00), ('SKU049', 'Oil Filter (Automotive)', 249.00),
        ('SKU050', 'Tire shine (Automotive)', 299.00), ('SKU051', 'Seat Cover (Automotive)', 899.00),
        ('SKU052', 'Phone Mount (Automotive)', 349.00), ('SKU053', 'Vacuum (Automotive)', 999.00),
        ('SKU054', 'Jump Starter (Automotive)', 3999.00), ('SKU055', 'First Aid Kit (Automotive)', 499.00),

        # Gardening
        ('SKU056', 'Shovel (Gardening)', 499.00), ('SKU057', 'Rake (Gardening)', 399.00),
        ('SKU058', 'Gloves (Gardening)', 149.00), ('SKU059', 'Hose (Gardening)', 599.00),
        ('SKU060', 'Sprinkler (Gardening)', 349.00), ('SKU061', 'Pot (Gardening)', 199.00),
        ('SKU062', 'Seeds (Gardening)', 99.00), ('SKU063', 'Fertilizer (Gardening)', 249.00),
        ('SKU064', 'Pruner (Gardening)', 399.00), ('SKU065', 'Trowel (Gardening)', 129.00),
    ]

    # Additional Toys (Randomized as no image data provided)
    toys = ['Action Figure', 'Doll', 'Puzzle', 'Board Game', 'Card Game', 'Blocks', 'Plush', 'Drone', 'Car Model', 'Train Set']
    sku_start = 66
    for i, toy in enumerate(toys):
        sku = f"SKU{sku_start + i:03d}"
        products_catalog.append((sku, f"{toy} (Toys)", round(random.uniform(100.0, 5000.0), 2)))

    products_data = []
    sales_data = []
    
    for sku, name, cost in products_catalog:
        # Randomize stock/lead time, but keep price exact
        stock = random.randint(5, 500) 
        lead = random.randint(2, 21)
        
        products_data.append((sku, name, stock, lead, cost))
        
        # Generate sales history
        daily_demand = random.randint(0, 10)
        start_date = datetime.now()
        for i in range(15): 
            date_str = (start_date - timedelta(days=i)).strftime('%Y-%m-%d')
            qty = max(0, daily_demand + random.randint(-3, 5)) 
            if qty > 0:
                sales_data.append((sku, qty, date_str))

    cursor.executemany('INSERT OR IGNORE INTO products VALUES (?,?,?,?,?)', products_data)
    cursor.executemany('INSERT INTO sales_history (sku, qty_sold, sale_date) VALUES (?,?,?)', sales_data)

    # Seed initial sales data (to test prediction)
    # SKU001 (Milk): High sales (10/day), huge stock (150). Days left = 15.
    sample_sales = [
        ('SKU001', 10, '2023-10-01'), ('SKU001', 10, '2023-10-02'),
        ('SKU002', 1, '2023-10-01'), ('SKU002', 1, '2023-10-02')
    ]
    cursor.executemany('INSERT INTO sales_history (sku, qty_sold, sale_date) VALUES (?,?,?)', sample_sales)

    # 4. Customer Orders Table (For Priority Queue/Heap)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customer_orders (
            order_id TEXT PRIMARY KEY,
            customer_tier INTEGER,
            order_date DATE,
            sku TEXT,
            product_name TEXT,
            qty_requested INTEGER,
            total_amount REAL,
            status TEXT,
            FOREIGN KEY (sku) REFERENCES products(sku)
        )
    ''')
    
    # Seed Customer Orders
    orders_data = []
    statuses = ['PENDING', 'SHIPPED', 'BLOCKED']
    # Weighted statuses: mostly SHIPPED
    status_weights = [0.2, 0.7, 0.1] 
    
    order_counter = 1001
    for sku, name, _, _, cost in products_data:
        # Generate 5-20 orders per product
        num_orders = random.randint(5, 20)
        for _ in range(num_orders):
            order_id = f"ORD-{order_counter}"
            tier = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0] 
            
            days_ago = random.randint(0, 30)
            order_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            qty = random.randint(1, 10)
            total_amount = round(qty * cost, 2)
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Now inserting 'total_amount' as well
            orders_data.append((order_id, tier, order_date, sku, name, qty, total_amount, status))
            order_counter += 1
            
    cursor.executemany('INSERT OR IGNORE INTO customer_orders VALUES (?,?,?,?,?,?,?,?)', orders_data)

    conn.commit()
    conn.close()
    print("Database 'pirs_warehouse.db' initialized successfully!")

if __name__ == "__main__":
    setup_database()
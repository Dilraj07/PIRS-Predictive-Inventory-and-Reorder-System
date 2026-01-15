import sqlite3

def get_product_lookup():
    """
    Returns a Hash Table (Dict) for O(1) product access.
    
    Data Structure: Hash Table (Python Dictionary)
    Key: SKU (String)
    Value: Dictionary of product details
    Complexity: O(1) Average Case for Lookups
    """
    products = {}
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        cursor.execute("SELECT sku, name, current_stock, lead_time_days, unit_cost FROM products")
        
        # SKU is the Key, Details are the Value
        products = {row[0]: {'name': row[1], 'stock': row[2], 'lead': row[3], 'price': row[4]} for row in cursor.fetchall()}
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()
            
    return products

def get_sales_array(sku):
    """
    Returns a Dynamic Array (List) of recent sales for a specific SKU.
    
    Data Structure: Dynamic Array (Python List)
    Usage: Used to iterate chronologically for prediction algorithms.
    """
    sales_data = []
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        # Order by date desc to get most recent first, or asc for chronological analysis
        cursor.execute("SELECT qty_sold FROM sales_history WHERE sku = ? ORDER BY sale_date DESC", (sku,))
        sales_data = [row[0] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"Database error getting sales for {sku}: {e}")
    finally:
        if conn:
            conn.close()
            
    return sales_data

def get_all_orders():
    """
    Fetches all customer orders.
    """
    orders = []
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        conn.row_factory = sqlite3.Row # Allow dict-like access
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customer_orders ORDER BY order_date DESC")
        orders = [dict(row) for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"Database error getting orders: {e}")
    finally:
        if conn:
            conn.close()
    return orders
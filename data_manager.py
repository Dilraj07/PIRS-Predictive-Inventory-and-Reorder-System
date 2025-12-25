import sqlite3

DB_NAME = 'inventory.db'

def get_product_master_data():
    """
    Step B: Loads product data from SQLite into a Python Dictionary (Hash Table).
    Returns: dict { "SKU001": { "name": "...", "stock": 100, ... }, ... }
    """
    conn = sqlite3.connect(DB_NAME)
    # Use Row factory to access columns by name easily
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT sku, name, current_stock, price, supplier_info FROM products")
        rows = cursor.fetchall()

        # Transformation: Convert SQL rows into the Hash Table structure
        master_data_hash = {}
        for row in rows:
            master_data_hash[row['sku']] = {
                'name': row['name'],
                'stock': row['current_stock'],
                'price': row['price'],
                'supplier': row['supplier_info']
            }
        
        return master_data_hash
    except Exception as e:
        print(f"Error loading master data: {e}")
        return {}
    finally:
        conn.close()
    
def calculate_forecast(master_data_hash):
    """
    Step C: The Prediction Engine.
    1. Aggregates sales history via SQL.
    2. Calculates 'Days of Stock Remaining' based on current stock from master data.
    3. Prepares data for Member 2's Heap.
    
    Args: master_data_hash (dict) - The output from Step B.
    Returns: list of tuples [(days_remaining, sku), ...]
    """
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        # --- Extraction & Aggregation (SQL side) ---
        # We ask the DB to calculate total sold and total distinct days with sales per SKU
        # We limit to recent history (e.g., last 90 days) for better trend relevance
        query = """
            SELECT 
                sku, 
                SUM(quantity_sold) as total_sold,
                COUNT(DISTINCT sale_date) as active_days
            FROM sales_history
            WHERE sale_date >= date('now', '-90 days')
            GROUP BY sku
        """
        cursor.execute(query)
        aggregated_sales = cursor.fetchall()

        heap_ready_data = []

        # --- Calculation & Transformation (Python side) ---
        for sku, total_sold, active_days in aggregated_sales:
            # Ensure we have master data for this SKU before calculating
            if sku in master_data_hash and active_days > 0:
                current_stock = master_data_hash[sku]['stock']
                
                # 1. Calculate Average Daily Sales (Burn Rate)
                # Avoid division by zero if active_days is somehow 0
                avg_daily_sales = total_sold / active_days if active_days > 0 else 0

                # 2. Calculate Forecasted Days Remaining
                if avg_daily_sales > 0:
                    days_remaining = current_stock / avg_daily_sales
                else:
                    # If no sales, stock will last "forever" (use a high number)
                    days_remaining = 9999.0 
                
                # Round for cleaner data
                days_remaining = round(days_remaining, 2)

                # 3. Format for Handoff to Member 2 (Heap requires tuples)
                # We put the metric FIRST because heaps sort by the first item in a tuple.
                heap_ready_data.append((days_remaining, sku))

        return heap_ready_data

    except Exception as e:
        print(f"Error calculating forecast: {e}")
        return []
    finally:
        conn.close()

if __name__ == '__main__':
    # 1. Load the ground truth
    master_hash = get_product_master_data()
    print(f"Loaded {len(master_hash)} products into Hash Table.")

    # 2. Run prediction engine
    print("\n--- Running Prediction Engine (Step C) ---")
    forecast_data = calculate_forecast(master_hash)
    
    # 3. Simulate Handoff to Member 2
    print(f"Generated forecast for {len(forecast_data)} items.")
    print("Sample data ready for Min-Heap insertion (tuples of (days_left, sku)):")
    # Print top 5 to verify results look reasonable
    for sample in forecast_data[:5]:
        print(sample)

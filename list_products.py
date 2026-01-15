import sqlite3

def list_products():
    try:
        conn = sqlite3.connect('pirs_warehouse.db')
        cursor = conn.cursor()
        cursor.execute("SELECT sku, name FROM products ORDER BY name")
        rows = cursor.fetchall()
        
        print(f"Found {len(rows)} products:")
        print("-" * 50)
        for sku, name in rows:
            print(f"{sku}: {name}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    list_products()

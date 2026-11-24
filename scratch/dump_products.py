import sqlite3

conn = sqlite3.connect('data/erlux.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print(f"Tables in db: {tables}\n")

cursor.execute("""
SELECT id, name, brand, collection_range, category_id, main_image, price, compare_price
FROM products
ORDER BY id
""")
rows = cursor.fetchall()
for r in rows:
    print(f"ID {r[0]:2} | Brand: {r[2]:6} | Range: {str(r[3]):15} | Cat: {r[4]} | Name: {r[1]:45} | MainImg: {r[5]}")

if 'product_images' in tables:
    print("\n=== product_images ===")
    cursor.execute("SELECT * FROM product_images")
    for row in cursor.fetchall():
        print(row)

conn.close()

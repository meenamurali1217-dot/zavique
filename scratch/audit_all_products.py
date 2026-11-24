import sqlite3

conn = sqlite3.connect('data/erlux.db')
cur = conn.cursor()

cur.execute("""
SELECT p.id, p.category_id, c.name, p.name, p.brand, p.collection_range, p.main_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.category_id, p.id
""")
rows = cur.fetchall()
print(f"Total products in DB: {len(rows)}")

categories = {}
for r in rows:
    cat = r[2]
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(r)

for cat, prods in categories.items():
    print(f"\n=== CATEGORY: {cat} ({len(prods)} products) ===")
    for p in prods:
        print(f"  ID {p[0]}: [{p[4]}] '{p[3]}' -> image: {p[6]}")

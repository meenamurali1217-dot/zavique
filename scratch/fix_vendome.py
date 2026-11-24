# -*- coding: utf-8 -*-
import sqlite3

conn = sqlite3.connect('data/erlux.db')
c = conn.cursor()
c.execute("UPDATE products SET name = ? WHERE id = 11", ('Vendôme Diamond Bezel Elegance Watch 36mm',))
c.execute("UPDATE products SET name = ? WHERE id = 16", ('Vendôme Structured Top-Handle Bag',))
c.execute("UPDATE product_images SET alt_text = ? WHERE product_id = 11", ('Vendôme Diamond Bezel Elegance Watch 36mm',))
c.execute("UPDATE product_images SET alt_text = ? WHERE product_id = 16", ('Vendôme Structured Top-Handle Bag',))
conn.commit()

for r in c.execute('SELECT id, name FROM products WHERE id IN (11, 16)'):
    print(r[0], r[1].encode('ascii', 'backslashreplace').decode('ascii'))
conn.close()

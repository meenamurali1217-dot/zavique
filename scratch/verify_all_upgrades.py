# -*- coding: utf-8 -*-
import os
import sqlite3
import urllib.request
from PIL import Image

def test_verification():
    print("==================================================")
    print(" ERLUX PREMIUM BRANDING UPGRADE - FULL AUDIT")
    print("==================================================")
    
    # 1. Target files list from backup
    backup_dir = "assets/images_backup_branding_upgrade"
    targets = []
    for root, dirs, files in os.walk(backup_dir):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), backup_dir)
            targets.append(os.path.join("assets", rel))
            
    print(f"\n[1] Checking {len(targets)} Upgraded Image Files:")
    all_files_ok = True
    for target in sorted(targets):
        if not os.path.exists(target):
            print(f"  FAILED: Missing {target}")
            all_files_ok = False
            continue
        try:
            with Image.open(target) as img:
                print(f"  OK: {target} -> {img.size}, {img.mode}, {img.format}")
        except Exception as e:
            print(f"  FAILED: {target} error: {e}")
            all_files_ok = False
            
    # 2. Live HTTP 200 Test via Express Server (http://localhost:3000)
    print("\n[2] Checking Live HTTP 200 Responses on Server (http://localhost:3000):")
    http_ok = True
    server_base = "http://localhost:3000"
    
    # Check key frontend endpoints
    pages = ["/", "/index.html", "/shop.html", "/faq.html", "/api/products"]
    for page in pages:
        url = f"{server_base}{page}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                print(f"  OK: {page} -> HTTP {resp.status}")
        except Exception as e:
            print(f"  FAILED: {url} error: {e}")
            http_ok = False
            
    # Check all upgraded target images via HTTP
    for target in sorted(targets):
        web_path = "/" + target.replace("\\", "/")
        url = f"{server_base}{web_path}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status != 200:
                    print(f"  FAILED: HTTP {resp.status} for {web_path}")
                    http_ok = False
        except Exception as e:
            print(f"  FAILED: {url} error: {e}")
            http_ok = False
    if http_ok:
        print(f"  ALL {len(targets)} images served with HTTP 200 OK!")
        
    # 3. Database Integrity Test
    print("\n[3] Checking SQLite Database Products & Images (data/erlux.db):")
    conn = sqlite3.connect("data/erlux.db")
    c = conn.cursor()
    db_ok = True
    
    products = c.execute("SELECT id, name, brand, main_image FROM products ORDER BY id").fetchall()
    print(f"  Found {len(products)} products in database.")
    for pid, name, brand, img in products:
        if brand != "ERLUX":
            print(f"  WARNING: Product {pid} brand is '{brand}' (expected 'ERLUX')")
        if not os.path.exists(img.lstrip("/")):
            print(f"  FAILED: Product {pid} main_image does not exist: {img}")
            db_ok = False
            
    product_images = c.execute("SELECT id, product_id, image_url, alt_text FROM product_images").fetchall()
    print(f"  Found {len(product_images)} product images in gallery database.")
    for img_id, pid, img, alt in product_images:
        if not os.path.exists(img.lstrip("/")):
            print(f"  FAILED: product_images {img_id} (pid {pid}) missing: {img}")
            db_ok = False
            
    conn.close()
    if db_ok:
        print("  Database integrity check PASSED! All rows point to valid files.")
        
    # 4. Summary
    print("\n==================================================")
    if all_files_ok and http_ok and db_ok:
        print(" ALL VERIFICATION CHECKS PASSED PERFECTLY!")
    else:
        print(" SOME CHECKS FAILED - REVIEW ABOVE.")
    print("==================================================")

if __name__ == "__main__":
    test_verification()

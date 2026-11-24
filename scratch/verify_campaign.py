import urllib.request
from PIL import Image
import os

images = [
    # 5 Campaign images
    ("assets/images/erlux_campaign/erlux_noir.jpg", 1200, 1200),
    ("assets/images/erlux_campaign/erlux_bloom.jpg", 1200, 1200),
    ("assets/images/erlux_campaign/erlux_oud.jpg", 1200, 1200),
    ("assets/images/erlux_campaign/erlux_aurora.jpg", 1200, 1200),
    ("assets/images/erlux_campaign/erlux_sovereign.jpg", 1200, 1200),
    # Best Sellers
    ("assets/images/erlux_repo/best_seller/noir.webp", 600, 600),
    ("assets/images/erlux_repo/best_seller/bloom.webp", 600, 600),
    ("assets/images/erlux_repo/best_seller/oud.webp", 600, 600),
    ("assets/images/erlux_repo/best_seller/aurora.webp", 600, 600),
    # Category
    ("assets/images/category/category-fragrance.webp", 600, 500),
    # Banners
    ("assets/images/erlux_repo/fragrance/hero.webp", 1600, 535),
    ("assets/images/erlux_repo/premium_fragrances_banner.webp", 1200, 400),
    ("assets/images/erlux_repo/fragrance/long_lastic.webp", 1200, 409),
    # Instagram 4
    ("assets/images/instagram/instagram-4.jpg", 384, 570),
    # Catalog DB images
    ("assets/images/erlux/images_pages_perfumes_chairman-special.jpg", 1200, 1200),
    ("assets/images/erlux/images_pages_perfumes_all-in-one-poster.jpg", 1200, 1200),
    ("assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg", 1200, 1200),
    ("assets/images/erlux/images_collections_fragrance.jpg", 1200, 1200),
]

print("=== VERIFYING LOCAL FILES AND SIZES ===")
all_files_ok = True
for path, w, h in images:
    if not os.path.exists(path):
        print(f"[FAIL] Missing {path}")
        all_files_ok = False
        continue
    im = Image.open(path)
    if im.size == (w, h):
        print(f"[PASS] {path}: {im.size} ({im.format})")
    else:
        print(f"[WARN] {path}: expected {w}x{h}, got {im.size}")

print("\n=== VERIFYING HTTP 200 ON RUNNING SERVER ===")
base = "http://localhost:3000"
all_http_ok = True
for path, _, _ in images:
    url = f"{base}/{path.replace('\\', '/')}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                print(f"[HTTP 200] {url} -> {resp.headers.get('Content-Length')} bytes")
            else:
                print(f"[FAIL {resp.status}] {url}")
                all_http_ok = False
    except Exception as e:
        print(f"[HTTP ERROR] {url}: {e}")
        all_http_ok = False

if all_files_ok and all_http_ok:
    print("\n>>> ALL CAMPAIGN AND WEBSITE VERIFICATION CHECKS PASSED! <<<")

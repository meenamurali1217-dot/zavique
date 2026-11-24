import glob
import re
from collections import defaultdict

html_files = glob.glob('*.html')
images_by_file = defaultdict(list)

for f in sorted(html_files):
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            srcs = re.findall(r'src=["\']([^"\']+\.(?:jpg|jpeg|png|webp|avif))["\']', content, re.IGNORECASE)
            for s in srcs:
                images_by_file[f].append(s)
    except Exception as e:
        print(f"Error reading {f}: {e}")

print(f"Scanned {len(html_files)} HTML files.\n")

# Check index.html specifically
print("=== Images in index.html ===")
for img in images_by_file.get('index.html', []):
    if any(k in img.lower() for k in ['product', 'seller', 'perfume', 'cosmetic', 'watch', 'care', 'fragrance', 'shop', 'banner', 'hero', 'erlux']):
        print(f"  {img}")

# Check all unique images referenced across HTML
all_images = set()
for imgs in images_by_file.values():
    all_images.update(imgs)

print(f"\nTotal unique images across all HTML: {len(all_images)}")

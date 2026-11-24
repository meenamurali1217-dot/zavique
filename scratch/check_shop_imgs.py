import re

with open('shop.html', 'r', encoding='utf-8', errors='ignore') as fp:
    c = fp.read()
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', c)
    print(f"Total img tags in shop.html: {len(imgs)}")
    for img in imgs[:30]:
        print(" ", img)

import urllib.request
import re
import json

def get_unsplash_image(page_url):
    req = urllib.request.Request(page_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'property="og:image"\s+content="([^"]+)"', html)
            if not m:
                m = re.search(r'content="([^"]+)"\s+property="og:image"', html)
            if m:
                return m.group(1)
            matches = re.findall(r'https://images\.unsplash\.com/photo-[^"\'\s\?]+', html)
            if matches:
                return matches[0]
    except Exception as e:
        print(f"Error fetching {page_url}: {e}")
    return None

test_url = 'https://unsplash.com/photos/a-gold-watch-lies-on-a-reflective-white-surface-bZ0WwXQvH9c'
img_url = get_unsplash_image(test_url)
print("Image URL:", img_url)

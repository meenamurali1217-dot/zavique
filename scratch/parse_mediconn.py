import urllib.request
import re

url = 'https://mediconn-two.vercel.app/assets/index-VyO0412I.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Search for any image paths or product structures
img_paths = set(re.findall(r'["\']([^"\']+\.(?:png|jpg|jpeg|webp|svg))["\']', text))
print("Images found:", img_paths)

# Find string patterns matching product titles or brand names
matches = re.findall(r'title:"([^"]+)"', text)
print("Titles:", matches[:10])

# Search for "brand" or "product"
print("Brand mentions:", re.findall(r'brand:[^,}]+', text)[:10])
print("Price mentions:", re.findall(r'price:[^,}]+', text)[:10])

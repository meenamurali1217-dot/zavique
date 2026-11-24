import urllib.request
import re

url = 'https://mediconn-two.vercel.app/assets/index-VyO0412I.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        text = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched {len(text)} bytes")
        # Find product names and images
        urls = set(re.findall(r'https://images\.unsplash\.com/[^\s"\'\)]+', text))
        print(f"Found {len(urls)} unsplash urls:")
        for u in list(urls)[:10]:
            print(" ", u)
        
        # Check products in code
        products = re.findall(r'name:"([^"]+)"', text)
        print(f"Sample product names ({len(products)}):", products[:15])
except Exception as e:
    print("Error:", e)

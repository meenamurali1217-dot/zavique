import urllib.request
import re

url = 'https://mediconn-two.vercel.app/assets/index-VyO0412I.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Search for Yn=
m = re.findall(r'(?:const\s+|let\s+|var\s+)?Yn\s*=\s*[^;,]+', text)
print("Yn definitions:", m[:5])
# Let's search for "data:image" or paths
for var in ['Yn', 'Xn', 'Zn']:
    matches = re.findall(rf'{var}\s*=\s*([^;,\n]+)', text)
    print(f"{var} = {matches[:3]}")

import urllib.request
import re

url = 'https://mediconn-two.vercel.app/assets/index-VyO0412I.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

idx = text.find('price:799')
if idx != -1:
    print(text[max(0, idx-300):min(len(text), idx+500)])

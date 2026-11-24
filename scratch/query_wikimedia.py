import requests

url = "https://commons.wikimedia.org/w/api.php"
params = {
    "action": "query",
    "generator": "search",
    "gsrsearch": "perfume bottle black marble OR luxury perfume",
    "gsrnamespace": 6,  # File namespace
    "gsrlimit": 10,
    "prop": "imageinfo",
    "iiprop": "url|dimensions|mime",
    "format": "json"
}

r = requests.get(url, params=params, headers={"User-Agent": "ErluxBot/1.0"})
print(r.status_code)
data = r.json()
pages = data.get("query", {}).get("pages", {})
print(f"Found {len(pages)} pages on Wikimedia Commons:")
for pid, pdata in pages.items():
    title = pdata.get("title")
    ii = pdata.get("imageinfo", [{}])[0]
    print(f"  {title}: {ii.get('width')}x{ii.get('height')} -> {ii.get('url')}")

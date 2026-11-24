import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Search unsplash for luxury perfume opaque
queries = ['black perfume bottle', 'white perfume bottle', 'luxury perfume marble', 'perfume bottle gold']
for q in queries:
    url = f"https://unsplash.com/napi/search/photos?query={q.replace(' ', '+')}&per_page=5"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            results = data.get('results', [])
            print(f"=== Query: '{q}' ({len(results)} results) ===")
            for item in results[:3]:
                desc = item.get('alt_description') or item.get('description') or 'No description'
                raw_url = item.get('urls', {}).get('regular')
                print(f"  ID: {item.get('id')} | Desc: {desc[:60]} | URL: {raw_url}")
        else:
            print(f"Query '{q}' returned status {r.status_code}")
    except Exception as e:
        print(f"Query '{q}' error: {e}")

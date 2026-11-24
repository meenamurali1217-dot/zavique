import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

results = {}
for hf in html_files:
    with open(hf, 'r', encoding='utf-8', errors='ignore') as fp:
        lines = fp.readlines()
    
    matches = []
    for idx, line in enumerate(lines, 1):
        if any(w in line.lower() for w in ['fragrance', 'perfume', 'scent', 'noir', 'bloom', 'oud', 'aurora', 'eau de parfum']):
            # check if an img tag is nearby (within 10 lines)
            start = max(0, idx - 10)
            end = min(len(lines), idx + 10)
            chunk = "".join(lines[start:end])
            imgs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', chunk)
            if imgs:
                for img in imgs:
                    matches.append((idx, line.strip()[:80], img))
    if matches:
        results[hf] = matches

for hf, mlist in results.items():
    print(f"\n=== {hf} ({len(mlist)} matches) ===")
    seen = set()
    for line_no, context, img in mlist:
        if img not in seen:
            seen.add(img)
            print(f"  L{line_no}: img={img} | context={context[:50]}...")

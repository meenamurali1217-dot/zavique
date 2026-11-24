import glob
import re

js_files = glob.glob('assets/js/**/*.js', recursive=True)
for f in js_files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            c = fp.read()
            if 'api/products' in c or 'fetch(' in c:
                print(f"Match in {f}")
                lines = c.split('\n')
                for i, line in enumerate(lines):
                    if 'api/products' in line or 'fetch(' in line:
                        print(f"  Line {i+1}: {line.strip()[:100]}")
    except Exception as e:
        pass

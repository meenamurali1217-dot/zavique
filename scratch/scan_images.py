import os
from PIL import Image

def scan_dir(dir_path):
    print(f"\n=== Scanning {dir_path} ===")
    if not os.path.exists(dir_path):
        print(f"Directory {dir_path} does not exist.")
        return
    for root, dirs, files in os.walk(dir_path):
        for f in sorted(files):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif')):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, '.')
                try:
                    with Image.open(p) as img:
                        print(f"{rel}: {img.format} {img.size} ({img.mode})")
                except Exception as e:
                    print(f"{rel}: Error {e}")

scan_dir('assets/images/erlux')
scan_dir('assets/images/erlux_repo')
scan_dir('assets/images/category')

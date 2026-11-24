import os
from PIL import Image

gift_files = [f for f in os.listdir('assets/images/erlux') if 'gift-set' in f]
for gf in sorted(gift_files):
    p = os.path.join('assets/images/erlux', gf)
    im = Image.open(p)
    print(f"{gf}: {im.size} {im.mode}")

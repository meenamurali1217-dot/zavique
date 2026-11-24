import numpy as np
from PIL import Image

im = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp')
arr = np.array(im)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
bright = (r > 120) & (g > 120) & (b > 120) # text pixels

# Find y ranges where bright text exists in central x (400 to 800)
for y in range(350, 750, 5):
    cnt = np.sum(bright[y:y+5, 400:800])
    if cnt > 20:
        print(f"y={y}-{y+5}: {cnt} bright pixels")

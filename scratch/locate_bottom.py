import numpy as np
from PIL import Image

im = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp')
arr = np.array(im)
lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

# In central column (580 to 620), check luminosity from y=750 to 950
for y in range(750, 950, 10):
    val = np.mean(lum[y:y+10, 580:620])
    print(f"y={y}-{y+10}: mean lum = {val:.1f}")

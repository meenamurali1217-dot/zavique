from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_menu_cosmetics-editorial.png')
arr = np.array(img)

row = arr[850, 480:720]
# Find where R > 150
xs = np.where(row[:, 0] > 150)[0] + 480
print(f"Peach tube x at y=850: min={xs.min()}, max={xs.max()}")

# Also check text "COLOR RICHE" pixels (where R < 100 on peach tube)
text_rows = []
for y in range(860, 1020):
    for x in range(xs.min(), xs.max()):
        if arr[y, x, 0] < 120 and arr[y, x, 1] < 80:
            text_rows.append(y)
if text_rows:
    print(f"Text y range: min={min(text_rows)}, max={max(text_rows)}")

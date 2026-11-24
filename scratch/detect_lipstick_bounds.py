from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_menu_cosmetics-editorial.png')
arr = np.array(img)

# Find coordinates where pixels are near black (R < 35, G < 35, B < 35) in the central area (x: 480..720, y: 400..850)
mask = (arr[400:850, 480:720, 0] < 35) & (arr[400:850, 480:720, 1] < 35) & (arr[400:850, 480:720, 2] < 35)
ys, xs = np.where(mask)
if len(ys) > 0:
    print(f"Black box relative to (480, 400):")
    print(f"  X: min {xs.min() + 480}, max {xs.max() + 480}")
    print(f"  Y: min {ys.min() + 400}, max {ys.max() + 400}")

# Let's inspect the text "COLOR RICHE" coordinates in lower area (y: 800..1050, x: 500..700)
# Dark text pixels
text_mask = (arr[800:1050, 500:700, 0] < 80) & (arr[800:1050, 500:700, 1] < 80) & (arr[800:1050, 500:700, 2] < 80)
t_ys, t_xs = np.where(text_mask)
if len(t_ys) > 0:
    print(f"Text in lower tube relative to (500, 800):")
    print(f"  X: min {t_xs.min() + 500}, max {t_xs.max() + 500}")
    print(f"  Y: min {t_ys.min() + 800}, max {t_ys.max() + 800}")

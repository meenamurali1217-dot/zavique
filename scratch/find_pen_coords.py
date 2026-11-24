from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
arr = np.array(img)
# Find all gold pixels in y: 700..800
pen_gold = (arr[700:800, :, 0] > 170) & (arr[700:800, :, 1] > 130) & (arr[700:800, :, 2] < 90)
pys, pxs = np.where(pen_gold)
if len(pys) > 0:
    print(f"Pen gold in y:700..800 -> X: {pxs.min()}..{pxs.max()}, Y: {pys.min()+700}..{pys.max()+700}")

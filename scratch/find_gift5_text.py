from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp')
arr = np.array(img)

# The brown leather case is in the upper half (y: 200..500, x: 300..900)
gold_text = (arr[250:500, 300:900, 0] > 170) & (arr[250:500, 300:900, 1] > 130) & (arr[250:500, 300:900, 2] < 90)
ys, xs = np.where(gold_text)
if len(ys) > 0:
    print(f"Case text bounds: X: {xs.min() + 300}..{xs.max() + 300}, Y: {ys.min() + 250}..{ys.max() + 250}")

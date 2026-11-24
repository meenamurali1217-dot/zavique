from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
arr = np.array(img)

# On wallet: find all gold pixels in y: 470..580, x: 190..460
mask_w = (arr[470:580, 190:460, 0] > 160) & (arr[470:580, 190:460, 1] > 120) & (arr[470:580, 190:460, 2] < 90)
ys, xs = np.where(mask_w)
print(f"Wallet text exact bounds: X: {xs.min()+190}..{xs.max()+190}, Y: {ys.min()+470}..{ys.max()+470}")

# On watch: find all gold pixels in y: 320..420, x: 700..850
mask_watch = (arr[320:420, 700:850, 0] > 160) & (arr[320:420, 700:850, 1] > 120) & (arr[320:420, 700:850, 2] < 90)
wys, wxs = np.where(mask_watch)
print(f"Watch text exact bounds: X: {wxs.min()+700}..{wxs.max()+700}, Y: {wys.min()+320}..{wys.max()+320}")

# On pen: find all gold pixels in y: 660..730, x: 420..620
mask_pen = (arr[660:730, 420:620, 0] > 160) & (arr[660:730, 420:620, 1] > 120) & (arr[660:730, 420:620, 2] < 90)
pys, pxs = np.where(mask_pen)
print(f"Pen text exact bounds: X: {pxs.min()+420}..{pxs.max()+420}, Y: {pys.min()+660}..{pys.max()+660}")

from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
arr = np.array(img)

# Let's inspect the watch dial text directly in (850..1000, 250..370)
gold_watch = (arr[250:370, 850:1000, 0] > 160) & (arr[250:370, 850:1000, 1] > 120) & (arr[250:370, 850:1000, 2] < 90)
ys, xs = np.where(gold_watch)
print(f"Watch text: X={xs.min()+850}..{xs.max()+850}, Y={ys.min()+250}..{ys.max()+250}")

# Let's inspect the pen text in (500..700, 660..730)
gold_pen = (arr[660:730, 500:700, 0] > 160) & (arr[660:730, 500:700, 1] > 120) & (arr[660:730, 500:700, 2] < 90)
pys, pxs = np.where(gold_pen)
print(f"Pen text: X={pxs.min()+500}..{pxs.max()+500}, Y={pys.min()+660}..{pys.max()+660}")

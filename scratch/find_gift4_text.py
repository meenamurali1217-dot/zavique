from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
arr = np.array(img)

# Wallet text is on dark brown leather (R: 40..80, G: 20..50, B: 15..35)
# Text pixels are bright gold (R > 180, G > 140, B < 90)
# Look in wallet region x: 180..460, y: 400..680
wallet_text = (arr[400:680, 180:460, 0] > 170) & (arr[400:680, 180:460, 1] > 130) & (arr[400:680, 180:460, 2] < 90)
ys, xs = np.where(wallet_text)
if len(ys) > 0:
    print(f"Wallet gold text bounds: X: {xs.min() + 180}..{xs.max() + 180}, Y: {ys.min() + 400}..{ys.max() + 400}")

# Watch dial text is on black dial in x: 680..850, y: 280..420
watch_text = (arr[280:420, 680:850, 0] > 170) & (arr[280:420, 680:850, 1] > 130) & (arr[280:420, 680:850, 2] < 90)
wys, wxs = np.where(watch_text)
if len(wys) > 0:
    print(f"Watch dial gold text bounds: X: {wxs.min() + 680}..{wxs.max() + 680}, Y: {wys.min() + 280}..{wys.max() + 280}")

# Pen text is on black pen body in x: 380..580, y: 820..880
pen_text = (arr[820:880, 380:580, 0] > 170) & (arr[820:880, 380:580, 1] > 130) & (arr[820:880, 380:580, 2] < 90)
pys, pxs = np.where(pen_text)
if len(pys) > 0:
    print(f"Pen gold text bounds: X: {pxs.min() + 380}..{pxs.max() + 380}, Y: {pys.min() + 820}..{pys.max() + 820}")

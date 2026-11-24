from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp')
arr = np.array(img)

# On case: y: 280..420, x: 350..850
mask = (arr[280:420, 350:850, 0] > 160) & (arr[280:420, 350:850, 1] > 120) & (arr[280:420, 350:850, 2] < 90)
ys, xs = np.where(mask)
print(f"Case text exact bounds: X: {xs.min()+350}..{xs.max()+350}, Y: {ys.min()+280}..{ys.max()+280}")

# Separate EARLUX (upper) and FRAGRANCES (lower)
earlux_mask = mask & (np.arange(280, 420)[:, None] < 365)
e_ys, e_xs = np.where(earlux_mask)
print(f"EARLUX bounds: X: {e_xs.min()+350}..{e_xs.max()+350}, Y: {e_ys.min()+280}..{e_ys.max()+280}")

frag_mask = mask & (np.arange(280, 420)[:, None] >= 365)
f_ys, f_xs = np.where(frag_mask)
print(f"FRAGRANCES bounds: X: {f_xs.min()+350}..{f_xs.max()+350}, Y: {f_ys.min()+280}..{f_ys.max()+280}")

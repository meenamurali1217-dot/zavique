from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
arr = np.array(img)

# Find all gold text clusters
# On wallet:
# y between 400 and 700, x between 100 and 550
gold = (arr[:, :, 0] > 160) & (arr[:, :, 1] > 120) & (arr[:, :, 2] < 90)

# Wallet text
w_ys, w_xs = np.where(gold & (arr[:, :, 3] > 200) & (np.arange(800)[:, None] > 350) & (np.arange(800)[:, None] < 700) & (np.arange(1200) < 550))
print(f"Wallet gold pixels: X: {w_xs.min()}..{w_xs.max()}, Y: {w_ys.min()}..{w_ys.max()}")

# Watch dial text: x > 600, y between 200 and 450
watch_ys, watch_xs = np.where(gold & (arr[:, :, 3] > 200) & (np.arange(800)[:, None] > 200) & (np.arange(800)[:, None] < 450) & (np.arange(1200) > 600))
# Let's filter out the hour markers (which are at the outer ring) and focus on center text (x: 700..830)
c_mask = (watch_xs > 700) & (watch_xs < 830)
print(f"Watch text: X: {watch_xs[c_mask].min()}..{watch_xs[c_mask].max()}, Y: {watch_ys[c_mask].min()}..{watch_ys[c_mask].max()}")

# Pen text: y > 750, x between 300 and 700
pen_ys, pen_xs = np.where(gold & (arr[:, :, 3] > 200) & (np.arange(800)[:, None] > 750) & (np.arange(1200) > 300) & (np.arange(1200) < 700))
print(f"Pen text: X: {pen_xs.min()}..{pen_xs.max()}, Y: {pen_ys.min()}..{pen_ys.max()}")

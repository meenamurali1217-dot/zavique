from PIL import Image
import numpy as np

for name in ['4.webp', '5.webp']:
    p = f'assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/{name}'
    img = Image.open(p)
    arr = np.array(img)
    print(f"=== {name}: mode {img.mode}, size {img.size} ===")
    # Let's find gold pixels (R > 180, G > 140, B < 100)
    if img.mode == 'RGBA':
        gold_mask = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 140) & (arr[:, :, 2] < 100) & (arr[:, :, 3] > 200)
    else:
        gold_mask = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 140) & (arr[:, :, 2] < 100)
    ys, xs = np.where(gold_mask)
    if len(ys) > 0:
        print(f"Gold pixels range: X: {xs.min()}..{xs.max()}, Y: {ys.min()}..{ys.max()}")

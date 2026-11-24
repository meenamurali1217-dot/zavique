from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/3.webp')
arr = np.array(img)

# Dark text pixels (R < 50, G < 60, B < 50) in y: 550..850
mask = (arr[550:850, :, 0] < 50) & (arr[550:850, :, 1] < 60) & (arr[550:850, :, 2] < 50)

# Bottle 1 (left): x < 450
b1_y, b1_x = np.where(mask[:, :450])
print(f"Bottle 1 text: X={b1_x.min()}..{b1_x.max()}, Y={b1_y.min()+550}..{b1_y.max()+550}")

# Bottle 2 (center): x 450..850
b2_y, b2_x = np.where(mask[:, 450:850])
print(f"Bottle 2 text: X={b2_x.min()+450}..{b2_x.max()+450}, Y={b2_y.min()+550}..{b2_y.max()+550}")

# Bottle 3 (right): x > 850
b3_y, b3_x = np.where(mask[:, 850:])
print(f"Bottle 3 text: X={b3_x.min()+850}..{b3_x.max()+850}, Y={b3_y.min()+550}..{b3_y.max()+550}")

from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_home_cosmetics-category.jpg')
w, h = img.size
print(f"Compact size: {w} x {h}")

# Find center of the black compact circle and powder
# Crop center (x: 300..900, y: 100..700)
crop = img.crop((300, 100, 900, 700))
crop.save('scratch/compact_crop.png')
print("Saved compact crop to scratch/compact_crop.png")

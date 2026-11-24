from PIL import Image
import numpy as np

img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_menu_cosmetics-editorial.png')
arr = np.array(img)

# Print average RGB across rows in the center column (x=600) from y=800 to 1100
for y in range(800, 1100, 20):
    print(f"y={y}: RGB={arr[y, 600]}")

from PIL import Image

img = Image.open('assets/images/erlux/images_pages_menu_cosmetics-editorial.png')
# Crop the lower part of the tube
crop_box2 = (450, 700, 750, 950)
cropped2 = img.crop(crop_box2)
cropped2.save('scratch/lipstick_lower.png')

# Also crop the bullet tip
crop_box3 = (500, 10, 700, 250)
cropped3 = img.crop(crop_box3)
cropped3.save('scratch/lipstick_bullet.png')

print("Saved lower and bullet crops.")

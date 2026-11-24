from PIL import Image

img = Image.open('assets/images/erlux/images_pages_menu_cosmetics-editorial.png')
print(f"Size: {img.size}, Mode: {img.mode}")

# Let's crop the center region where the black band and bullet are
crop_box = (450, 450, 750, 850)
cropped = img.crop(crop_box)
cropped.save('scratch/lipstick_crop.png')
print("Cropped center saved to scratch/lipstick_crop.png")

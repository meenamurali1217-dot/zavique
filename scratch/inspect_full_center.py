from PIL import Image

img = Image.open('assets/images/erlux/images_pages_menu_cosmetics-editorial.png')
w, h = img.size

# Let's crop y=400 to 1100, x=450 to 750
cropped = img.crop((450, 400, 750, 1100))
cropped.save('scratch/lipstick_full_center.png')
print("Saved full center crop.")

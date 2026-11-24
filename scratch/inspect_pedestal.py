from PIL import Image

img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_home_cosmetics-category.jpg')
crop = img.crop((300, 600, 900, 950))
crop.save('scratch/pedestal_crop.png')
print("Saved pedestal crop.")

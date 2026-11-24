from PIL import Image

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp')
crop = img.crop((350, 240, 850, 470))
crop.save('scratch/gift5_case_crop.png')
print("Saved gift5 case crop.")

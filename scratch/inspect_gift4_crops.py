from PIL import Image

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')

c1 = img.crop((150, 450, 500, 720))
c1.save('scratch/gift4_wallet_crop.png')

c2 = img.crop((700, 300, 830, 410))
c2.save('scratch/gift4_watch_crop.png')

c3 = img.crop((350, 830, 600, 910))
c3.save('scratch/gift4_pen_crop.png')

print("Saved crops for gift4.")

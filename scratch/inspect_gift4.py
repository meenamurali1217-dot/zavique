from PIL import Image

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')
w, h = img.size
print(f"giftSets 4 size: {w} x {h}")

# Wallet logo crop (left side)
crop_wallet = img.crop((150, 400, 500, 700))
crop_wallet.save('scratch/wallet_logo_crop.png')

# Watch dial crop (right side)
crop_watch = img.crop((650, 250, 850, 450))
crop_watch.save('scratch/watch_dial_crop.png')

# Pen logo crop (bottom center)
crop_pen = img.crop((350, 800, 600, 920))
crop_pen.save('scratch/pen_logo_crop.png')

print("Crops saved for giftSets 4.")

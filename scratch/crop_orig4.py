from PIL import Image

# Use original backup
orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')

# 1. Wallet logo: x: 180..480, y: 400..650
orig.crop((180, 400, 480, 650)).save('scratch/orig4_wallet.png')

# 2. Watch 12 o'clock: x: 700..830, y: 280..420
orig.crop((700, 280, 830, 420)).save('scratch/orig4_watch.png')

# 3. Pen: x: 320..650, y: 640..750
orig.crop((320, 640, 650, 750)).save('scratch/orig4_pen.png')

print("Saved orig4 crops.")

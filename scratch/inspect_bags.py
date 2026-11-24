from PIL import Image

for name in ['1.webp', '2.webp']:
    img = Image.open(f'assets/images_backup_branding_upgrade/images/erlux_repo/bags/{name}')
    w, h = img.size
    print(f"Bag {name}: {w} x {h}")
    # The logo is in the upper-center of the bag body: x: 450..750, y: 350..650
    crop = img.crop((450, 400, 750, 650))
    crop.save(f'scratch/bag_{name}_crop.png')
    print(f"Saved scratch/bag_{name}_crop.png")

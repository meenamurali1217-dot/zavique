import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_cardholder():
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/1.webp').convert('RGBA')
    # Cardholder bounds in orig: x: 740..1190, y: 470..1060
    cardholder = orig.crop((730, 470, 1190, 1060))
    arr = np.array(cardholder)
    
    # Locate gold text inside cardholder
    gold = (arr[:, :, 0] > 160) & (arr[:, :, 1] > 120) & (arr[:, :, 2] < 90)
    ys, xs = np.where(gold)
    print(f"Cardholder gold text bounds: X={xs.min()}..{xs.max()}, Y={ys.min()}..{ys.max()}")
    
    cardholder.save('scratch/cardholder_isolated.png')

build_cardholder()

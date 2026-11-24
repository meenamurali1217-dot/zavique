import numpy as np
from PIL import Image, ImageDraw, ImageFont

def test_wallet():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Clean wallet text (X: 195..515, Y: 480..640)
    # The height is 160, width is 320
    # Clean donor from below at Y: 635..740 (height 105)
    donor1 = arr[635:740, 195:515, :]
    # Let's clone donor1 across Y: 480..640
    for y in range(480, 640):
        # sample row from donor
        src_y = 640 + ((y - 480) % 95)
        arr[y, 195:515] = arr[src_y, 195:515]
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    cx = 355
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 501), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 500), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 499), b_txt, fill=gold_light, font=font_brand)
    
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 563), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 562), s_txt, fill=gold_main, font=font_sub)
    
    crop = res_img.crop((150, 350, 550, 750))
    crop.save('scratch/wallet_test_fixed.png')
    print("Saved wallet_test_fixed.png")

test_wallet()

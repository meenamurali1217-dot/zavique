import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_flawless_gift4():
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(orig)
    
    # 1. Clean wallet:
    # "EARLUX" & "FRAGRANCES": y: 475..605, x: 240..530
    donor_w = arr[475:605, 75:200, :]
    pw = 530 - 240
    tiled_w = np.tile(donor_w, (1, int(np.ceil(pw / donor_w.shape[1])), 1))[:, :pw, :]
    for i in range(pw):
        alpha = 1.0
        if i < 10: alpha = i / 10.0
        elif i > pw - 8: alpha = (pw - i) / 8.0
        arr[475:605, 240 + i] = (tiled_w[:, i] * alpha + arr[475:605, 240 + i] * (1.0 - alpha)).astype(np.uint8)
        
    # 2. Clean watch dial:
    # Text EARLUX & FRAGRANCES is at y: 286..326, x: 872..978
    # Clean donor from x: 872..978, y: 205..235 (clean black dial above E crest)
    donor_dial = arr[205:235, 872:978, :]
    # Tile across 40 rows
    tiled_dial = np.tile(donor_dial, (2, 1, 1))[:40, :, :]
    arr[286:326, 872:978] = tiled_dial
    
    # 3. Clean pen:
    # EARLUX & FRAGRANCES on pen is at y: 675..725, x: 535..645
    for y in range(675, 725):
        ny = (y - 675) / 50.0
        spec = np.exp(-((ny - 0.5) ** 2) / (2 * 0.16 ** 2)) * 75
        val = int(8 + spec)
        arr[y, 535:645, :3] = val
        arr[y, 535:645, 3] = 255
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # 1. Redraw Wallet text (centered at cx = 358)
    cx_w = 358
    font_w_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_w_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_w_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx_w - bw // 2 + 1, 496), b_txt, fill=gold_shadow, font=font_w_brand)
    draw.text((cx_w - bw // 2, 495), b_txt, fill=gold_main, font=font_w_brand)
    draw.text((cx_w - bw // 2, 494), b_txt, fill=gold_light, font=font_w_brand)
    
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_w_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx_w - sw // 2 + 1, 556), s_txt, fill=gold_shadow, font=font_w_sub)
    draw.text((cx_w - sw // 2, 555), s_txt, fill=gold_main, font=font_w_sub)
    
    # 2. Redraw Watch dial text (centered at cx = 925)
    cx_watch = 925
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 19)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 290), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 312), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Redraw Pen text (to the right of the E crest at x=540)
    font_pen = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 16)
    font_pen_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    
    draw.text((542, 680), "E R L U X", fill=gold_main, font=font_pen)
    draw.text((544, 703), "G E N E V A", fill=gold_light, font=font_pen_sub)
    
    res_img.save('scratch/gift4_flawless.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 flawless saved successfully!")

build_flawless_gift4()

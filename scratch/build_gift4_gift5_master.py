import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_perfect_gift5():
    # Always load from pristine backup
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    arr = np.array(orig)
    
    # 1. Clean EARLUX & FRAGRANCES on the case (x: 480..720, y: 308..371)
    donor = arr[308:371, 200:320, :] # clean leather on the left
    pw = 720 - 480
    tiled = np.tile(donor, (1, int(np.ceil(pw / donor.shape[1])), 1))[:, :pw, :]
    
    for i in range(pw):
        alpha = 1.0
        if i < 15: alpha = i / 15.0
        elif i > pw - 15: alpha = (pw - i) / 15.0
        arr[308:371, 480 + i] = (tiled[:, i] * alpha + arr[308:371, 480 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    cx = 600
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E R L U X text at y = 314
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 315), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 314), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 313), b_txt, fill=gold_light, font=font_brand)
    
    # E Y E W E A R text at y = 352
    s_txt = "E Y E W E A R"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 353), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 352), s_txt, fill=gold_main, font=font_sub)
    
    res_img.save('scratch/gift5_master.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/5.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png', 'PNG')
    print("giftSets 5 master saved!")

def build_perfect_gift4():
    # Always load from pristine backup
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(orig)
    
    # 1. Clean wallet (x: 240..485, y: 475..605)
    donor_w = arr[475:605, 80:200, :]
    pw = 485 - 240
    tiled_w = np.tile(donor_w, (1, int(np.ceil(pw / donor_w.shape[1])), 1))[:, :pw, :]
    for i in range(pw):
        alpha = 1.0
        if i < 15: alpha = i / 15.0
        elif i > pw - 15: alpha = (pw - i) / 15.0
        arr[475:605, 240 + i] = (tiled_w[:, i] * alpha + arr[475:605, 240 + i] * (1.0 - alpha)).astype(np.uint8)
        
    # 2. Clean watch dial: EARLUX & FRAGRANCES is at y: 295..345, x: 870..980
    donor_dial = arr[210:255, 870:980, :] # clean dial above E crest
    arr[295:340, 870:980] = donor_dial
    
    # 3. Clean pen: EARLUX & FRAGRANCES is at y: 675..725, x: 535..645
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
    
    # 1. Redraw Wallet text (centered at cx = 362)
    cx_w = 362
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
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 20)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 298), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 324), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Redraw Pen text
    font_pen = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 18)
    font_pen_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 10)
    
    p_brand = "E R L U X"
    draw.text((545, 683), p_brand, fill=gold_main, font=font_pen)
    p_sub = "G E N E V A"
    draw.text((547, 706), p_sub, fill=gold_light, font=font_pen_sub)
    
    res_img.save('scratch/gift4_master.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 master saved!")

build_perfect_gift5()
build_perfect_gift4()

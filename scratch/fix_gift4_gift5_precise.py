import numpy as np
from PIL import Image, ImageDraw, ImageFont

def fix_gift5_precise():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    arr = np.array(img)
    
    # Text bounds on case:
    # y: 305 to 388, x: 390 to 810
    # Clean donor from x: 200..380 at y: 305..388
    donor = arr[305:388, 200:380, :]
    pw = 810 - 390
    tiled = np.tile(donor, (1, int(np.ceil(pw / donor.shape[1])), 1))[:, :pw, :]
    
    for i in range(pw):
        alpha = 1.0
        if i < 20: alpha = i / 20.0
        elif i > pw - 20: alpha = (pw - i) / 20.0
        arr[305:388, 390 + i] = (tiled[:, i] * alpha + arr[305:388, 390 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    cx = 600
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # E R L U X text at y = 312
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 313), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 312), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 311), b_txt, fill=gold_light, font=font_brand)
    
    # E Y E W E A R text at y = 365
    s_txt = "E Y E W E A R"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 366), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 365), s_txt, fill=gold_main, font=font_sub)
    
    res_img.save('scratch/gift5_perfect.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/5.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png', 'PNG')
    print("giftSets 5 perfected!")

def fix_gift4_precise():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Wallet: text EARLUX FRAGRANCES is at y: 480..570, x: 200..460
    # Clean leather donor from y: 575..665, x: 200..460
    donor_wallet = arr[575:665, 200:460, :]
    arr[480:570, 200:460] = donor_wallet
    
    # 2. Watch dial: text is at y: 285..325, x: 825..935
    # Clean donor from x: 825..935, y: 330..370
    donor_watch = arr[330:370, 825:935, :]
    # Or black dial base color
    arr[285:325, 825:935] = arr[250:290, 825:935] # sample clean dial above
    
    # 3. Pen: text is at y: 685..725, x: 440..630
    # Clean black pen enamel
    # Pen cylindrical highlight
    for y in range(685, 725):
        ny = (y - 685) / 40.0
        spec = np.exp(-((ny - 0.5) ** 2) / (2 * 0.15 ** 2)) * 80
        val = int(8 + spec)
        arr[y, 440:630, :3] = val
        arr[y, 440:630, 3] = 255
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # 1. Wallet: center x = 330
    cx_w = 330
    font_w_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_w_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_w_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx_w - bw // 2 + 1, 491), b_txt, fill=gold_shadow, font=font_w_brand)
    draw.text((cx_w - bw // 2, 490), b_txt, fill=gold_main, font=font_w_brand)
    draw.text((cx_w - bw // 2, 489), b_txt, fill=gold_light, font=font_w_brand)
    
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_w_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx_w - sw // 2 + 1, 545), s_txt, fill=gold_shadow, font=font_w_sub)
    draw.text((cx_w - sw // 2, 544), s_txt, fill=gold_main, font=font_w_sub)
    
    # 2. Watch dial: center x = 880
    cx_watch = 880
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 17)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 8)
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 292), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 312), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Pen: center x = 535
    cx_pen = 535
    font_pen_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 14)
    font_pen_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 8)
    
    p_brand = "E R L U X"
    bbox_pb = draw.textbbox((0, 0), p_brand, font=font_pen_brand)
    pbw = bbox_pb[2] - bbox_pb[0]
    draw.text((cx_pen - pbw // 2, 692), p_brand, fill=gold_main, font=font_pen_brand)
    
    p_sub = "G E N E V A"
    bbox_ps = draw.textbbox((0, 0), p_sub, font=font_pen_sub)
    psw = bbox_ps[2] - bbox_ps[0]
    draw.text((cx_pen - psw // 2, 709), p_sub, fill=gold_light, font=font_pen_sub)
    
    res_img.save('scratch/gift4_perfect.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 perfected!")

fix_gift5_precise()
fix_gift4_precise()

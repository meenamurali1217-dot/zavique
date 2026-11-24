import numpy as np
from PIL import Image, ImageDraw, ImageFont

def fix_gift5_clean():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    arr = np.array(img)
    
    # Text on case: EARLUX is at y: 280..345, FRAGRANCES is at y: 350..370, x: 360..845
    # The sunglasses frame top bar starts at y=372!
    # So we strictly limit our patch to y: 280..370
    donor = arr[280:370, 180:340, :] # clean leather on the left
    pw = 850 - 350
    tiled = np.tile(donor, (1, int(np.ceil(pw / donor.shape[1])), 1))[:, :pw, :]
    
    # Feather horizontal edges
    for i in range(pw):
        alpha = 1.0
        if i < 20: alpha = i / 20.0
        elif i > pw - 20: alpha = (pw - i) / 20.0
        arr[280:370, 350 + i] = (tiled[:, i] * alpha + arr[280:370, 350 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    cx = 600
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 52)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # 1. E crest
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 283), e_txt, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 282), e_txt, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 281), e_txt, fill=gold_light, font=font_e)
    
    # 2. E R L U X text
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 331), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 330), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 329), b_txt, fill=gold_light, font=font_brand)
    
    # Save
    res_img.save('scratch/gift5_clean.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/5.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png', 'PNG')
    print("giftSets 5 clean saved successfully!")

def fix_gift4_clean():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Clean wallet:
    # "EARLUX" is at y: 480..545, x: 204..500
    # "FRAGRANCES" is at y: 545..580, x: 240..460
    # Clean donor from the left at y: 450..590, x: 80..200
    donor_left = arr[450:590, 80:200, :]
    pw = 510 - 200
    tiled_w = np.tile(donor_left, (1, int(np.ceil(pw / donor_left.shape[1])), 1))[:, :pw, :]
    
    for i in range(pw):
        alpha = 1.0
        if i < 15: alpha = i / 15.0
        elif i > pw - 15: alpha = (pw - i) / 15.0
        arr[450:590, 200 + i] = (tiled_w[:, i] * alpha + arr[450:590, 200 + i] * (1.0 - alpha)).astype(np.uint8)
        
    # 2. Clean watch dial:
    # Center is x=765, y=365
    # Text EARLUX FRAGRANCES is at y: 350..400, x: 710..820
    # Clean donor from x: 710..820, y: 260..310 (clean dial above hands)
    donor_dial = arr[260:310, 710:820, :]
    arr[350:400, 710:820] = donor_dial
    
    # 3. Clean pen:
    # Text is at x: 470..610, y: 690..725
    # Black enamel cylinder
    for y in range(690, 725):
        ny = (y - 690) / 35.0
        spec = np.exp(-((ny - 0.5) ** 2) / (2 * 0.15 ** 2)) * 75
        val = int(8 + spec)
        arr[y, 470:610, :3] = val
        arr[y, 470:610, 3] = 255
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # 1. Wallet:
    cx_w = 345
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 72)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 42)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    # E crest at y=400
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx_w - ew // 2 + 1, 401), e_txt, fill=gold_shadow, font=font_e)
    draw.text((cx_w - ew // 2, 400), e_txt, fill=gold_main, font=font_e)
    draw.text((cx_w - ew // 2, 399), e_txt, fill=gold_light, font=font_e)
    
    # ERLUX text at y=485
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx_w - bw // 2 + 1, 486), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx_w - bw // 2, 485), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx_w - bw // 2, 484), b_txt, fill=gold_light, font=font_brand)
    
    # EXECUTIVE at y=542
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx_w - sw // 2 + 1, 543), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx_w - sw // 2, 542), s_txt, fill=gold_main, font=font_sub)
    
    # 2. Watch dial:
    cx_watch = 766
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 19)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 360), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 384), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Pen:
    cx_pen = 540
    font_pen = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 14)
    font_pen_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 8)
    p_txt = "E R L U X"
    bbox_p = draw.textbbox((0, 0), p_txt, font=font_pen)
    pw_txt = bbox_p[2] - bbox_p[0]
    draw.text((cx_pen - pw_txt // 2, 698), p_txt, fill=gold_main, font=font_pen)
    draw.text((cx_pen - 20, 713), "G E N E V A", fill=gold_light, font=font_pen_sub)
    
    res_img.save('scratch/gift4_clean.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 clean saved successfully!")

fix_gift5_clean()
fix_gift4_clean()

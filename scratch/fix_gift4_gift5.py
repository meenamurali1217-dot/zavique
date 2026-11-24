import numpy as np
from PIL import Image, ImageDraw, ImageFont

def fix_gift5():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    arr = np.array(img)
    
    # Text area on brown leather case: x: 390..790, y: 350..450
    # Clean the text area using clean leather from x: 200..380 and x: 800..980 at y: 350..450
    # The brown leather has a rich pebbled texture and vertical gradient
    cx = 590
    
    # We can patch the text "EARLUX FRAGRANCES"
    # EARLUX text is at y ~ 360..425, FRAGRANCES is at y ~ 425..455
    # Let's clone clean leather patch from x: 240..400
    donor_patch = arr[355:460, 240:400, :]
    # Tile it smoothly across x: 400..780
    pw = 780 - 400
    ph = 460 - 355
    tiled = np.tile(donor_patch, (1, int(np.ceil(pw / donor_patch.shape[1])), 1))[:, :pw, :]
    
    # Apply soft edge feathering on x
    for i in range(pw):
        alpha = 1.0
        if i < 20:
            alpha = i / 20.0
        elif i > pw - 20:
            alpha = (pw - i) / 20.0
        arr[355:460, 400 + i] = (tiled[:, i] * alpha + arr[355:460, 400 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # E R L U X text at y = 368
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 369), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 368), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 367), b_txt, fill=gold_light, font=font_brand)
    
    # E Y E W E A R text at y = 428
    s_txt = "E Y E W E A R"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 429), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 428), s_txt, fill=gold_main, font=font_sub)
    
    res_img.save('scratch/gift5_fixed.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/5.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png', 'PNG')
    print("giftSets 5 fixed successfully!")

def fix_gift4():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Wallet logo: center x ~ 330
    # EARLUX text is at y: 560..630, FRAGRANCES is at y: 630..675, x: 200..460
    donor_wallet = arr[560:675, 450:570, :]
    pw = 450 - 210
    tiled_w = np.tile(donor_wallet, (1, int(np.ceil(pw / donor_wallet.shape[1])), 1))[:, :pw, :]
    for i in range(pw):
        alpha = 1.0
        if i < 20: alpha = i / 20.0
        elif i > pw - 20: alpha = (pw - i) / 20.0
        arr[560:675, 210 + i] = (tiled_w[:, i] * alpha + arr[560:675, 210 + i] * (1.0 - alpha)).astype(np.uint8)
        
    # 2. Watch dial text: center x ~ 765
    # EARLUX text is at y: 340..375, FRAGRANCES is at y: 375..405, x: 710..820
    # Clean black sunburst dial from y: 340..405, x: 670..710
    donor_watch = arr[340:405, 680:715, :]
    ww = 820 - 710
    tiled_watch = np.tile(donor_watch, (1, int(np.ceil(ww / donor_watch.shape[1])), 1))[:, :ww, :]
    for i in range(ww):
        alpha = 1.0
        if i < 10: alpha = i / 10.0
        elif i > ww - 10: alpha = (ww - i) / 10.0
        arr[340:405, 710 + i] = (tiled_watch[:, i] * alpha + arr[340:405, 710 + i] * (1.0 - alpha)).astype(np.uint8)
        
    # 3. Pen text: x ~ 430..550, y: 720..745
    donor_pen = arr[720:745, 330:380, :]
    pen_w = 550 - 430
    tiled_pen = np.tile(donor_pen, (1, int(np.ceil(pen_w / donor_pen.shape[1])), 1))[:, :pen_w, :]
    for i in range(pen_w):
        alpha = 1.0
        if i < 10: alpha = i / 10.0
        elif i > pen_w - 10: alpha = (pen_w - i) / 10.0
        arr[720:745, 430 + i] = (tiled_pen[:, i] * alpha + arr[720:745, 430 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # 1. Redraw Wallet text
    font_w_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_w_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    cx_w = 330
    
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_w_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx_w - bw // 2 + 1, 574), b_txt, fill=gold_shadow, font=font_w_brand)
    draw.text((cx_w - bw // 2, 573), b_txt, fill=gold_main, font=font_w_brand)
    draw.text((cx_w - bw // 2, 572), b_txt, fill=gold_light, font=font_w_brand)
    
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_w_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx_w - sw // 2 + 1, 638), s_txt, fill=gold_shadow, font=font_w_sub)
    draw.text((cx_w - sw // 2, 637), s_txt, fill=gold_main, font=font_w_sub)
    
    # 2. Redraw Watch dial text
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 20)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 10)
    cx_watch = 766
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 350), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 376), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Redraw Pen text
    font_pen = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 13)
    font_pen_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 8)
    draw.text((450, 722), "E R L U X", fill=gold_main, font=font_pen)
    draw.text((450, 736), "G E N E V A", fill=gold_light, font=font_pen_sub)
    
    res_img.save('scratch/gift4_fixed.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 fixed successfully!")

fix_gift5()
fix_gift4()

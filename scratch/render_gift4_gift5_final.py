import numpy as np
from PIL import Image, ImageDraw, ImageFont

def render_gift5():
    # Load original backup
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Clean the text area on brown leather case:
    # "EARLUX" text is at x: 490..710, y: 310..365
    # "FRAGRANCES" text is at x: 350..855, y: 365..415
    # The clean leather is immediately adjacent to the left (x: 200..340, y: 310..415)
    # and right (x: 860..1000, y: 310..415)
    
    # We take clean donor slices from x: 200..340 at y: 310..415
    donor_left = arr[310:415, 200:340, :]
    pw = 860 - 345
    tiled = np.tile(donor_left, (1, int(np.ceil(pw / donor_left.shape[1])), 1))[:, :pw, :]
    
    # Blend tiled patch across x: 345..860, y: 310..415 with horizontal feathering
    for i in range(pw):
        alpha = 1.0
        if i < 15: alpha = i / 15.0
        elif i > pw - 15: alpha = (pw - i) / 15.0
        arr[310:415, 345 + i] = (tiled[:, i] * alpha + arr[310:415, 345 + i] * (1.0 - alpha)).astype(np.uint8)
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    cx = 600
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E R L U X text at y = 320
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw // 2 + 1, 321), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw // 2, 320), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw // 2, 319), b_txt, fill=gold_light, font=font_brand)
    
    # E Y E W E A R text at y = 372
    s_txt = "E Y E W E A R"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 373), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 372), s_txt, fill=gold_main, font=font_sub)
    
    res_img.save('scratch/gift5_final.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/5.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png', 'PNG')
    print("giftSets 5 final saved successfully!")

def render_gift4():
    # Load original backup
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp').convert('RGBA')
    arr = np.array(img)
    
    # 1. Wallet:
    # "EARLUX" is at x: 267..459, y: 480..525
    # "FRAGRANCES" is at x: 267..459, y: 525..550
    # Clean donor from below at y: 560..635, x: 250..470
    donor_w = arr[560:635, 250:470, :]
    arr[480:555, 250:470] = donor_w
    
    # 2. Watch dial:
    # Dial text at x: 705..849, y: 320..419
    # In watch dial, center is x = 765
    # The E crest is at y: 320..355
    # EARLUX is at y: 355..380
    # FRAGRANCES is at y: 380..400
    # Let's clean y: 355..405, x: 710..820 using clean dial from x: 710..820, y: 270..320
    # or radial dial fill
    dial_bg = arr[270:320, 710:820, :]
    arr[355:405, 710:820] = dial_bg
    
    # 3. Pen:
    # Text is at x: 476..606, y: 697..718
    # Clean donor from x: 350..450, y: 697..718
    donor_pen = arr[697:718, 350:450, :]
    pw_pen = 615 - 470
    tiled_p = np.tile(donor_pen, (1, int(np.ceil(pw_pen / donor_pen.shape[1])), 1))[:, :pw_pen, :]
    arr[697:718, 470:615] = tiled_p
    
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # 1. Redraw Wallet text
    cx_w = 363 # center of E crest on wallet
    font_w_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_w_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
    
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_w_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw.text((cx_w - bw // 2 + 1, 489), b_txt, fill=gold_shadow, font=font_w_brand)
    draw.text((cx_w - bw // 2, 488), b_txt, fill=gold_main, font=font_w_brand)
    draw.text((cx_w - bw // 2, 487), b_txt, fill=gold_light, font=font_w_brand)
    
    s_txt = "E X E C U T I V E"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_w_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx_w - sw // 2 + 1, 536), s_txt, fill=gold_shadow, font=font_w_sub)
    draw.text((cx_w - sw // 2, 535), s_txt, fill=gold_main, font=font_w_sub)
    
    # 2. Redraw Watch dial text
    cx_watch = 766
    font_watch_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 19)
    font_watch_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    
    w_brand = "E R L U X"
    bbox_wb = draw.textbbox((0, 0), w_brand, font=font_watch_brand)
    wbw = bbox_wb[2] - bbox_wb[0]
    draw.text((cx_watch - wbw // 2, 362), w_brand, fill=gold_main, font=font_watch_brand)
    
    w_sub = "C H R O N O G R A P H"
    bbox_ws = draw.textbbox((0, 0), w_sub, font=font_watch_sub)
    wsw = bbox_ws[2] - bbox_ws[0]
    draw.text((cx_watch - wsw // 2, 386), w_sub, fill=gold_light, font=font_watch_sub)
    
    # 3. Redraw Pen text
    cx_pen = 540
    font_pen = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 13)
    p_txt = "ERLUX"
    bbox_p = draw.textbbox((0, 0), p_txt, font=font_pen)
    pw = bbox_p[2] - bbox_p[0]
    draw.text((cx_pen - pw // 2, 700), p_txt, fill=gold_main, font=font_pen)
    
    res_img.save('scratch/gift4_final.webp', 'WEBP')
    res_img.save('assets/images/erlux_repo/giftSets/4.webp', 'WEBP')
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png', 'PNG')
    print("giftSets 4 final saved successfully!")

render_gift5()
render_gift4()

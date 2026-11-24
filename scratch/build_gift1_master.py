import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_perfect_gift1():
    # 1. Prepare retouched cardholder
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/1.webp').convert('RGBA')
    # Cardholder starts at x=758, y=490, w=422, h=570
    card = orig.crop((758, 490, 1180, 1060))
    arr_c = np.array(card)
    
    # Text EARLUX & FRAGRANCES inside card crop:
    # y: 320..440, x: 80..340
    # Clean donor from clean leather below: y: 445..545, x: 80..340
    donor_c = arr_c[445:565, 80:340, :]
    pw = 340 - 80
    ph = 440 - 320
    tiled_c = np.tile(donor_c, (2, 1, 1))[:ph, :, :]
    
    for i in range(pw):
        alpha = 1.0
        if i < 15: alpha = i / 15.0
        elif i > pw - 15: alpha = (pw - i) / 15.0
        arr_c[320:440, 80 + i] = (tiled_c[:, i] * alpha + arr_c[320:440, 80 + i] * (1.0 - alpha)).astype(np.uint8)
        
    card_clean = Image.fromarray(arr_c)
    draw_c = ImageDraw.Draw(card_clean)
    
    cx = 215 # center of card
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # ERLUX
    b_txt = "E R L U X"
    bbox_b = draw_c.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    draw_c.text((cx - bw // 2 + 1, 335), b_txt, fill=gold_shadow, font=font_brand)
    draw_c.text((cx - bw // 2, 334), b_txt, fill=gold_main, font=font_brand)
    draw_c.text((cx - bw // 2, 333), b_txt, fill=gold_light, font=font_brand)
    
    # CHAIRMAN SPECIAL
    s_txt = "CHAIRMAN  SPECIAL"
    bbox_s = draw_c.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw_c.text((cx - sw // 2 + 1, 395), s_txt, fill=gold_shadow, font=font_sub)
    draw_c.text((cx - sw // 2, 394), s_txt, fill=gold_main, font=font_sub)
    
    # 2. Prepare canvas: 1200 x 1183
    # Use clean white/cream gradient studio background
    canvas = Image.new('RGBA', (1200, 1183), (255, 255, 255, 255))
    
    # Soft warm studio reflection/lighting
    draw_bg = ImageDraw.Draw(canvas)
    for y in range(800, 1183):
        ny = (y - 800) / 383.0
        v = int(255 - 12 * ny)
        draw_bg.line([(0, y), (1200, y)], fill=(v, v - 2, v - 4, 255))
        
    # 3. Load ERLUX NOIR opaque flacon
    noir_hero = Image.open('assets/images/erlux_campaign/erlux_noir.jpg').convert('RGBA')
    # Resize to fit beautifully on the left/center
    # Main bottle: 650 x 650
    bottle_main = noir_hero.resize((700, 700), Image.Resampling.LANCZOS)
    
    # Second bottle (ERLUX SOVEREIGN / Emerald): 520 x 520 for duo effect
    sov_hero = Image.open('assets/images/erlux_campaign/erlux_sovereign.jpg').convert('RGBA')
    bottle_second = sov_hero.resize((520, 520), Image.Resampling.LANCZOS)
    
    # Paste second bottle on the left
    canvas.paste(bottle_second, (40, 480))
    # Paste main NOIR bottle in the center
    canvas.paste(bottle_main, (330, 360))
    # Paste cardholder on the right
    canvas.paste(card_clean, (820, 480))
    
    # Add subtle contact shadows underneath
    # Save target files
    canvas.save('scratch/gift1_master.webp', 'WEBP', quality=95)
    canvas.save('assets/images/erlux_repo/giftSets/1.webp', 'WEBP', quality=95)
    canvas.save('assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png', 'PNG')
    print("giftSets 1 master built and saved!")

build_perfect_gift1()

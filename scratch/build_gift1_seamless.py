import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def build_seamless_gift1():
    # 1. Base image: ERLUX NOIR campaign image (1200 x 1200)
    base = Image.open('assets/images/erlux_campaign/erlux_noir.jpg').convert('RGBA')
    # Target size: 1200 x 1183 (crop 17px from bottom)
    base = base.crop((0, 0, 1200, 1183))
    
    # 2. Prepare cardholder
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/1.webp').convert('RGBA')
    card = orig.crop((758, 490, 1180, 1060)) # size 422 x 570
    arr_c = np.array(card)
    
    # Clean text: EARLUX & FRAGRANCES inside card crop: y: 320..440, x: 80..340
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
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 40)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E R L U X
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
    
    # Resize cardholder to scale nicely next to the bottle
    card_scaled = card_clean.resize((360, 485), Image.Resampling.LANCZOS)
    
    # Create soft contact shadow on marble
    shadow = Image.new('RGBA', (1200, 1183), (0, 0, 0, 0))
    draw_sh = ImageDraw.Draw(shadow)
    # Cardholder position: x=780, y=550
    draw_sh.ellipse([770, 1010, 1150, 1060], fill=(40, 30, 20, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    
    base = Image.alpha_composite(base, shadow)
    # Paste cardholder with alpha mask
    base.paste(card_scaled, (780, 550), card_scaled)
    
    # Convert to RGB / clean
    final_img = base.convert('RGB')
    final_img.save('scratch/gift1_seamless.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux_repo/giftSets/1.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png', 'PNG')
    print("giftSets 1 seamless master built and saved!")

build_seamless_gift1()

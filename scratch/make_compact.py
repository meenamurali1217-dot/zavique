import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def upgrade_compact():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_home_cosmetics-category.jpg').convert('RGBA')
    w, h = img.size
    
    # Powder cake center: x=580, y=380
    cx, cy = 585, 380
    
    draw = ImageDraw.Draw(img)
    
    # Let's create an embossed effect into the powder cake
    # Powder color is approx (240, 195, 155)
    shadow_col = (185, 140, 100, 220)
    light_col = (255, 230, 205, 240)
    gold_tone = (165, 120, 65, 240)
    
    # 1. Concentric circular press lines in powder
    for r in [225, 215, 190]:
        draw.arc([cx - r, cy - r, cx + r, cy + r], 0, 360, fill=shadow_col, width=1)
        draw.arc([cx - r + 1, cy - r + 1, cx + r + 1, cy + r + 1], 0, 360, fill=light_col, width=1)
        
    # 2. Ornate E Crest in the center
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 96)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
    font_paris = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 16)
    
    # E crest at cy - 80
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    ey = cy - 95
    # Deboss: top-left shadow, bottom-right highlight
    draw.text((cx - ew // 2, ey), e_txt, fill=shadow_col, font=font_e)
    draw.text((cx - ew // 2 + 2, ey + 2), e_txt, fill=light_col, font=font_e)
    draw.text((cx - ew // 2 + 1, ey + 1), e_txt, fill=gold_tone, font=font_e)
    
    # Flourish wings beside E
    draw.line([(cx - 75, ey + 45), (cx - 35, ey + 45)], fill=shadow_col, width=2)
    draw.line([(cx - 74, ey + 46), (cx - 34, ey + 46)], fill=light_col, width=2)
    draw.line([(cx + 35, ey + 45), (cx + 75, ey + 45)], fill=shadow_col, width=2)
    draw.line([(cx + 36, ey + 46), (cx + 76, ey + 46)], fill=light_col, width=2)
    
    # E R L U X brand text
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    by = cy + 25
    draw.text((cx - bw // 2, by), b_txt, fill=shadow_col, font=font_brand)
    draw.text((cx - bw // 2 + 2, by + 2), b_txt, fill=light_col, font=font_brand)
    draw.text((cx - bw // 2 + 1, by + 1), b_txt, fill=gold_tone, font=font_brand)
    
    # B E A U T Y
    s_txt = "—  B E A U T Y  —"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    sy = cy + 85
    draw.text((cx - sw // 2, sy), s_txt, fill=shadow_col, font=font_sub)
    draw.text((cx - sw // 2 + 1, sy + 1), s_txt, fill=light_col, font=font_sub)
    
    # P A R I S
    p_txt = "GILDED HORIZON"
    bbox_p = draw.textbbox((0, 0), p_txt, font=font_paris)
    pw = bbox_p[2] - bbox_p[0]
    py = cy + 120
    draw.text((cx - pw // 2, py), p_txt, fill=shadow_col, font=font_paris)
    draw.text((cx - pw // 2 + 1, py + 1), p_txt, fill=light_col, font=font_paris)
    
    # 3. Gold engraving on the rose-gold pedestal rim below (y ~ 780..820)
    font_rim = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    rim_txt = "E R L U X"
    bbox_r = draw.textbbox((0, 0), rim_txt, font=font_rim)
    rw = bbox_r[2] - bbox_r[0]
    ry = 770
    
    # Metal engraving effect (subtle recessed metallic tone)
    draw.text((cx - rw // 2, ry), rim_txt, fill=(120, 75, 45, 180), font=font_rim)
    draw.text((cx - rw // 2 + 1, ry + 1), rim_txt, fill=(255, 230, 205, 200), font=font_rim)
    draw.text((cx - rw // 2, ry + 2), rim_txt, fill=(150, 95, 60, 220), font=font_rim)
    
    font_rim_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
    rim_sub = "HAUTE  COSMETICS"
    bbox_rs = draw.textbbox((0, 0), rim_sub, font=font_rim_sub)
    rsw = bbox_rs[2] - bbox_rs[0]
    draw.text((cx - rsw // 2, ry + 46), rim_sub, fill=(130, 80, 50, 180), font=font_rim_sub)
    draw.text((cx - rsw // 2 + 1, ry + 47), rim_sub, fill=(255, 225, 200, 190), font=font_rim_sub)

    final_img = img.convert('RGB')
    final_img.save('scratch/compact_upgraded.jpg', 'JPEG', quality=95)
    # Overwrite the target file
    final_img.save('assets/images/erlux/images_pages_home_cosmetics-category.jpg', 'JPEG', quality=95)
    print("Compact upgraded successfully!")

upgrade_compact()

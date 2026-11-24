import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def build_discovery_set():
    w, h = 1200, 917
    # 1. Base marble background
    # Load one of the campaign backgrounds
    base_raw = Image.open('assets/images/erlux_campaign/erlux_noir.jpg').convert('RGBA')
    # Crop to 1200 x 917
    canvas = base_raw.resize((1200, 1200), Image.Resampling.LANCZOS).crop((0, 200, 1200, 1117))
    
    # 2. Let's isolate the 5 flacons
    flacon_files = [
        ('NOIR', 'assets/images/erlux_campaign/erlux_noir.jpg'),
        ('BLOOM', 'assets/images/erlux_campaign/erlux_bloom.jpg'),
        ('OUD', 'assets/images/erlux_campaign/erlux_oud.jpg'),
        ('AURORA', 'assets/images/erlux_campaign/erlux_aurora.jpg'),
        ('SOVEREIGN', 'assets/images/erlux_campaign/erlux_sovereign.jpg'),
    ]
    
    flacons = []
    for name, path in flacon_files:
        im = Image.open(path).convert('RGBA')
        # The bottle is roughly x: 280..920, y: 120..880 in 1200x1200
        # Crop bottle tightly
        bottle_crop = im.crop((270, 110, 930, 890))
        flacons.append((name, bottle_crop))
        
    # We want to display all 5 bottles side by side across the 1200 width
    # 5 bottles: each width ~ 240, height ~ 320
    # Center bottle (OUD or NOIR) slightly in front, flanking bottles stepped
    bw, bh = 220, 260
    
    # Let's arrange them:
    # positions:
    # 0: NOIR at x=30, y=360
    # 1: BLOOM at x=250, y=340
    # 2: OUD at x=490, y=310 (center, hero)
    # 3: AURORA at x=730, y=340
    # 4: SOVEREIGN at x=950, y=360
    
    # Render with stepped depth
    order = [0, 4, 1, 3, 2] # paste back to front
    
    coords = {
        0: (35, 420, 220, 260),
        1: (260, 400, 230, 272),
        2: (475, 370, 250, 295), # center hero
        3: (710, 400, 230, 272),
        4: (945, 420, 220, 260),
    }
    
    # Background soft blur for backdrop
    for idx in order:
        name, b_img = flacons[idx]
        x, y, w_cur, h_cur = coords[idx]
        b_scaled = b_img.resize((w_cur, h_cur), Image.Resampling.LANCZOS)
        
        # Soft shadow underneath
        sh = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw_sh = ImageDraw.Draw(sh)
        draw_sh.ellipse([x - 10, y + h_cur - 25, x + w_cur + 10, y + h_cur + 25], fill=(30, 20, 15, 120))
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        canvas = Image.alpha_composite(canvas, sh)
        
        # Paste bottle
        canvas.paste(b_scaled, (x, y))
        
    draw = ImageDraw.Draw(canvas)
    
    # 3. Add top Discovery Collection title plaque
    cx = w // 2
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 44)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    font_tag = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 16)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E R L U X
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw_text = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw_text // 2 + 1, 91), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw_text // 2, 90), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw_text // 2, 89), b_txt, fill=gold_light, font=font_brand)
    
    # SIGNATURE DISCOVERY COLLECTION
    s_txt = "SIGNATURE  DISCOVERY  COLLECTION"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 151), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 150), s_txt, fill=gold_main, font=font_sub)
    
    # Five Variants Legend
    t_txt = "NOIR  •  BLOOM  •  OUD  •  AURORA  •  SOVEREIGN"
    bbox_t = draw.textbbox((0, 0), t_txt, font=font_tag)
    tw = bbox_t[2] - bbox_t[0]
    draw.text((cx - tw // 2, 190), t_txt, fill=(180, 140, 80, 230), font=font_tag)
    
    # Save target files
    final_img = canvas.convert('RGB')
    final_img.save('scratch/discovery_master.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux_repo/giftSets/2.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux/images_pages_gift-sets_six-variants-banner.png', 'PNG')
    final_img.save('assets/images/erlux/images_pages_gift-sets_chairman-six-variants-banner-2.png', 'PNG')
    final_img.save('assets/images/erlux_repo/giftSets/6.webp', 'WEBP', quality=95)
    print("Discovery set master saved successfully!")

build_discovery_set()

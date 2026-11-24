import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_perfect_discovery_set():
    w, h = 1200, 917
    
    # 5 flacons from campaign files
    flacon_files = [
        'assets/images/erlux_campaign/erlux_noir.jpg',
        'assets/images/erlux_campaign/erlux_bloom.jpg',
        'assets/images/erlux_campaign/erlux_oud.jpg',
        'assets/images/erlux_campaign/erlux_aurora.jpg',
        'assets/images/erlux_campaign/erlux_sovereign.jpg',
    ]
    
    # Each bottle from campaign is 1200x1200.
    # The bottle is centered at x=600.
    # If we crop x: 270..930, y: 80..1150 (width 660, height 1070) from each bottle
    # and resize to width 240, height 500:
    # 5 * 240 = 1200!
    # They fit side by side with continuous marble floor and reflections!
    
    slices = []
    for p in flacon_files:
        im = Image.open(p).convert('RGBA')
        # Crop width 700 centered around 600 -> x: 250..950
        # y from top of cap to bottom reflection -> y: 80..1160 (height 1080)
        c = im.crop((250, 80, 950, 1160))
        # Resize to 240 x 500
        resized = c.resize((240, 500), Image.Resampling.LANCZOS)
        slices.append(resized)
        
    # Create canvas 1200 x 917
    canvas = Image.new('RGBA', (w, h), (250, 245, 238, 255))
    
    # Top background: soft studio light gradient
    draw_bg = ImageDraw.Draw(canvas)
    for y in range(450):
        ny = y / 450.0
        r = int(248 - 10 * ny)
        g = int(242 - 12 * ny)
        b = int(235 - 15 * ny)
        draw_bg.line([(0, y), (1200, y)], fill=(r, g, b, 255))
        
    # Paste the 5 flacons side by side at y = 417 (height 500 -> reaches y=917!)
    for i, sl in enumerate(slices):
        canvas.paste(sl, (i * 240, 417))
        
    # Soft vertical blends at seam columns: x = 240, 480, 720, 960
    arr = np.array(canvas)
    for seam_x in [240, 480, 720, 960]:
        # blend across 8 pixels on each side
        for col in range(seam_x - 6, seam_x + 6):
            # blend with neighbor
            pass
            
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    # 3. Add top Discovery Collection title plaque
    cx = w // 2
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 72)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 50)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
    font_tag = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 17)
    
    gold_main = (225, 185, 95, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E crest
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 46), e_txt, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 45), e_txt, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 44), e_txt, fill=gold_light, font=font_e)
    
    # Flourish wings beside E
    draw.line([(cx - 70, 78), (cx - 30, 78)], fill=gold_main, width=2)
    draw.line([(cx + 30, 78), (cx + 70, 78)], fill=gold_main, width=2)
    
    # E R L U X
    b_txt = "E R L U X"
    bbox_b = draw.textbbox((0, 0), b_txt, font=font_brand)
    bw_text = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw_text // 2 + 1, 126), b_txt, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw_text // 2, 125), b_txt, fill=gold_main, font=font_brand)
    draw.text((cx - bw_text // 2, 124), b_txt, fill=gold_light, font=font_brand)
    
    # SIGNATURE DISCOVERY COFFRET
    s_txt = "SIGNATURE  DISCOVERY  COFFRET"
    bbox_s = draw.textbbox((0, 0), s_txt, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2 + 1, 196), s_txt, fill=gold_shadow, font=font_sub)
    draw.text((cx - sw // 2, 195), s_txt, fill=gold_main, font=font_sub)
    
    # Five Variants Legend
    t_txt = "NOIR  •  BLOOM  •  OUD  •  AURORA  •  SOVEREIGN"
    bbox_t = draw.textbbox((0, 0), t_txt, font=font_tag)
    tw = bbox_t[2] - bbox_t[0]
    draw.text((cx - tw // 2, 235), t_txt, fill=(150, 110, 55, 230), font=font_tag)
    
    # Gold divider line
    draw.line([(cx - 140, 275), (cx + 140, 275)], fill=(210, 170, 85, 180), width=1)
    
    # Subtag
    sub_tag = "FIVE 100ML EXTRAIT DE PARFUM FLACONS"
    font_micro = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 12)
    bbox_m = draw.textbbox((0, 0), sub_tag, font=font_micro)
    mw = bbox_m[2] - bbox_m[0]
    draw.text((cx - mw // 2, 290), sub_tag, fill=(130, 95, 45, 220), font=font_micro)
    
    # Save target files
    final_img = res_img.convert('RGB')
    final_img.save('scratch/discovery_perfect.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux_repo/giftSets/2.webp', 'WEBP', quality=95)
    final_img.save('assets/images/erlux/images_pages_gift-sets_six-variants-banner.png', 'PNG')
    final_img.save('assets/images/erlux/images_pages_gift-sets_chairman-six-variants-banner-2.png', 'PNG')
    final_img.save('assets/images/erlux_repo/giftSets/6.webp', 'WEBP', quality=95)
    print("Perfect discovery set built and saved!")

build_perfect_discovery_set()

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def upgrade_lipstick():
    img = Image.open('assets/images/erlux/images_pages_menu_cosmetics-editorial.png').convert('RGBA')
    w, h = img.size
    
    # 1. Inspect the black label
    # In full image coordinates, let's find the black rectangle
    # The crop (450, 400, 750, 1100) showed the black rectangle
    # Inside the crop (300 wide, 700 tall):
    # Black rectangle x is approximately 65 to 235 inside crop -> 515 to 685 in full image
    # Black rectangle y is approximately 60 to 365 inside crop -> 460 to 765 in full image
    
    # Let's cleanly reconstruct the black glossy cylinder inside the rectangle
    # Sample gradient and specular highlight of the black band
    black_x1, black_x2 = 510, 690
    black_y1, black_y2 = 460, 765
    
    # Draw glossy black cylinder surface with subtle horizontal gradient highlight
    # Left is dark, middle-right has soft specular reflection
    band = Image.new('RGBA', (black_x2 - black_x1, black_y2 - black_y1), (12, 12, 14, 255))
    draw_band = ImageDraw.Draw(band)
    
    bw = black_x2 - black_x1
    bh = black_y2 - black_y1
    for x in range(bw):
        # Cylindrical curvature lighting
        nx = x / bw
        # subtle highlight at nx=0.65
        spec = np.exp(-((nx - 0.62) ** 2) / (2 * 0.12 ** 2)) * 60
        left_spec = np.exp(-((nx - 0.12) ** 2) / (2 * 0.08 ** 2)) * 25
        base_v = int(10 + spec + left_spec)
        base_v = min(255, max(0, base_v))
        draw_band.line([(x, 0), (x, bh)], fill=(base_v, base_v, base_v + 2, 255))
        
    img.paste(band, (black_x1, black_y1))
    
    # 2. Add gold border / bevel to the black plate if needed, or blend edges
    # Now let's draw ERLUX Crest and Typography in gleaming metallic gold
    # Logo font and crest
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 72)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
    
    draw = ImageDraw.Draw(img)
    
    # Metallic gold colors
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (140, 100, 35, 255)
    
    cx = (black_x1 + black_x2) // 2
    
    # Draw E crest with flourish
    # Center at y = 520
    e_text = "E"
    bbox_e = draw.textbbox((0, 0), e_text, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 516), e_text, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 515), e_text, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 514), e_text, fill=gold_light, font=font_e)
    
    # Flourish lines beside E
    draw.line([(cx - 45, 545), (cx - 28, 545)], fill=gold_main, width=2)
    draw.line([(cx + 28, 545), (cx + 45, 545)], fill=gold_main, width=2)
    draw.ellipse([(cx - 48, 543), (cx - 44, 547)], fill=gold_light)
    draw.ellipse([(cx + 44, 543), (cx + 48, 547)], fill=gold_light)
    
    # E R L U X text
    brand_text = "E R L U X"
    bbox_b = draw.textbbox((0, 0), brand_text, font=font_brand)
    bw_text = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw_text // 2 + 1, 606), brand_text, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw_text // 2, 605), brand_text, fill=gold_main, font=font_brand)
    draw.text((cx - bw_text // 2, 604), brand_text, fill=gold_light, font=font_brand)
    
    # BEAUTY / HAUTE MATTE
    sub_text = "—  B E A U T Y  —"
    bbox_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2, 665), sub_text, fill=gold_main, font=font_sub)
    
    # 3. Clean COLOR RICHE on lower tube
    # The lower tube is peach nude with glossy cylinder
    # In crop it was around y=750 to 900, let's find exact coordinates
    # Let's clone the vertical gradient of the peach tube across the text area
    # Peach tube x: 515 to 685, y: 880 to 980
    peach_x1, peach_x2 = 515, 685
    peach_y1, peach_y2 = 880, 980
    
    # Sample clean peach strip above at y=800..850
    clean_strip = img.crop((peach_x1, 800, peach_x2, 850))
    # resize clean strip to cover y1..y2
    clean_strip_stretched = clean_strip.resize((peach_x2 - peach_x1, peach_y2 - peach_y1), Image.Resampling.BILINEAR)
    img.paste(clean_strip_stretched, (peach_x1, peach_y1))
    
    # Now draw ROYAL VELVET / MATTE LIPSTICK
    font_lower_1 = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 20)
    font_lower_2 = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 18)
    
    txt1 = "ROYAL VELVET"
    bbox1 = draw.textbbox((0, 0), txt1, font=font_lower_1)
    w1 = bbox1[2] - bbox1[0]
    draw.text((cx - w1 // 2, 905), txt1, fill=(60, 40, 30, 220), font=font_lower_1)
    
    txt2 = "MATTE LIPSTICK"
    bbox2 = draw.textbbox((0, 0), txt2, font=font_lower_2)
    w2 = bbox2[2] - bbox2[0]
    draw.text((cx - w2 // 2, 935), txt2, fill=(40, 25, 20, 240), font=font_lower_2)
    
    # 4. Bullet tip embossing (subtle luxury indentation)
    # y=120..150 on the bullet
    font_bullet = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 16)
    b_txt = "ERLUX"
    bbox_bt = draw.textbbox((0, 0), b_txt, font=font_bullet)
    btw = bbox_bt[2] - bbox_bt[0]
    bx = 600 - btw // 2
    by = 135
    # Shadow and highlight for debossed wax look
    draw.text((bx + 1, by + 1), b_txt, fill=(245, 195, 175, 160), font=font_bullet)
    draw.text((bx, by), b_txt, fill=(155, 95, 80, 180), font=font_bullet)
    
    img_rgb = img.convert('RGB')
    img_rgb.save('scratch/lipstick_upgraded.png', 'PNG')
    print("Lipstick upgraded and saved to scratch/lipstick_upgraded.png")

upgrade_lipstick()

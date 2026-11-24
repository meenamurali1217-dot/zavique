import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def perfect_lipstick():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux/images_pages_menu_cosmetics-editorial.png').convert('RGB')
    arr = np.array(img)
    
    # 1. Clean the black plate (x: 512 to 675, y: 460 to 820)
    # The black plate has gold lettering L'OREAL PARIS in it
    # We can reconstruct the glossy black lacquer cylinder:
    # Notice columns across x=512..675:
    # Let's inspect column values near y=455..470 (just below top edge)
    # or create a cylinder shading:
    bx1, bx2 = 510, 678
    by1, by2 = 455, 822
    
    # Reconstruct black cylinder with glossy highlight
    for y in range(by1, by2):
        for x in range(bx1, bx2):
            nx = (x - bx1) / (bx2 - bx1)
            # Specular highlight centered at nx ~ 0.65
            spec = np.exp(-((nx - 0.63) ** 2) / (2 * 0.11 ** 2)) * 68
            left_rim = np.exp(-((nx - 0.08) ** 2) / (2 * 0.05 ** 2)) * 28
            right_rim = np.exp(-((nx - 0.94) ** 2) / (2 * 0.05 ** 2)) * 20
            val = int(8 + spec + left_rim + right_rim)
            val = min(255, max(5, val))
            arr[y, x] = [val, val, val + 1]
            
    # 2. Clean the lower peach tube text (x: 512..675, y: 840..1000)
    # Sample clean slice at y=795..835 across x=512..675
    # The shading is strictly a function of x!
    clean_slice = arr[800:835, bx1:bx2, :].mean(axis=0) # shape (bw, 3)
    for y in range(840, 1010):
        # subtle vertical lighting gradient
        vy = (y - 840) / 170.0
        # base color deepens very slightly towards bottom
        factor = 1.0 - 0.03 * vy
        for i, x in enumerate(range(bx1, bx2)):
            col = np.clip(clean_slice[i] * factor, 0, 255).astype(np.uint8)
            arr[y, x] = col
            
    res_img = Image.fromarray(arr).convert('RGBA')
    draw = ImageDraw.Draw(res_img)
    
    cx = (bx1 + bx2) // 2
    
    # 3. Draw ERLUX Crest and Typography in metallic gold on black plate
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 64)
    font_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 36)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (140, 95, 30, 255)
    
    # E crest with flourish at y = 520
    e_text = "E"
    bbox_e = draw.textbbox((0, 0), e_text, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 516), e_text, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 515), e_text, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 514), e_text, fill=gold_light, font=font_e)
    
    # Flourish lines
    draw.line([(cx - 48, 545), (cx - 28, 545)], fill=gold_main, width=2)
    draw.line([(cx + 28, 545), (cx + 48, 545)], fill=gold_main, width=2)
    draw.ellipse([(cx - 52, 543), (cx - 48, 547)], fill=gold_light)
    draw.ellipse([(cx + 48, 543), (cx + 52, 547)], fill=gold_light)
    
    # E R L U X text
    brand_text = "E R L U X"
    bbox_b = draw.textbbox((0, 0), brand_text, font=font_brand)
    bw_text = bbox_b[2] - bbox_b[0]
    draw.text((cx - bw_text // 2 + 1, 606), brand_text, fill=gold_shadow, font=font_brand)
    draw.text((cx - bw_text // 2, 605), brand_text, fill=gold_main, font=font_brand)
    draw.text((cx - bw_text // 2, 604), brand_text, fill=gold_light, font=font_brand)
    
    # HAUTE MATTE
    sub_text = "HAUTE  MATTE"
    bbox_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2, 665), sub_text, fill=gold_main, font=font_sub)
    
    # Gold divider line
    draw.line([(cx - 35, 695), (cx + 35, 695)], fill=(180, 140, 60, 200), width=1)
    
    # COLLECTION text
    col_text = "PARIS"
    bbox_c = draw.textbbox((0, 0), col_text, font=font_sub)
    cw = bbox_c[2] - bbox_c[0]
    draw.text((cx - cw // 2, 715), col_text, fill=gold_light, font=font_sub)
    
    # 4. Text on lower peach tube:
    font_lower_1 = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 17)
    font_lower_2 = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 15)
    
    txt1 = "ROYAL VELVET"
    b1 = draw.textbbox((0, 0), txt1, font=font_lower_1)
    draw.text((cx - (b1[2] - b1[0]) // 2, 905), txt1, fill=(45, 30, 22, 220), font=font_lower_1)
    
    txt2 = "MATTE LIPSTICK"
    b2 = draw.textbbox((0, 0), txt2, font=font_lower_2)
    draw.text((cx - (b2[2] - b2[0]) // 2, 935), txt2, fill=(35, 20, 15, 230), font=font_lower_2)
    
    # 5. Bullet tip indentation
    font_bullet = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 15)
    b_txt = "ERLUX"
    bbox_bt = draw.textbbox((0, 0), b_txt, font=font_bullet)
    btw = bbox_bt[2] - bbox_bt[0]
    draw.text((600 - btw // 2 + 1, 136), b_txt, fill=(245, 195, 175, 150), font=font_bullet)
    draw.text((600 - btw // 2, 135), b_txt, fill=(155, 95, 80, 170), font=font_bullet)
    
    final_img = res_img.convert('RGB')
    final_img.save('scratch/lipstick_perfect.png', 'PNG')
    print("Lipstick perfected!")

perfect_lipstick()

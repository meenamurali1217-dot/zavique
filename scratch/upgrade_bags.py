import numpy as np
from PIL import Image, ImageDraw, ImageFont

def upgrade_bag1():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/bags/1.webp').convert('RGBA')
    arr = np.array(img)
    
    # "B" is at x: 620..710, y: 430..510
    # Clean donor from clean nude leather to the left at x: 500..590, y: 430..510
    donor = arr[430:510, 500:590, :]
    pw = 710 - 620
    arr[430:510, 620:710] = donor[:, :pw, :]
    
    res = Image.fromarray(arr)
    draw = ImageDraw.Draw(res)
    
    cx = 665 # center of B and ERLUX
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 72)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E crest with flourish at y = 435
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 436), e_txt, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 435), e_txt, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 434), e_txt, fill=gold_light, font=font_e)
    
    # Small flourish leaves
    draw.ellipse([(cx - 45, 465), (cx - 39, 471)], fill=gold_main)
    draw.ellipse([(cx + 39, 465), (cx + 45, 471)], fill=gold_main)
    
    res.save('scratch/bag_1_upgraded.webp', 'WEBP', quality=95)
    res.save('assets/images/erlux_repo/bags/1.webp', 'WEBP', quality=95)
    res.save('assets/images/erlux/images_pages_bags_hero-banner.png', 'PNG')
    print("Bag 1 upgraded!")

def upgrade_bag2():
    img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/bags/2.webp').convert('RGBA')
    arr = np.array(img)
    
    # "B" is at x: 550..650, y: 430..510
    # Clean donor from clean black leather to the left at x: 440..540, y: 430..510
    donor = arr[430:510, 440:540, :]
    pw = 650 - 550
    arr[430:510, 550:650] = donor[:, :pw, :]
    
    res = Image.fromarray(arr)
    draw = ImageDraw.Draw(res)
    
    cx = 603 # center of B and ERLUX
    font_e = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 72)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # E crest with flourish at y = 435
    e_txt = "E"
    bbox_e = draw.textbbox((0, 0), e_txt, font=font_e)
    ew = bbox_e[2] - bbox_e[0]
    draw.text((cx - ew // 2 + 1, 436), e_txt, fill=gold_shadow, font=font_e)
    draw.text((cx - ew // 2, 435), e_txt, fill=gold_main, font=font_e)
    draw.text((cx - ew // 2, 434), e_txt, fill=gold_light, font=font_e)
    
    # Small flourish leaves
    draw.ellipse([(cx - 45, 465), (cx - 39, 471)], fill=gold_main)
    draw.ellipse([(cx + 39, 465), (cx + 45, 471)], fill=gold_main)
    
    res.save('scratch/bag_2_upgraded.webp', 'WEBP', quality=95)
    res.save('assets/images/erlux_repo/bags/2.webp', 'WEBP', quality=95)
    res.save('assets/images/erlux/images_pages_bags_collection-banner.png', 'PNG')
    print("Bag 2 upgraded!")

upgrade_bag1()
upgrade_bag2()

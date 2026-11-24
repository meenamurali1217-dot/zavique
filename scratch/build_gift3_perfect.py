import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_perfect_gift3():
    orig = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/3.webp').convert('RGBA')
    arr = np.array(orig)
    
    # 1. Bottle 1 (left):
    # Text EARLUX & FRAGRANCES is at y: 580..695, x: 220..425
    # Clean donor slice from above text at y: 515..560, x: 220..425
    donor1_col = arr[520:555, 220:425, :].mean(axis=0) # shape (205, 4)
    for y in range(580, 695):
        arr[y, 220:425] = donor1_col
        
    # 2. Bottle 2 (center):
    # Text EARLUX & FRAGRANCES is at y: 480..650, x: 395..740
    # Clean donor slice from above text at y: 390..440, x: 395..740
    donor2_col = arr[395:435, 395:740, :].mean(axis=0) # shape (345, 4)
    for y in range(480, 650):
        arr[y, 395:740] = donor2_col
        
    # 3. Bottle 3 (right):
    # Text EARLUX & FRAGRANCES is at y: 760..820, x: 720..830
    donor3_col = arr[640:680, 720:830, :].mean(axis=0)
    for y in range(760, 825):
        arr[y, 720:830] = donor3_col
        
    res_img = Image.fromarray(arr)
    draw = ImageDraw.Draw(res_img)
    
    green_text = (15, 38, 20, 255)
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (110, 75, 25, 255)
    
    # 1. Bottle 1 text
    cx1 = 325
    font_b1_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 38)
    font_b1_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
    
    txt1 = "E R L U X"
    bbox1 = draw.textbbox((0, 0), txt1, font=font_b1_brand)
    w1 = bbox1[2] - bbox1[0]
    draw.text((cx1 - w1 // 2, 595), txt1, fill=green_text, font=font_b1_brand)
    
    sub1 = "N A T U R A L S"
    bbox_s1 = draw.textbbox((0, 0), sub1, font=font_b1_sub)
    ws1 = bbox_s1[2] - bbox_s1[0]
    draw.text((cx1 - ws1 // 2, 650), sub1, fill=green_text, font=font_b1_sub)
    
    # 2. Bottle 2 text
    cx2 = 568
    font_b2_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 52)
    font_b2_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
    
    txt2 = "E R L U X"
    bbox2 = draw.textbbox((0, 0), txt2, font=font_b2_brand)
    w2 = bbox2[2] - bbox2[0]
    draw.text((cx2 - w2 // 2, 500), txt2, fill=green_text, font=font_b2_brand)
    
    sub2 = "N A T U R A L S"
    bbox_s2 = draw.textbbox((0, 0), sub2, font=font_b2_sub)
    ws2 = bbox_s2[2] - bbox_s2[0]
    draw.text((cx2 - ws2 // 2, 575), sub2, fill=green_text, font=font_b2_sub)
    
    # 3. Bottle 3 text (gold on black)
    cx3 = 770
    font_b3_brand = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 20)
    font_b3_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 8)
    
    txt3 = "E R L U X"
    bbox3 = draw.textbbox((0, 0), txt3, font=font_b3_brand)
    w3 = bbox3[2] - bbox3[0]
    draw.text((cx3 - w3 // 2, 768), txt3, fill=gold_main, font=font_b3_brand)
    
    sub3 = "N A T U R A L S"
    bbox_s3 = draw.textbbox((0, 0), sub3, font=font_b3_sub)
    ws3 = bbox_s3[2] - bbox_s3[0]
    draw.text((cx3 - ws3 // 2, 796), sub3, fill=gold_light, font=font_b3_sub)
    
    res_img.save('scratch/gift3_perfect.webp', 'WEBP', quality=95)
    res_img.save('assets/images/erlux_repo/giftSets/3.webp', 'WEBP', quality=95)
    res_img.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner.png', 'PNG')
    print("giftSets 3 perfect saved successfully!")

build_perfect_gift3()

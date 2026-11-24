from PIL import Image, ImageDraw, ImageFont

def brand_glasses():
    # 1. Milano Acetate Sunglasses (glasses/2.webp & images_pages_sunglasses_poster-banner.png)
    g2 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/2.webp').convert('RGBA')
    draw2 = ImageDraw.Draw(g2)
    
    # Left temple pin (x ~ 60, y ~ 310)
    # Right temple pin (x ~ 1130, y ~ 310)
    # Replace small generic oval with gold ERLUX emblem / gold plaque
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # Temple hallmark on left
    draw2.rectangle([50, 305, 78, 317], fill=gold_shadow)
    draw2.rectangle([51, 306, 77, 316], fill=gold_main)
    draw2.rectangle([52, 307, 76, 315], fill=gold_light)
    
    # Temple hallmark on right
    draw2.rectangle([1122, 305, 1150, 317], fill=gold_shadow)
    draw2.rectangle([1123, 306, 1149, 316], fill=gold_main)
    draw2.rectangle([1124, 307, 1148, 315], fill=gold_light)
    
    # Laser-etched ERLUX on left lens corner (x ~ 180, y ~ 210)
    font_etch = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 15)
    draw2.text((180, 210), "ERLUX", fill=(220, 220, 220, 160), font=font_etch)
    
    # Laser-engraved MILANO inside right temple
    font_micro = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 9)
    draw2.text((880, 315), "ERLUX  MILANO  HANDCRAFTED", fill=gold_main, font=font_micro)
    
    g2.save('scratch/glasses_2_branded.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux_repo/glasses/2.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux/images_pages_sunglasses_poster-banner.png', 'PNG')
    print("glasses 2 branded and saved!")
    
    # 2. Sculpted Signature Eyewear (glasses/3.webp)
    g3 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/3.webp').convert('RGBA')
    draw3 = ImageDraw.Draw(g3)
    
    # Temple hallmarks
    draw3.rectangle([40, 308, 68, 320], fill=gold_shadow)
    draw3.rectangle([41, 309, 67, 319], fill=gold_main)
    draw3.rectangle([42, 310, 66, 318], fill=gold_light)
    
    draw3.rectangle([1132, 308, 1160, 320], fill=gold_shadow)
    draw3.rectangle([1133, 309, 1159, 319], fill=gold_main)
    draw3.rectangle([1134, 310, 1158, 318], fill=gold_light)
    
    draw3.text((170, 215), "ERLUX", fill=(220, 220, 220, 160), font=font_etch)
    draw3.text((900, 320), "ERLUX  ITALIA", fill=gold_main, font=font_micro)
    
    g3.save('scratch/glasses_3_branded.webp', 'WEBP', quality=95)
    g3.save('assets/images/erlux_repo/glasses/3.webp', 'WEBP', quality=95)
    print("glasses 3 branded and saved!")

brand_glasses()

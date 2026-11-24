from PIL import Image, ImageDraw, ImageFont

def brand_glasses_exact():
    # 1. Milano Acetate Sunglasses
    g2 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/2.webp').convert('RGBA')
    draw2 = ImageDraw.Draw(g2)
    
    gold_main = (235, 195, 105, 255)
    gold_light = (255, 235, 165, 255)
    gold_shadow = (120, 80, 25, 255)
    
    # Left front rivet: x: 50..78, y: 152..166
    draw2.rectangle([48, 151, 80, 166], fill=gold_shadow)
    draw2.rectangle([49, 152, 79, 165], fill=gold_main)
    draw2.rectangle([50, 153, 78, 164], fill=gold_light)
    
    # Right front rivet: x: 923..953, y: 152..166
    draw2.rectangle([922, 151, 954, 166], fill=gold_shadow)
    draw2.rectangle([923, 152, 953, 165], fill=gold_main)
    draw2.rectangle([924, 153, 952, 164], fill=gold_light)
    
    # Laser etched ERLUX on left lens corner (x ~ 210, y ~ 140)
    font_etch = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 16)
    draw2.text((210, 140), "ERLUX", fill=(180, 180, 180, 190), font=font_etch)
    
    g2.save('scratch/glasses_2_exact.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux_repo/glasses/2.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux/images_pages_sunglasses_poster-banner.png', 'PNG')
    print("glasses 2 exact saved!")
    
    # 2. Sculpted Signature Eyewear (glasses/3.webp)
    g3 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/3.webp').convert('RGBA')
    draw3 = ImageDraw.Draw(g3)
    
    # Left rivet: x: 40..68, y: 152..166
    draw3.rectangle([38, 151, 70, 166], fill=gold_shadow)
    draw3.rectangle([39, 152, 69, 165], fill=gold_main)
    draw3.rectangle([40, 153, 68, 164], fill=gold_light)
    
    # Right rivet: x: 930..960, y: 152..166
    draw3.rectangle([930, 151, 962, 166], fill=gold_shadow)
    draw3.rectangle([931, 152, 961, 165], fill=gold_main)
    draw3.rectangle([932, 153, 960, 164], fill=gold_light)
    
    draw3.text((210, 140), "ERLUX", fill=(180, 180, 180, 190), font=font_etch)
    
    g3.save('scratch/glasses_3_exact.webp', 'WEBP', quality=95)
    g3.save('assets/images/erlux_repo/glasses/3.webp', 'WEBP', quality=95)
    print("glasses 3 exact saved!")

brand_glasses_exact()

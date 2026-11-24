from PIL import Image, ImageDraw, ImageFont

def brand_glasses_clean():
    # 1. Milano Acetate Sunglasses
    g2 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/2.webp').convert('RGBA')
    draw2 = ImageDraw.Draw(g2)
    
    # Laser etched ERLUX on left lens corner
    font_etch = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 16)
    draw2.text((190, 130), "ERLUX", fill=(190, 190, 190, 200), font=font_etch)
    
    g2.save('scratch/glasses_2_clean.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux_repo/glasses/2.webp', 'WEBP', quality=95)
    g2.save('assets/images/erlux/images_pages_sunglasses_poster-banner.png', 'PNG')
    
    # 2. Sculpted Signature Eyewear
    g3 = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/glasses/3.webp').convert('RGBA')
    draw3 = ImageDraw.Draw(g3)
    draw3.text((190, 130), "ERLUX", fill=(190, 190, 190, 200), font=font_etch)
    
    g3.save('scratch/glasses_3_clean.webp', 'WEBP', quality=95)
    g3.save('assets/images/erlux_repo/glasses/3.webp', 'WEBP', quality=95)
    print("glasses 2 and 3 cleanly branded!")

brand_glasses_clean()

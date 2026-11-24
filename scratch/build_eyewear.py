import numpy as np
from PIL import Image, ImageDraw, ImageFont

def build_eyewear_hero():
    # Load giftSets/5.webp (which has the front-facing gold aviators on ERLUX leather case)
    source = Image.open('assets/images/erlux_repo/giftSets/5.webp').convert('RGBA')
    # Source size: 1200 x 800
    
    # 1. Add laser-etched ERLUX logo on the top-left lens (x ~ 160..260, y ~ 490..520)
    draw = ImageDraw.Draw(source)
    font_etch = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 16)
    etch_txt = "ERLUX"
    # Subtle semi-transparent laser engraving on lens
    # White highlight with slight opacity
    draw.text((165, 495), etch_txt, fill=(255, 255, 255, 130), font=font_etch)
    draw.text((166, 496), etch_txt, fill=(200, 200, 200, 80), font=font_etch)
    
    # Also subtle 18K GOLD signature on bridge
    font_micro = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 8)
    draw.text((580, 560), "18K", fill=(160, 120, 60, 180), font=font_micro)
    
    # 2. Generate images_pages_sunglasses_hero-banner.png & best_seller/sunglasses.webp (1200 x 607)
    # The glasses and case are centered between y: 100 and y: 780
    # Crop 1200 x 607 from y: 120 to y: 727
    hero_crop = source.crop((0, 135, 1200, 742))
    hero_final = hero_crop.convert('RGBA')
    
    hero_final.save('scratch/sunglasses_hero_1200x607.webp', 'WEBP', quality=95)
    hero_final.save('assets/images/erlux_repo/best_seller/sunglasses.webp', 'WEBP', quality=95)
    hero_final.save('assets/images/erlux/images_pages_sunglasses_hero-banner.png', 'PNG')
    print("Sunglasses hero 1200x607 saved!")
    
    # 3. Generate category-eyewear.webp (1200 x 900)
    # Canvas 1200 x 900 with subtle warm studio gradient background
    cat_canvas = Image.new('RGB', (1200, 900), (248, 244, 238))
    # Paste source centered (y = 50)
    source_rgb = source.convert('RGB')
    cat_canvas.paste(source, (0, 50), source)
    
    cat_canvas.save('scratch/category_eyewear.webp', 'WEBP', quality=95)
    cat_canvas.save('assets/images/category/category-eyewear.webp', 'WEBP', quality=95)
    print("Category eyewear 1200x900 saved!")

build_eyewear_hero()

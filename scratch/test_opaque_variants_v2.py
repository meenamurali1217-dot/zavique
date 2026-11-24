import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import os

ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b

# Bottle interior coordinates mask
body_region = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 915)

# Text region: y=480 to 750, x=380 to 820
text_region = (x_indices >= 380) & (x_indices <= 820) & (y_indices >= 480) & (y_indices <= 750)
text_gold = text_region & (lum > 70) # letters of ERLUX, NOIR, EAU DE PARFUM

# Specific mask for NOIR text (y: 575 to 645, x: 400 to 800)
noir_text_mask = (x_indices >= 400) & (x_indices <= 800) & (y_indices >= 575) & (y_indices <= 645)

# Cap region
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 360)
cap_dark = cap_region & (lum < 50)

def generate_luxury_bottle(color_rgb, perfume_name, out_path, cap_is_gold=True):
    new_arr = arr.copy()
    cr, cg, cb = color_rgb
    
    # Coordinates normalized for studio lighting
    bx = (x_indices - 600.0) / 315.0
    by = (y_indices - 640.0) / 270.0
    
    # Realistic studio softbox curve
    studio_light = 1.05 - 0.25 * (bx**2) - 0.12 * by
    studio_light = np.clip(studio_light, 0.72, 1.28)
    
    tr = np.clip(cr * studio_light, 0, 255)
    tg = np.clip(cg * studio_light, 0, 255)
    tb = np.clip(cb * studio_light, 0, 255)
    
    # 1. Dark glass / body of bottle
    is_body_dark = body_region & (lum < 35) & (~noir_text_mask)
    new_arr[is_body_dark, 0] = tr[is_body_dark]
    new_arr[is_body_dark, 1] = tg[is_body_dark]
    new_arr[is_body_dark, 2] = tb[is_body_dark]
    
    # 2. Transition / soft specular reflections on edges
    is_body_edge = body_region & (lum >= 35) & (lum < 110) & (~text_gold) & (~noir_text_mask)
    edge_factor = np.clip((lum - 35) / 75.0, 0, 1)
    new_arr[is_body_edge, 0] = (1 - edge_factor[is_body_edge]) * tr[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 0]
    new_arr[is_body_edge, 1] = (1 - edge_factor[is_body_edge]) * tg[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 1]
    new_arr[is_body_edge, 2] = (1 - edge_factor[is_body_edge]) * tb[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 2]
    
    # 3. Completely replace the NOIR region with seamless opaque background
    new_arr[noir_text_mask, 0] = tr[noir_text_mask]
    new_arr[noir_text_mask, 1] = tg[noir_text_mask]
    new_arr[noir_text_mask, 2] = tb[noir_text_mask]
    
    # 4. Cap to gleaming gold
    if cap_is_gold:
        cap_x = (x_indices - 600.0) / 160.0
        cap_light = np.clip(1.0 - 0.28 * (cap_x**2), 0.75, 1.25)
        gold_r, gold_g, gold_b = 215, 175, 75
        new_arr[cap_dark, 0] = np.clip(gold_r * cap_light[cap_dark], 0, 255)
        new_arr[cap_dark, 1] = np.clip(gold_g * cap_light[cap_dark], 0, 255)
        new_arr[cap_dark, 2] = np.clip(gold_b * cap_light[cap_dark], 0, 255)
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
    
    # Draw the new perfume name in gold
    draw = ImageDraw.Draw(out_img)
    # Find nice font
    font_path = "C:/Windows/Fonts/georgia.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/times.ttf"
    try:
        font = ImageFont.truetype(font_path, 48)
    except:
        font = ImageFont.load_default()
        
    spaced_name = "  ".join(list(perfume_name))
    bbox = draw.textbbox((0, 0), spaced_name, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = 600 - tw // 2
    ty = 612 - th // 2
    
    # Luxury gold color for text
    gold_text_color = (248, 222, 148) if (cr < 160) else (28, 25, 20)
    draw.text((tx, ty), spaced_name, fill=gold_text_color, font=font)
    
    out_img.save(out_path, quality=95)
    print(f"Generated luxury bottle: {out_path}")

os.makedirs('scratch/luxury_bottles', exist_ok=True)
# 1. White Bottle (BLOOM)
generate_luxury_bottle((238, 238, 235), "BLOOM", "scratch/luxury_bottles/bloom_white.jpg", cap_is_gold=True)
# 2. Midnight Navy Bottle (OUD)
generate_luxury_bottle((12, 22, 48), "OUD", "scratch/luxury_bottles/oud_navy.jpg", cap_is_gold=True)
# 3. Royal Burgundy Bottle (AURORA)
generate_luxury_bottle((55, 12, 24), "AURORA", "scratch/luxury_bottles/aurora_burgundy.jpg", cap_is_gold=True)
# 4. Imperial Emerald Bottle (SOVEREIGN)
generate_luxury_bottle((12, 42, 28), "SOVEREIGN", "scratch/luxury_bottles/sovereign_emerald.jpg", cap_is_gold=True)
# 5. Pure Black Bottle (NOIR)
generate_luxury_bottle((6, 5, 5), "NOIR", "scratch/luxury_bottles/noir_black.jpg", cap_is_gold=True)

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b

# Bottle interior coordinates mask
body_region = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 915)

# Text regions:
# ERLUX is at y: 485 to 535, x: 380 to 820
erlux_region = (x_indices >= 380) & (x_indices <= 820) & (y_indices >= 480) & (y_indices <= 540)
# NOIR is at y: 580 to 645, x: 400 to 800
noir_region = (x_indices >= 400) & (x_indices <= 800) & (y_indices >= 580) & (y_indices <= 645)
# EAU DE PARFUM is at y: 700 to 745, x: 360 to 840
edp_region = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 700) & (y_indices <= 745)

# Crest is at y: 375 to 475, x: 440 to 760
crest_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 375) & (y_indices <= 475)

# All gold elements in original
is_gold_text = (crest_region | erlux_region | edp_region) & (lum > 60)

# Cap region
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 360)
cap_dark = cap_region & (lum < 50)

def generate_luxury_bottle(color_rgb, perfume_name, out_path, is_white=False):
    new_arr = arr.copy()
    cr, cg, cb = color_rgb
    
    bx = (x_indices - 600.0) / 315.0
    by = (y_indices - 640.0) / 270.0
    
    # Studio lighting curve
    studio_light = 1.05 - 0.25 * (bx**2) - 0.12 * by
    studio_light = np.clip(studio_light, 0.72, 1.28)
    
    tr = np.clip(cr * studio_light, 0, 255)
    tg = np.clip(cg * studio_light, 0, 255)
    tb = np.clip(cb * studio_light, 0, 255)
    
    # Body coloring
    is_body_dark = body_region & (lum < 35) & (~noir_region)
    new_arr[is_body_dark, 0] = tr[is_body_dark]
    new_arr[is_body_dark, 1] = tg[is_body_dark]
    new_arr[is_body_dark, 2] = tb[is_body_dark]
    
    # Transition edges
    is_body_edge = body_region & (lum >= 35) & (lum < 110) & (~is_gold_text) & (~noir_region)
    edge_factor = np.clip((lum - 35) / 75.0, 0, 1)
    new_arr[is_body_edge, 0] = (1 - edge_factor[is_body_edge]) * tr[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 0]
    new_arr[is_body_edge, 1] = (1 - edge_factor[is_body_edge]) * tg[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 1]
    new_arr[is_body_edge, 2] = (1 - edge_factor[is_body_edge]) * tb[is_body_edge] + edge_factor[is_body_edge] * new_arr[is_body_edge, 2]
    
    # Completely erase the NOIR region
    new_arr[noir_region, 0] = tr[noir_region]
    new_arr[noir_region, 1] = tg[noir_region]
    new_arr[noir_region, 2] = tb[noir_region]
    
    # Metallic gold cap
    cap_x = (x_indices - 600.0) / 160.0
    cap_light = np.clip(1.0 - 0.28 * (cap_x**2), 0.75, 1.25)
    gold_r, gold_g, gold_b = 215, 175, 75
    new_arr[cap_dark, 0] = np.clip(gold_r * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 1] = np.clip(gold_g * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 2] = np.clip(gold_b * cap_light[cap_dark], 0, 255)
    
    # If bottle is white, make the text and crest rich warm gold instead of white/pale
    if is_white:
        # EDP text is white in original, convert to gold on white bottle
        edp_white = edp_region & (lum > 80)
        new_arr[edp_white, 0] = 190
        new_arr[edp_white, 1] = 150
        new_arr[edp_white, 2] = 55
        
        # Crest and ERLUX to rich contrast gold
        crest_erlux = (crest_region | erlux_region) & (lum > 60)
        new_arr[crest_erlux, 0] = np.clip(new_arr[crest_erlux, 0] * 0.85, 0, 255)
        new_arr[crest_erlux, 1] = np.clip(new_arr[crest_erlux, 1] * 0.75, 0, 255)
        new_arr[crest_erlux, 2] = np.clip(new_arr[crest_erlux, 2] * 0.40, 0, 255)
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
    
    # Draw the new perfume name in gold
    draw = ImageDraw.Draw(out_img)
    font_path = "C:/Windows/Fonts/georgia.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/times.ttf"
    try:
        font = ImageFont.truetype(font_path, 52)
    except:
        font = ImageFont.load_default()
        
    spaced_name = "  ".join(list(perfume_name))
    bbox = draw.textbbox((0, 0), spaced_name, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = 600 - tw // 2
    ty = 612 - th // 2
    
    gold_text_color = (195, 155, 60) if is_white else (248, 225, 150)
    draw.text((tx, ty), spaced_name, fill=gold_text_color, font=font)
    
    out_img.save(out_path, quality=95)
    print(f"Generated: {out_path}")

os.makedirs('scratch/luxury_bottles_v3', exist_ok=True)
# 1. White Bottle (BLOOM)
generate_luxury_bottle((240, 240, 238), "BLOOM", "scratch/luxury_bottles_v3/bloom_white.jpg", is_white=True)
# 2. Midnight Navy Bottle (OUD)
generate_luxury_bottle((12, 22, 48), "OUD", "scratch/luxury_bottles_v3/oud_navy.jpg", is_white=False)
# 3. Royal Burgundy Bottle (AURORA)
generate_luxury_bottle((55, 12, 24), "AURORA", "scratch/luxury_bottles_v3/aurora_burgundy.jpg", is_white=False)
# 4. Imperial Emerald Bottle (SOVEREIGN)
generate_luxury_bottle((12, 42, 28), "SOVEREIGN", "scratch/luxury_bottles_v3/sovereign_emerald.jpg", is_white=False)
# 5. Glossy Black Bottle (NOIR)
generate_luxury_bottle((6, 5, 5), "NOIR", "scratch/luxury_bottles_v3/noir_black.jpg", is_white=False)

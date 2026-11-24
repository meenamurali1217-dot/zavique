import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create campaign output directory
out_dir = 'assets/images/erlux_campaign'
os.makedirs(out_dir, exist_ok=True)

# Load master high-res photograph
ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size # 1200 x 1200
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

# Exact bounding masks
# Bottle outer bounds
bottle_mask = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 920)

# Interior body mask (excluding thick glass bevel edges)
body_interior = (x_indices >= 320) & (x_indices <= 880) & (y_indices >= 400) & (y_indices <= 870)

# Crest mask: y: 370 to 480, x: 440 to 760
crest_mask = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 370) & (y_indices <= 480)

# ERLUX brand text: y: 490 to 560, x: 380 to 820
erlux_mask = (x_indices >= 380) & (x_indices <= 820) & (y_indices >= 490) & (y_indices <= 560)

# Variant text area (where NOIR is in original): y: 580 to 660, x: 360 to 840
variant_mask = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 580) & (y_indices <= 660)

# EAU DE PARFUM text: y: 700 to 750, x: 350 to 850
edp_mask = (x_indices >= 350) & (x_indices <= 850) & (y_indices >= 700) & (y_indices <= 750)

lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

# Cap mask: y: 120 to 360, x: 440 to 760
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 360)
cap_dark = cap_region & (lum < 55)

# Calculate lighting gradient for bottle body
bx = (x_indices - 600.0) / 315.0
by = (y_indices - 640.0) / 270.0
studio_light = np.clip(1.05 - 0.25 * (bx**2) - 0.12 * by, 0.72, 1.28)

def render_bottle(variant_name, body_rgb, is_white=False, is_black=False):
    new_arr = arr.copy()
    cr, cg, cb = body_rgb
    
    tr = np.clip(cr * studio_light, 0, 255)
    tg = np.clip(cg * studio_light, 0, 255)
    tb = np.clip(cb * studio_light, 0, 255)
    
    # 1. Champagne-gold metallic cap for all variants
    cap_x = (x_indices - 600.0) / 160.0
    cap_light = np.clip(1.0 - 0.26 * (cap_x**2), 0.78, 1.25)
    gold_cap_r, gold_cap_g, gold_cap_b = 218, 178, 80
    new_arr[cap_dark, 0] = np.clip(gold_cap_r * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 1] = np.clip(gold_cap_g * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 2] = np.clip(gold_cap_b * cap_light[cap_dark], 0, 255)
    
    if is_black:
        # Keep original lacquer black bottle, cap is already metallic gold
        pass
    elif is_white:
        # Solid opaque porcelain white
        # Body interior to warm white/cream alabaster
        white_base = 246.0 * (1.0 - 0.05 * (bx**2) - 0.03 * by)
        
        # Invert/map dark body glass to bright porcelain
        is_body_dark = bottle_mask & (lum < 40) & (~variant_mask)
        new_arr[is_body_dark, 0] = np.clip(white_base[is_body_dark], 230, 252)
        new_arr[is_body_dark, 1] = np.clip(white_base[is_body_dark] * 0.98, 226, 248)
        new_arr[is_body_dark, 2] = np.clip(white_base[is_body_dark] * 0.95, 220, 242)
        
        # Transition on edges
        is_edge = bottle_mask & (lum >= 40) & (lum < 120) & (~variant_mask) & (~crest_mask) & (~erlux_mask)
        new_arr[is_edge, 0] = np.clip(225 + 0.2 * new_arr[is_edge, 0], 210, 250)
        new_arr[is_edge, 1] = np.clip(220 + 0.2 * new_arr[is_edge, 1], 205, 246)
        new_arr[is_edge, 2] = np.clip(212 + 0.2 * new_arr[is_edge, 2], 198, 238)
        
        # Clear variant area with pure white
        new_arr[variant_mask, 0] = white_base[variant_mask]
        new_arr[variant_mask, 1] = white_base[variant_mask] * 0.98
        new_arr[variant_mask, 2] = white_base[variant_mask] * 0.95
        
        # Text on white: make ERLUX and Crest rich warm gold
        crest_erlux = (crest_mask | erlux_mask) & (lum > 60)
        new_arr[crest_erlux, 0] = 195
        new_arr[crest_erlux, 1] = 152
        new_arr[crest_erlux, 2] = 52
        
        # EDP text to warm gold
        edp_white = edp_mask & (lum > 60)
        new_arr[edp_white, 0] = 180
        new_arr[edp_white, 1] = 140
        new_arr[edp_white, 2] = 45
    else:
        # Colored opaque bottles (Navy, Burgundy, Emerald)
        is_body_dark = bottle_mask & (lum < 35) & (~variant_mask)
        new_arr[is_body_dark, 0] = tr[is_body_dark]
        new_arr[is_body_dark, 1] = tg[is_body_dark]
        new_arr[is_body_dark, 2] = tb[is_body_dark]
        
        # Soft specular highlights on glass bevels
        is_edge = bottle_mask & (lum >= 35) & (lum < 110) & (~variant_mask) & (~crest_mask) & (~erlux_mask) & (~edp_mask)
        factor = np.clip((lum - 35) / 75.0, 0, 1)
        new_arr[is_edge, 0] = (1 - factor[is_edge]) * tr[is_edge] + factor[is_edge] * new_arr[is_edge, 0]
        new_arr[is_edge, 1] = (1 - factor[is_edge]) * tg[is_edge] + factor[is_edge] * new_arr[is_edge, 1]
        new_arr[is_edge, 2] = (1 - factor[is_edge]) * tb[is_edge] + factor[is_edge] * new_arr[is_edge, 2]
        
        # Clear variant area with bottle color
        new_arr[variant_mask, 0] = tr[variant_mask]
        new_arr[variant_mask, 1] = tg[variant_mask]
        new_arr[variant_mask, 2] = tb[variant_mask]
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
    draw = ImageDraw.Draw(out_img)
    
    # Draw product variant name (NOIR, BLOOM, OUD, AURORA, SOVEREIGN)
    # Using Georgia serif font
    font_path = "C:/Windows/Fonts/georgia.ttf"
    try:
        font = ImageFont.truetype(font_path, 50)
    except:
        font = ImageFont.load_default()
        
    spaced_name = "  ".join(list(variant_name))
    bbox = draw.textbbox((0, 0), spaced_name, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = 600 - tw // 2
    ty = 618 - th // 2
    
    # Text color: metallic gold
    text_gold = (195, 152, 52) if is_white else (248, 225, 150)
    draw.text((tx, ty), spaced_name, fill=text_gold, font=font)
    
    return out_img

# 1. ERLUX NOIR
img_noir = render_bottle("NOIR", (6, 5, 5), is_black=True)
img_noir.save(os.path.join(out_dir, "erlux_noir.jpg"), quality=95)
print("Rendered ERLUX NOIR")

# 2. ERLUX BLOOM
img_bloom = render_bottle("BLOOM", (245, 245, 242), is_white=True)
img_bloom.save(os.path.join(out_dir, "erlux_bloom.jpg"), quality=95)
print("Rendered ERLUX BLOOM")

# 3. ERLUX OUD
img_oud = render_bottle("OUD", (14, 24, 52), is_white=False)
img_oud.save(os.path.join(out_dir, "erlux_oud.jpg"), quality=95)
print("Rendered ERLUX OUD")

# 4. ERLUX AURORA
img_aurora = render_bottle("AURORA", (58, 12, 24), is_white=False)
img_aurora.save(os.path.join(out_dir, "erlux_aurora.jpg"), quality=95)
print("Rendered ERLUX AURORA")

# 5. ERLUX SOVEREIGN
img_sovereign = render_bottle("SOVEREIGN", (12, 44, 28), is_white=False)
img_sovereign.save(os.path.join(out_dir, "erlux_sovereign.jpg"), quality=95)
print("Rendered ERLUX SOVEREIGN")

print("All 5 signature perfume campaign images rendered successfully!")

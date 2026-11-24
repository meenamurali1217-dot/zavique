import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

out_dir = 'assets/images/erlux_campaign'
os.makedirs(out_dir, exist_ok=True)

ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size # 1200 x 1200
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

# Bounding regions
bottle_mask = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 920)
body_interior = (x_indices >= 315) & (x_indices <= 885) & (y_indices >= 390) & (y_indices <= 865)

# Text erasing bounds:
# Erase old variant name (NOIR): y: 665 to 775, x: 340 to 860
erase_variant = (x_indices >= 340) & (x_indices <= 860) & (y_indices >= 665) & (y_indices <= 775)

# Erase old EDP: y: 800 to 880, x: 330 to 870
erase_edp = (x_indices >= 330) & (x_indices <= 870) & (y_indices >= 800) & (y_indices <= 880)

# ERLUX brand text: y: 555 to 655, x: 360 to 840
erlux_region = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 555) & (y_indices <= 655)

# Crest: y: 375 to 535, x: 420 to 780
crest_region = (x_indices >= 420) & (x_indices <= 780) & (y_indices >= 375) & (y_indices <= 535)

lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

# Cap area: y: 120 to 365, x: 440 to 760
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 365)
cap_dark = cap_region & (lum < 55)

# Softbox lighting curve
bx = (x_indices - 600.0) / 315.0
by = (y_indices - 635.0) / 250.0
studio_light = np.clip(1.05 - 0.24 * (bx**2) - 0.10 * by, 0.74, 1.26)

font_serif_large = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 52)
font_serif_sub = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 26)

def generate_campaign_variant(variant_code, variant_title, base_rgb, is_white=False):
    new_arr = arr.copy()
    cr, cg, cb = base_rgb
    
    # 1. Metallic Champagne-Gold Cap
    cap_x = (x_indices - 600.0) / 160.0
    cap_light = np.clip(1.0 - 0.26 * (cap_x**2), 0.78, 1.25)
    gold_cap_r, gold_cap_g, gold_cap_b = 218, 178, 80
    new_arr[cap_dark, 0] = np.clip(gold_cap_r * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 1] = np.clip(gold_cap_g * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 2] = np.clip(gold_cap_b * cap_light[cap_dark], 0, 255)
    
    tr = np.clip(cr * studio_light, 0, 255)
    tg = np.clip(cg * studio_light, 0, 255)
    tb = np.clip(cb * studio_light, 0, 255)
    
    if is_white:
        # Solid porcelain white body
        white_val = 248.0 - 10.0 * (bx**2) - 8.0 * by
        white_val = np.clip(white_val, 230, 255)
        
        # Body dark glass to porcelain white
        is_body_dark = bottle_mask & (lum < 40)
        new_arr[is_body_dark, 0] = np.clip(white_val[is_body_dark], 230, 252)
        new_arr[is_body_dark, 1] = np.clip(white_val[is_body_dark] * 0.985, 226, 248)
        new_arr[is_body_dark, 2] = np.clip(white_val[is_body_dark] * 0.965, 220, 242)
        
        # Soft outer bevel edges
        is_bevel = bottle_mask & (~body_interior) & (lum < 60)
        new_arr[is_bevel, 0] = 232
        new_arr[is_bevel, 1] = 226
        new_arr[is_bevel, 2] = 216
        
        # Base glass reflection: soften to warm champagne-marble
        is_base = (x_indices >= 300) & (x_indices <= 900) & (y_indices >= 860) & (y_indices <= 920) & (lum < 70)
        new_arr[is_base, 0] = 224
        new_arr[is_base, 1] = 212
        new_arr[is_base, 2] = 192
        
        # Cleanly erase variant and edp
        new_arr[erase_variant, 0] = white_val[erase_variant]
        new_arr[erase_variant, 1] = white_val[erase_variant] * 0.985
        new_arr[erase_variant, 2] = white_val[erase_variant] * 0.965
        
        new_arr[erase_edp, 0] = white_val[erase_edp]
        new_arr[erase_edp, 1] = white_val[erase_edp] * 0.985
        new_arr[erase_edp, 2] = white_val[erase_edp] * 0.965
        
        # Recolor crest and ERLUX to rich metallic gold
        crest_erlux = ((x_indices >= 360) & (x_indices <= 840) & (y_indices >= 370) & (y_indices <= 655)) & (lum > 60)
        new_arr[crest_erlux, 0] = 195
        new_arr[crest_erlux, 1] = 152
        new_arr[crest_erlux, 2] = 52
        
        gold_text_color = (195, 152, 52)
    else:
        # Colored flacons (Noir, Oud, Aurora, Sovereign)
        is_body_dark = bottle_mask & (lum < 35) & (~erase_variant) & (~erase_edp)
        new_arr[is_body_dark, 0] = tr[is_body_dark]
        new_arr[is_body_dark, 1] = tg[is_body_dark]
        new_arr[is_body_dark, 2] = tb[is_body_dark]
        
        # Specular bevel reflections
        is_edge = bottle_mask & (lum >= 35) & (lum < 110) & (~erase_variant) & (~erase_edp)
        factor = np.clip((lum - 35) / 75.0, 0, 1)
        new_arr[is_edge, 0] = (1 - factor[is_edge]) * tr[is_edge] + factor[is_edge] * new_arr[is_edge, 0]
        new_arr[is_edge, 1] = (1 - factor[is_edge]) * tg[is_edge] + factor[is_edge] * new_arr[is_edge, 1]
        new_arr[is_edge, 2] = (1 - factor[is_edge]) * tb[is_edge] + factor[is_edge] * new_arr[is_edge, 2]
        
        # Seamlessly erase old variant and old EDP
        new_arr[erase_variant, 0] = tr[erase_variant]
        new_arr[erase_variant, 1] = tg[erase_variant]
        new_arr[erase_variant, 2] = tb[erase_variant]
        
        new_arr[erase_edp, 0] = tr[erase_edp]
        new_arr[erase_edp, 1] = tg[erase_edp]
        new_arr[erase_edp, 2] = tb[erase_edp]
        
        gold_text_color = (248, 225, 150)
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
    draw = ImageDraw.Draw(out_img)
    
    # 1. Product Variant Name at y=722
    spaced_variant = "  ".join(list(variant_title))
    bbox_v = draw.textbbox((0, 0), spaced_variant, font=font_serif_large)
    vw = bbox_v[2] - bbox_v[0]
    vh = bbox_v[3] - bbox_v[1]
    draw.text((600 - vw // 2, 722 - vh // 2), spaced_variant, fill=gold_text_color, font=font_serif_large)
    
    # 2. Category: E A U   D E   P A R F U M at y=840
    edp_text = "E A U   D E   P A R F U M"
    bbox_e = draw.textbbox((0, 0), edp_text, font=font_serif_sub)
    ew = bbox_e[2] - bbox_e[0]
    eh = bbox_e[3] - bbox_e[1]
    draw.text((600 - ew // 2, 840 - eh // 2), edp_text, fill=gold_text_color, font=font_serif_sub)
    
    target_path = os.path.join(out_dir, f"erlux_{variant_code.lower()}.jpg")
    out_img.save(target_path, quality=96)
    print(f"Rendered: {target_path} (1200x1200)")
    return target_path

# Execute all 5 signature variants
generate_campaign_variant("noir", "NOIR", (6, 5, 5), is_white=False)
generate_campaign_variant("bloom", "BLOOM", (245, 245, 242), is_white=True)
generate_campaign_variant("oud", "OUD", (12, 22, 50), is_white=False)
generate_campaign_variant("aurora", "AURORA", (62, 12, 26), is_white=False)
generate_campaign_variant("sovereign", "SOVEREIGN", (10, 46, 30), is_white=False)

print("Generated all 5 campaign images cleanly!")

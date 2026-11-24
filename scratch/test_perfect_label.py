import numpy as np
from PIL import Image, ImageDraw, ImageFont

ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

# Exact NOIR text region:
noir_mask = (x_indices >= 350) & (x_indices <= 850) & (y_indices >= 670) & (y_indices <= 770)

# Exact EDP text region:
edp_mask = (x_indices >= 340) & (x_indices <= 860) & (y_indices >= 790) & (y_indices <= 850)

# ERLUX brand text region:
erlux_mask = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 550) & (y_indices <= 650)

# Crest region:
crest_mask = (x_indices >= 400) & (x_indices <= 800) & (y_indices >= 360) & (y_indices <= 530)

# Body of the bottle:
body_mask = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 915)

lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
cap_dark = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 360) & (lum < 50)

def create_variant(color_rgb, perfume_name, out_path, is_white=False):
    new_arr = arr.copy()
    cr, cg, cb = color_rgb
    
    bx = (x_indices - 600.0) / 315.0
    by = (y_indices - 640.0) / 270.0
    studio_light = np.clip(1.05 - 0.25 * (bx**2) - 0.12 * by, 0.72, 1.28)
    
    tr = np.clip(cr * studio_light, 0, 255)
    tg = np.clip(cg * studio_light, 0, 255)
    tb = np.clip(cb * studio_light, 0, 255)
    
    # Body dark pixels (excluding crest, ERLUX, EDP, NOIR)
    is_protected_text = crest_mask | erlux_mask | edp_mask
    is_body_dark = body_mask & (lum < 35) & (~noir_mask)
    new_arr[is_body_dark, 0] = tr[is_body_dark]
    new_arr[is_body_dark, 1] = tg[is_body_dark]
    new_arr[is_body_dark, 2] = tb[is_body_dark]
    
    # Soft specular edge highlights
    is_edge = body_mask & (lum >= 35) & (lum < 110) & (~is_protected_text) & (~noir_mask)
    factor = np.clip((lum - 35) / 75.0, 0, 1)
    new_arr[is_edge, 0] = (1 - factor[is_edge]) * tr[is_edge] + factor[is_edge] * new_arr[is_edge, 0]
    new_arr[is_edge, 1] = (1 - factor[is_edge]) * tg[is_edge] + factor[is_edge] * new_arr[is_edge, 1]
    new_arr[is_edge, 2] = (1 - factor[is_edge]) * tb[is_edge] + factor[is_edge] * new_arr[is_edge, 2]
    
    # Completely replace NOIR with the bottle color
    new_arr[noir_mask, 0] = tr[noir_mask]
    new_arr[noir_mask, 1] = tg[noir_mask]
    new_arr[noir_mask, 2] = tb[noir_mask]
    
    # Gold cap
    cap_x = (x_indices - 600.0) / 160.0
    cap_light = np.clip(1.0 - 0.28 * (cap_x**2), 0.75, 1.25)
    gold_r, gold_g, gold_b = 215, 175, 75
    new_arr[cap_dark, 0] = np.clip(gold_r * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 1] = np.clip(gold_g * cap_light[cap_dark], 0, 255)
    new_arr[cap_dark, 2] = np.clip(gold_b * cap_light[cap_dark], 0, 255)
    
    if is_white:
        # EDP to gold
        edp_white = edp_mask & (lum > 70)
        new_arr[edp_white, 0] = 190
        new_arr[edp_white, 1] = 150
        new_arr[edp_white, 2] = 55
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
    
    # Draw new name at y: 720
    draw = ImageDraw.Draw(out_img)
    font_path = "C:/Windows/Fonts/georgia.ttf"
    try:
        font = ImageFont.truetype(font_path, 54)
    except:
        font = ImageFont.load_default()
        
    spaced_name = "  ".join(list(perfume_name))
    bbox = draw.textbbox((0, 0), spaced_name, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = 600 - tw // 2
    ty = 718 - th // 2
    
    text_color = (195, 155, 60) if is_white else (248, 225, 150)
    draw.text((tx, ty), spaced_name, fill=text_color, font=font)
    
    out_img.save(out_path, quality=95)
    print(f"Generated {out_path}")

create_variant((14, 24, 52), "OUD", "scratch/test_perfect_oud.jpg", is_white=False)
create_variant((58, 12, 24), "AURORA", "scratch/test_perfect_aurora.jpg", is_white=False)
create_variant((242, 242, 240), "BLOOM", "scratch/test_perfect_bloom.jpg", is_white=True)
create_variant((12, 44, 28), "SOVEREIGN", "scratch/test_perfect_sovereign.jpg", is_white=False)

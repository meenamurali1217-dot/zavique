import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import os

os.makedirs('scratch/test_variants', exist_ok=True)

# Load master reference
ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGBA')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
lum = 0.299 * r + 0.587 * g + 0.114 * b

# Bottle interior coordinates mask
body_region = (x_indices >= 295) & (x_indices <= 905) & (y_indices >= 385) & (y_indices <= 845)

# Inside the body, identify the dark black glass lacquer (not gold text, not bevel reflections)
dark_glass = body_region & (lum < 40)
# Mild reflections/shading on glass
mid_glass = body_region & (lum >= 40) & (lum < 130) & (r < 110)

print(f"Dark glass pixels: {np.sum(dark_glass)}, mid glass pixels: {np.sum(mid_glass)}")

# Function to generate an opaque colored bottle
def create_opaque_bottle(color_rgb, name_text, out_path, cap_gold=True):
    new_arr = arr.copy()
    
    cr, cg, cb = color_rgb
    
    bx = (x_indices - 600.0) / 305.0
    by = (y_indices - 615.0) / 230.0
    
    lighting = 1.0 - 0.22 * (bx**2) - 0.12 * by
    lighting = np.clip(lighting, 0.75, 1.25)
    
    target_r = np.clip(cr * lighting, 0, 255)
    target_g = np.clip(cg * lighting, 0, 255)
    target_b = np.clip(cb * lighting, 0, 255)
    
    factor = lum / 40.0 * 0.15 + 0.85
    new_arr[dark_glass, 0] = target_r[dark_glass] * factor[dark_glass]
    new_arr[dark_glass, 1] = target_g[dark_glass] * factor[dark_glass]
    new_arr[dark_glass, 2] = target_b[dark_glass] * factor[dark_glass]
    
    blend = np.clip((lum - 40) / 90.0, 0, 1)
    new_arr[mid_glass, 0] = (1 - blend[mid_glass]) * target_r[mid_glass] + blend[mid_glass] * new_arr[mid_glass, 0]
    new_arr[mid_glass, 1] = (1 - blend[mid_glass]) * target_g[mid_glass] + blend[mid_glass] * new_arr[mid_glass, 1]
    new_arr[mid_glass, 2] = (1 - blend[mid_glass]) * target_b[mid_glass] + blend[mid_glass] * new_arr[mid_glass, 2]
    
    # Cap recoloring to rich metallic gold if requested
    if cap_gold:
        cap_region = (x_indices >= 445) & (x_indices <= 755) & (y_indices >= 125) & (y_indices <= 355)
        cap_dark = cap_region & (lum < 45)
        gold_r, gold_g, gold_b = 215, 175, 75
        cap_x = (x_indices - 600.0) / 155.0
        cap_light = 1.0 - 0.3 * (cap_x**2)
        new_arr[cap_dark, 0] = np.clip(gold_r * cap_light[cap_dark], 0, 255)
        new_arr[cap_dark, 1] = np.clip(gold_g * cap_light[cap_dark], 0, 255)
        new_arr[cap_dark, 2] = np.clip(gold_b * cap_light[cap_dark], 0, 255)
        
    out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGBA').convert('RGB')
    
    # Update text if different from NOIR
    if name_text != "NOIR":
        draw = ImageDraw.Draw(out_img)
        # Match background color
        draw.rectangle([440, 685, 760, 745], fill=tuple(int(c) for c in (cr, cg, cb)))
        try:
            font = ImageFont.truetype("arial.ttf", 46)
        except:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), name_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_x = 600 - text_w // 2
        text_y = 692
        text_color = (245, 215, 130) if (cr < 140) else (28, 28, 28)
        draw.text((text_x, text_y), name_text, fill=text_color, font=font)
        
    out_img.save(out_path, quality=95)
    print(f"Created {out_path}")

create_opaque_bottle((240, 240, 238), "BLOOM", "scratch/test_variants/bottle_white.jpg", cap_gold=True)
create_opaque_bottle((14, 24, 52), "OUD", "scratch/test_variants/bottle_navy.jpg", cap_gold=True)
create_opaque_bottle((60, 10, 24), "AURORA", "scratch/test_variants/bottle_burgundy.jpg", cap_gold=True)
create_opaque_bottle((10, 44, 28), "SOVEREIGN", "scratch/test_variants/bottle_emerald.jpg", cap_gold=True)

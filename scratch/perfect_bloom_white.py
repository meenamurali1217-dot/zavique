import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Load base reference
ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))
lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

# Cap area: y: 120 to 365, x: 440 to 760
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 365)
cap_dark = cap_region & (lum < 55)

new_arr = arr.copy()

# 1. Metallic Champagne-Gold Cap
cap_x = (x_indices - 600.0) / 160.0
cap_light = np.clip(1.0 - 0.26 * (cap_x**2), 0.78, 1.25)
gold_cap_r, gold_cap_g, gold_cap_b = 218, 178, 80
new_arr[cap_dark, 0] = np.clip(gold_cap_r * cap_light[cap_dark], 0, 255)
new_arr[cap_dark, 1] = np.clip(gold_cap_g * cap_light[cap_dark], 0, 255)
new_arr[cap_dark, 2] = np.clip(gold_cap_b * cap_light[cap_dark], 0, 255)

# Full body of the white bottle (from shoulder down to base bevel)
# x: 292 to 908, y: 375 to 870
full_body_mask = (x_indices >= 292) & (x_indices <= 908) & (y_indices >= 375) & (y_indices <= 870)

# Smooth studio light across the porcelain bottle
bx = (x_indices - 600.0) / 308.0
by = (y_indices - 620.0) / 248.0
white_surface = 250.0 - 10.0 * (bx**2) - 8.0 * by
white_surface = np.clip(white_surface, 234, 255)

# Text erasing bounds
erase_noir = (x_indices >= 340) & (x_indices <= 860) & (y_indices >= 665) & (y_indices <= 775)
erase_edp = (x_indices >= 330) & (x_indices <= 870) & (y_indices >= 795) & (y_indices <= 875)

# Protected crest and ERLUX text
crest_erlux = ((x_indices >= 360) & (x_indices <= 840) & (y_indices >= 370) & (y_indices <= 655)) & (lum > 60)

# Replace dark glass in the entire body with solid porcelain white
is_body_dark = full_body_mask & (lum < 40)
new_arr[is_body_dark, 0] = white_surface[is_body_dark]
new_arr[is_body_dark, 1] = white_surface[is_body_dark] * 0.985
new_arr[is_body_dark, 2] = white_surface[is_body_dark] * 0.965

# Soft edge bevels (specular sheen on white porcelain)
is_bevel = full_body_mask & (lum >= 40) & (lum < 130) & (~crest_erlux)
new_arr[is_bevel, 0] = np.clip(white_surface[is_bevel] + 0.1 * new_arr[is_bevel, 0], 230, 255)
new_arr[is_bevel, 1] = np.clip(white_surface[is_bevel] * 0.985 + 0.1 * new_arr[is_bevel, 1], 225, 252)
new_arr[is_bevel, 2] = np.clip(white_surface[is_bevel] * 0.965 + 0.1 * new_arr[is_bevel, 2], 218, 246)

# Erase old NOIR and EDP
new_arr[erase_noir, 0] = white_surface[erase_noir]
new_arr[erase_noir, 1] = white_surface[erase_noir] * 0.985
new_arr[erase_noir, 2] = white_surface[erase_noir] * 0.965

new_arr[erase_edp, 0] = white_surface[erase_edp]
new_arr[erase_edp, 1] = white_surface[erase_edp] * 0.985
new_arr[erase_edp, 2] = white_surface[erase_edp] * 0.965

# Thick glass base: soften the dark shadow to realistic warm champagne marble reflection
base_region = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 870) & (y_indices <= 925)
base_dark = base_region & (lum < 60)
new_arr[base_dark, 0] = 228
new_arr[base_dark, 1] = 216
new_arr[base_dark, 2] = 196

# Recolor Crest and ERLUX to rich contrast warm gold
new_arr[crest_erlux, 0] = 195
new_arr[crest_erlux, 1] = 152
new_arr[crest_erlux, 2] = 52

out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')
draw = ImageDraw.Draw(out_img)

font_serif_large = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 52)
font_serif_sub = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 26)

# Warm metallic gold for typography on white porcelain
gold_text_color = (195, 152, 52)

# 1. B L O O M at y=722
spaced_bloom = "B  L  O  O  M"
bbox_v = draw.textbbox((0, 0), spaced_bloom, font=font_serif_large)
vw = bbox_v[2] - bbox_v[0]
vh = bbox_v[3] - bbox_v[1]
draw.text((600 - vw // 2, 722 - vh // 2), spaced_bloom, fill=gold_text_color, font=font_serif_large)

# 2. E A U   D E   P A R F U M at y=840
edp_text = "E A U   D E   P A R F U M"
bbox_e = draw.textbbox((0, 0), edp_text, font=font_serif_sub)
ew = bbox_e[2] - bbox_e[0]
eh = bbox_e[3] - bbox_e[1]
draw.text((600 - ew // 2, 840 - eh // 2), edp_text, fill=gold_text_color, font=font_serif_sub)

out_path = 'assets/images/erlux_campaign/erlux_bloom.jpg'
out_img.save(out_path, quality=96)
print(f"Updated {out_path} cleanly!")

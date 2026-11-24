import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ref_img = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp').convert('RGB')
w, h = ref_img.size
arr = np.array(ref_img, dtype=np.float32)

y_indices, x_indices = np.indices((h, w))

bottle_mask = (x_indices >= 285) & (x_indices <= 915) & (y_indices >= 370) & (y_indices <= 915)
body_interior = (x_indices >= 315) & (x_indices <= 885) & (y_indices >= 395) & (y_indices <= 860)
crest_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 370) & (y_indices <= 520)
erlux_region = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 540) & (y_indices <= 660)
variant_region = (x_indices >= 360) & (x_indices <= 840) & (y_indices >= 670) & (y_indices <= 770)
edp_region = (x_indices >= 340) & (x_indices <= 860) & (y_indices >= 790) & (y_indices <= 855)

lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
cap_region = (x_indices >= 440) & (x_indices <= 760) & (y_indices >= 120) & (y_indices <= 360)
cap_dark = cap_region & (lum < 55)

# Champagne gold cap
new_arr = arr.copy()
cap_x = (x_indices - 600.0) / 160.0
cap_light = np.clip(1.0 - 0.26 * (cap_x**2), 0.78, 1.25)
new_arr[cap_dark, 0] = np.clip(218 * cap_light[cap_dark], 0, 255)
new_arr[cap_dark, 1] = np.clip(178 * cap_light[cap_dark], 0, 255)
new_arr[cap_dark, 2] = np.clip(80 * cap_light[cap_dark], 0, 255)

# Studio lighting curve
bx = (x_indices - 600.0) / 300.0
by = (y_indices - 630.0) / 240.0
white_val = 248.0 - 10.0 * (bx**2) - 8.0 * by
white_val = np.clip(white_val, 230, 255)

# Apply pure porcelain white to the body interior
is_text = (crest_region | erlux_region | edp_region) & (lum > 60)
is_white_body = body_interior & (~is_text)

new_arr[is_white_body, 0] = white_val[is_white_body]
new_arr[is_white_body, 1] = white_val[is_white_body] * 0.985
new_arr[is_white_body, 2] = white_val[is_white_body] * 0.965

# Soft bevel edge transition: blend white into the outer glass bevel
is_outer_bevel = bottle_mask & (~body_interior) & (~is_text)
# Wherever it was dark in the outer bevel, make it a soft warm pearl tone
dark_bevel = is_outer_bevel & (lum < 60)
new_arr[dark_bevel, 0] = 232
new_arr[dark_bevel, 1] = 226
new_arr[dark_bevel, 2] = 216

# Convert ERLUX and Crest to gleaming warm metallic gold
crest_erlux = (crest_region | erlux_region) & (lum > 60)
new_arr[crest_erlux, 0] = 195
new_arr[crest_erlux, 1] = 152
new_arr[crest_erlux, 2] = 52

# Convert EDP to gleaming warm metallic gold
edp_gold = edp_region & (lum > 60)
new_arr[edp_gold, 0] = 185
new_arr[edp_gold, 1] = 142
new_arr[edp_gold, 2] = 48

out_img = Image.fromarray(np.clip(new_arr, 0, 255).astype(np.uint8), mode='RGB')

# Draw BLOOM at y=720 in rich metallic gold
draw = ImageDraw.Draw(out_img)
font_path = "C:/Windows/Fonts/georgia.ttf"
font = ImageFont.truetype(font_path, 52)
spaced_name = "B  L  O  O  M"
bbox = draw.textbbox((0, 0), spaced_name, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = 600 - tw // 2
ty = 720 - th // 2
draw.text((tx, ty), spaced_name, fill=(195, 152, 52), font=font)

out_img.save("scratch/perfect_white_bloom.jpg", quality=95)
print("Saved scratch/perfect_white_bloom.jpg")

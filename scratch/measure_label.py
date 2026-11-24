from PIL import Image

im = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp')
# Crop the label area
# x: 350 to 850, y: 350 to 750
label_crop = im.crop((350, 350, 850, 750))
label_crop.save('scratch/label_area.png')
print("Saved scratch/label_area.png")

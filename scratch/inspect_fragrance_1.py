from PIL import Image

im = Image.open('assets/images/erlux_repo/fragrance/fragrance_1.webp')
w, h = im.size
print(f"Size: {w}x{h}, Mode: {im.mode}")

# Let's sample colors in bottle center, cap, background, marble
# Cap is around y: 140 to 360, x: 440 to 760
# Bottle body is around y: 380 to 980, x: 280 to 920
# Marble is around y: 850 to 1200
print("Center bottle pixel (600, 650):", im.getpixel((600, 650)))
print("Cap pixel (600, 250):", im.getpixel((600, 250)))
print("Gold collar pixel (600, 360):", im.getpixel((600, 360)))
print("Gold letter pixel (600, 510):", im.getpixel((600, 510)))
print("Marble pixel (600, 1050):", im.getpixel((600, 1050)))

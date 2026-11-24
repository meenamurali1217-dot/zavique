from PIL import Image

for i in range(1, 11):
    p = f'assets/images/erlux_repo/fragrance/fragrance_{i}.webp'
    try:
        im = Image.open(p)
        print(f"fragrance_{i}.webp: {im.size} {im.mode}")
    except Exception as e:
        print(f"fragrance_{i}.webp: {e}")

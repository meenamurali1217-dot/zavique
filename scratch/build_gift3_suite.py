from PIL import Image

def build_gift3_from_suite():
    # Load the authentic ERLUX skincare suite from category
    suite = Image.open('assets/images/category/category-personal-care.webp').convert('RGB')
    # Resize and crop to 1200 x 959
    # Original is 1200 x 900.
    # To fit 1200 x 959:
    # Resize width to 1280 x 960 and center crop to 1200 x 959
    scaled = suite.resize((1280, 960), Image.Resampling.LANCZOS)
    cropped = scaled.crop((40, 0, 1240, 959))
    
    cropped.save('scratch/gift3_suite.webp', 'WEBP', quality=95)
    cropped.save('assets/images/erlux_repo/giftSets/3.webp', 'WEBP', quality=95)
    cropped.save('assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner.png', 'PNG')
    print("giftSets 3 upgraded with authentic ERLUX skincare suite!")

build_gift3_from_suite()

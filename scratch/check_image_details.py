import os
from PIL import Image

images_to_check = [
    'assets/images/erlux/images_pages_cosmetics_main-menu-poster.jpg',
    'assets/images/erlux/images_pages_menu_cosmetics-editorial.png',
    'assets/images/erlux/images_pages_home_cosmetics-category.jpg',
    'assets/images/erlux/images_pages_personal-care_premium-care-banner.png',
    'assets/images/erlux/images_pages_personal-care_product-poster.jpg',
    'assets/images/erlux/images_pages_watches_watch-collection-banner.jpg',
    'assets/images/erlux/images_pages_watches_designed-for-your-expression-banner.jpg',
    'assets/images/erlux/images_pages_sunglasses_hero-banner.png',
    'assets/images/erlux/images_pages_sunglasses_poster-banner.png',
    'assets/images/erlux/images_pages_belts_hero-banner.jpg',
    'assets/images/erlux/images_pages_bags_hero-banner.png',
    'assets/images/erlux/images_pages_bags_collection-banner.png',
    'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
    'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png',
    'assets/images/erlux_repo/watches/watch_1.webp',
    'assets/images/erlux_repo/watches/watch_2.webp',
    'assets/images/erlux_repo/best_seller/sunglasses.webp',
    'assets/images/erlux_repo/belts_accessories/1.webp',
    'assets/images/erlux_repo/bags/1.webp',
    'assets/images/erlux_repo/giftSets/1.webp',
    'assets/images/erlux_repo/giftSets/2.webp',
    'assets/images/category/category-cosmetics.webp',
    'assets/images/category/category-personal-care.webp',
    'assets/images/category/category-watches.webp'
]

for p in images_to_check:
    if os.path.exists(p):
        img = Image.open(p)
        print(f"EXISTS: {p} | Size: {img.size} | Mode: {img.mode}")
    else:
        print(f"MISSING: {p}")

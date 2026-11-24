import os
from PIL import Image

images = [
    ('ID 12 Eyewear', 'assets/images/erlux/images_pages_sunglasses_hero-banner.png'),
    ('ID 13 Eyewear', 'assets/images/erlux/images_pages_sunglasses_poster-banner.png'),
    ('ID 14 Belts', 'assets/images/erlux/images_pages_belts_hero-banner.jpg'),
    ('ID 15 Bags', 'assets/images/erlux/images_pages_bags_hero-banner.png'),
    ('ID 16 Bags', 'assets/images/erlux/images_pages_bags_collection-banner.png'),
    ('ID 17 Gift Sets', 'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png'),
    ('ID 18 Gift Sets', 'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png'),
    ('ID 19 Fashion', 'assets/images/erlux/images_pages_fashion-wear_hero-banner-below.png'),
    ('ID 20 Fashion', 'assets/images/erlux/images_pages_home_fashion-category.jpg'),
    ('Index Watch 1', 'assets/images/erlux_repo/watches/watch_1.webp'),
    ('Index Watch 2', 'assets/images/erlux_repo/watches/watch_2.webp'),
    ('Index Watch 3', 'assets/images/erlux_repo/watches/watch_3.webp'),
    ('Index Watch 4', 'assets/images/erlux_repo/watches/watch_4.webp'),
    ('Index Sunglasses', 'assets/images/erlux_repo/best_seller/sunglasses.webp'),
    ('Index Belt 1', 'assets/images/erlux_repo/belts_accessories/1.webp'),
    ('Index Belt 2', 'assets/images/erlux_repo/belts_accessories/2.webp'),
    ('Index Bag 1', 'assets/images/erlux_repo/bags/1.webp'),
    ('Index Bag 2', 'assets/images/erlux_repo/bags/2.webp'),
    ('Index GiftSet 1', 'assets/images/erlux_repo/giftSets/1.webp'),
    ('Index GiftSet 2', 'assets/images/erlux_repo/giftSets/2.webp'),
    ('Index GiftSet 3', 'assets/images/erlux_repo/giftSets/3.webp'),
    ('Index GiftSet 4', 'assets/images/erlux_repo/giftSets/4.webp'),
    ('Index GiftSet 5', 'assets/images/erlux_repo/giftSets/5.webp'),
    ('Index Glasses 2', 'assets/images/erlux_repo/glasses/2.webp'),
    ('Index Glasses 3', 'assets/images/erlux_repo/glasses/3.webp'),
    ('Index Men Watch', 'assets/images/erlux_repo/best_seller/men_watch.webp'),
    ('Index Fashion 1', 'assets/images/erlux_repo/fashion_wear/1.webp'),
    ('Cat Fragrance', 'assets/images/category/category-fragrance.webp'),
    ('Cat Cosmetics', 'assets/images/category/category-cosmetics.webp'),
    ('Cat PersonalCare', 'assets/images/category/category-personal-care.webp'),
    ('Cat Watches', 'assets/images/category/category-watches.webp'),
    ('Cat Bags', 'assets/images/category/category-bags.webp'),
    ('Cat Belts', 'assets/images/category/category-belts-accessories.webp'),
    ('Cat Eyewear', 'assets/images/category/category-eyewear.webp'),
    ('Cat Fashion', 'assets/images/category/category-fashion-wear.webp'),
    ('Cat GiftSets', 'assets/images/category/category-gift-sets.webp'),
    ('Cat Jewellery', 'assets/images/category/category-jewellery.webp'),
]

for label, p in images:
    if os.path.exists(p):
        img = Image.open(p)
        print(f"{label:18} | {p:65} | {img.size} | {img.format} {img.mode}")
    else:
        print(f"{label:18} | MISSING: {p}")

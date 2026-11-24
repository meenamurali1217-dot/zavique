import os
import shutil

backup_dir = 'assets/images_backup_branding_upgrade'
os.makedirs(backup_dir, exist_ok=True)

targets = [
    # Cosmetics
    'assets/images/erlux/images_pages_menu_cosmetics-editorial.png',
    'assets/images/erlux/images_pages_home_cosmetics-category.jpg',
    # Gift Sets
    'assets/images/erlux_repo/giftSets/1.webp',
    'assets/images/erlux_repo/giftSets/2.webp',
    'assets/images/erlux_repo/giftSets/3.webp',
    'assets/images/erlux_repo/giftSets/4.webp',
    'assets/images/erlux_repo/giftSets/5.webp',
    'assets/images/erlux_repo/giftSets/6.webp',
    'assets/images/erlux/images_pages_gift-sets_chairman-special-gift-set-banner.png',
    'assets/images/erlux/images_pages_gift-sets_six-variants-banner.png',
    'assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner.png',
    'assets/images/erlux/images_pages_gift-sets_womens-gift-set-banner-2.png',
    'assets/images/erlux/images_pages_gift-sets_new-womens-gift-set-banner.png',
    'assets/images/erlux/images_pages_gift-sets_chairman-six-variants-banner-2.png',
    # Eyewear
    'assets/images/erlux/images_pages_sunglasses_hero-banner.png',
    'assets/images/erlux/images_pages_sunglasses_poster-banner.png',
    'assets/images/erlux_repo/best_seller/sunglasses.webp',
    'assets/images/erlux_repo/glasses/2.webp',
    'assets/images/erlux_repo/glasses/3.webp',
    # Bags
    'assets/images/erlux_repo/bags/1.webp',
    'assets/images/erlux_repo/bags/2.webp',
    'assets/images/erlux/images_pages_bags_hero-banner.png',
    'assets/images/erlux/images_pages_bags_collection-banner.png',
    # Category cards
    'assets/images/category/category-gift-sets.webp',
    'assets/images/category/category-watches.webp',
    'assets/images/category/category-eyewear.webp',
    'assets/images/category/category-belts-accessories.webp',
    'assets/images/category/category-bags.webp',
    'assets/images/category/category-footwear.webp',
    'assets/images/category/category-jewellery.webp',
]

backed_up = 0
for src in targets:
    if os.path.exists(src):
        # preserve relative structure inside backup_dir
        rel = os.path.relpath(src, 'assets')
        dest = os.path.join(backup_dir, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(src, dest)
        backed_up += 1
        print(f"Backed up: {src} -> {dest}")
    else:
        print(f"Warning: {src} does not exist.")

print(f"\nTotal backed up files: {backed_up}")

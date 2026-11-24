import os
from PIL import Image

campaign_dir = 'assets/images/erlux_campaign'
noir_path = os.path.join(campaign_dir, 'erlux_noir.jpg')
bloom_path = os.path.join(campaign_dir, 'erlux_bloom.jpg')
oud_path = os.path.join(campaign_dir, 'erlux_oud.jpg')
aurora_path = os.path.join(campaign_dir, 'erlux_aurora.jpg')
sovereign_path = os.path.join(campaign_dir, 'erlux_sovereign.jpg')

# 1. Update Best Sellers (600x600)
Image.open(noir_path).resize((600, 600), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/best_seller/noir.webp', 'WEBP', quality=94)
Image.open(bloom_path).resize((600, 600), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/best_seller/bloom.webp', 'WEBP', quality=94)
Image.open(oud_path).resize((600, 600), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/best_seller/oud.webp', 'WEBP', quality=94)
Image.open(aurora_path).resize((600, 600), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/best_seller/aurora.webp', 'WEBP', quality=94)
print("Updated best seller cards to opaque bottles")

# 2. Update Fragrance Catalog (1200x1200)
Image.open(noir_path).save('assets/images/erlux_repo/fragrance/fragrance_1.webp', 'WEBP', quality=95)
Image.open(bloom_path).save('assets/images/erlux_repo/fragrance/fragrance_2.webp', 'WEBP', quality=95)
Image.open(oud_path).save('assets/images/erlux_repo/fragrance/fragrance_3.webp', 'WEBP', quality=95)
Image.open(aurora_path).save('assets/images/erlux_repo/fragrance/fragrance_4.webp', 'WEBP', quality=95)
Image.open(sovereign_path).save('assets/images/erlux_repo/fragrance/fragrance_5.webp', 'WEBP', quality=95)
Image.open(bloom_path).save('assets/images/erlux_repo/fragrance/fragrance_6.webp', 'WEBP', quality=95)
Image.open(noir_path).save('assets/images/erlux_repo/fragrance/fragrance_7.webp', 'WEBP', quality=95)
Image.open(oud_path).save('assets/images/erlux_repo/fragrance/fragrance_8.webp', 'WEBP', quality=95)
Image.open(sovereign_path).save('assets/images/erlux_repo/fragrance/fragrance_10.webp', 'WEBP', quality=95)
print("Updated fragrance gallery to opaque bottles")

# 3. Update Database Catalog Products
Image.open(noir_path).save('assets/images/erlux/images_pages_perfumes_chairman-special.jpg', 'JPEG', quality=95)
Image.open(bloom_path).save('assets/images/erlux/images_pages_perfumes_all-in-one-poster.jpg', 'JPEG', quality=95)
Image.open(oud_path).save('assets/images/erlux/images_pages_perfumes_fragrance-collection-banner.jpg', 'JPEG', quality=95)
Image.open(aurora_path).save('assets/images/erlux/images_collections_fragrance.jpg', 'JPEG', quality=95)
print("Updated database catalog product images to opaque bottles")

# 4. Update Category Fragrance Card (600x500)
cat_im = Image.open(noir_path)
# crop 1200x1200 to 1200x1000 then resize to 600x500
cat_im_crop = cat_im.crop((0, 100, 1200, 1100)).resize((600, 500), Image.Resampling.LANCZOS)
cat_im_crop.save('assets/images/category/category-fragrance.webp', 'WEBP', quality=94)
print("Updated category-fragrance.webp to opaque bottle")

# 5. Update Instagram 4 (384x570)
ig_im = Image.open(noir_path)
# center crop 1200x1200 to 384:570 ratio (w=808, h=1200)
ig_crop = ig_im.crop((196, 0, 1004, 1200)).resize((384, 570), Image.Resampling.LANCZOS)
ig_crop.save('assets/images/instagram/instagram-4.jpg', 'JPEG', quality=95)
print("Updated instagram-4.jpg to opaque bottle")

# 6. Create Panoramic Multi-Bottle Banner (1600x535)
# Show 4 opaque signature bottles side by side on marble
banner = Image.new('RGB', (1600, 535), (247, 243, 237))

# Bottles to display: Noir, Bloom, Oud, Aurora
bottles = [
    Image.open(noir_path),
    Image.open(bloom_path),
    Image.open(oud_path),
    Image.open(aurora_path)
]

# Scale each bottle to height ~520
scaled_w = 400
for i, b in enumerate(bottles):
    # crop central bottle from 1200x1200 to tight 800x1070
    b_crop = b.crop((200, 100, 1000, 1170)).resize((400, 535), Image.Resampling.LANCZOS)
    banner.paste(b_crop, (i * 400, 0))

banner.save('assets/images/erlux_repo/fragrance/hero.webp', 'WEBP', quality=95)
banner.resize((1200, 400), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/premium_fragrances_banner.webp', 'WEBP', quality=95)
banner.resize((1200, 409), Image.Resampling.LANCZOS).save('assets/images/erlux_repo/fragrance/long_lastic.webp', 'WEBP', quality=95)
print("Updated panoramic multi-bottle banners to opaque bottles")

print("\n--- Website perfume visuals upgrade complete ---")

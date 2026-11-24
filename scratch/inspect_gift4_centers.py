from PIL import Image

img = Image.open('assets/images_backup_branding_upgrade/images/erlux_repo/giftSets/4.webp')

# Watch center
c_watch = img.crop((700, 200, 950, 450))
c_watch.save('scratch/gift4_watch_center.png')

# Pen body
c_pen = img.crop((380, 680, 650, 770))
c_pen.save('scratch/gift4_pen_center.png')

print("Saved watch center and pen center.")

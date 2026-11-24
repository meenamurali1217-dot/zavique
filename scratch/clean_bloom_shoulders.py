from PIL import Image
import numpy as np

im = Image.open('assets/images/erlux_campaign/erlux_bloom.jpg')
arr = np.array(im)

# Clean shoulder lines: y: 365 to 375, x: 295 to 440 and x: 760 to 905
# Fill with the adjacent white porcelain tone
arr[365:377, 295:445] = [246, 243, 238]
arr[365:377, 755:905] = [244, 241, 236]

# Save back
Image.fromarray(arr).save('assets/images/erlux_campaign/erlux_bloom.jpg', quality=96)
print("Cleaned shoulder lines on erlux_bloom.jpg")

import os
import django
import cloudinary.uploader

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from catalog.models import ProductImage

import pathlib

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
MEDIA_DIR = os.path.join(BASE_DIR, "media/products")

for img in ProductImage.objects.all():
    if img.image:
        image_path = os.path.join(MEDIA_DIR, os.path.basename(img.image.name))
        if os.path.exists(image_path):
            result = cloudinary.uploader.upload(image_path, folder="products/")
            img.image = result['secure_url']
            img.save()
            print(f"✅ Uploaded {image_path} -> {img.image}")
        else:
            print(f"⚠️ File not found: {image_path}")
    else:
        print(f"ℹ️ No local image for ProductImage id {img.id}")
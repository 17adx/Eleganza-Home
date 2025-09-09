from rest_framework import serializers
from .models import Category, Brand, Tag, Product, ProductImage, Review, Wishlist
from django.contrib.auth.models import User

# -------------------------------
# Category Serializer
# -------------------------------
# Simple serializer for Category model.
# Exposes: id, name, slug
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


# -------------------------------
# Brand Serializer
# -------------------------------
# Simple serializer for Brand model.
# Exposes: id, name, slug
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug"]


# -------------------------------
# Tag Serializer
# -------------------------------
# Simple serializer for Tag model.
# Exposes: id, name, slug
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


# -------------------------------
# Product Image Serializer
# -------------------------------
# Handles ProductImage model.
# Converts the image field to an absolute URL for frontend consumption.
# class ProductImageSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()

#     class Meta:
#         model = ProductImage
#         fields = ["id", "image"]

#     def get_image(self, obj):
#         if not obj.image:
#             return None

#         # Convert to string
#         url = str(obj.image.url)

#         # If the URL already starts with http(s), return it as-is (Cloudinary)
#         if url.startswith("http"):
#             return url

#         # Otherwise, build absolute URI (local media)
#         request = self.context.get("request")
#         if request:
#             return request.build_absolute_uri(url)
#         return url

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image"]

    def get_image(self, obj):
        if not obj.image:
            return None

        # Convert to string
        url = str(obj.image.url)

        # If the URL already starts with http(s), return it as-is (Cloudinary)
        if url.startswith("http"):
            return url

        # Otherwise, build absolute URI (local media)
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url

# -------------------------------
# User Serializer
# -------------------------------
# Exposes basic user info along with the avatar from related Profile.
class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)  # fetch avatar from related profile

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']


# -------------------------------
# Review Serializer
# -------------------------------
# Nested serializer to include the user who submitted the review.
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # read-only nested user info

    class Meta:
        model = Review
        fields = ["id", "user", "rating", "comment", "created_at"]


# -------------------------------
# Product Serializer
# -------------------------------
# Handles Product model with nested images and reviews.
# Computes final price based on discount_percent.
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)  # nested images
    reviews = serializers.SerializerMethodField()  # nested reviews with user info
    final_price = serializers.SerializerMethodField()  # computed price after discount

    # Assign category, brand, and tags by slug
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    brand = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Brand.objects.all(),
        allow_null=True,
        required=False
    )
    tags = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )

    seller = serializers.StringRelatedField(read_only=True)  # display seller username

    class Meta:
        model = Product
        fields = [
            "id", "seller", "title", "description", "price", "stock",
            "category", "brand", "discount_percent", "featured",
            "created_at", "tags", "images", "reviews", "final_price"
        ]
        read_only_fields = ["seller"]

    def get_final_price(self, obj):
        """Compute final price after discount."""
        if obj.discount_percent:
            return round(float(obj.price) * (100 - obj.discount_percent) / 100, 2)
        return float(obj.price)

    def get_reviews(self, obj):
        """Return reviews nested with user info."""
        reviews = obj.reviews.all().select_related('user')
        serialized_reviews = []
        for r in reviews:
            avatar_url = None
            if hasattr(r.user, "profile") and r.user.profile.avatar:
                avatar_url = str(r.user.profile.avatar.url)
                if not avatar_url.startswith("http"):
                    request = self.context.get("request")
                    if request:
                        avatar_url = request.build_absolute_uri(avatar_url)
            serialized_reviews.append({
                "id": r.id,
                "user": {
                    "id": r.user.id,
                    "username": r.user.username,
                    "avatar": avatar_url
                },
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at
            })
        return serialized_reviews


# -------------------------------
# Wishlist Serializer
# -------------------------------
# Serializes Wishlist model and nests the ProductSerializer.
# Allows creating a wishlist item via product_id.
class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # nested product info
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True  # used for creation only
    )

    class Meta:
        model = Wishlist
        fields = ["id", "product", "product_id", "created_at"]

from django.db import models
from django.contrib.auth.models import User

# -------------------------------
# Category model
# -------------------------------
class Category(models.Model):
    # Category name must be unique
    name = models.CharField(max_length=120, unique=True)
    # Slug for URLs, also unique
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name  # Returns human-readable category name

# -------------------------------
# Brand model
# -------------------------------
class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name  # Returns brand name

# -------------------------------
# Tag model
# -------------------------------
class Tag(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name  # Returns tag name

# -------------------------------
# Product model
# -------------------------------
class Product(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)  # Inventory count
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)
    discount_percent = models.PositiveIntegerField(default=0)  # Discount percentage
    featured = models.BooleanField(default=False)  # Flag for featured products
    is_approved = models.BooleanField(default=True)  # Admin approval flag
    created_at = models.DateTimeField(auto_now_add=True)  # Automatically set on creation
    updated_at = models.DateTimeField(auto_now=True)      # Automatically set on update
    tags = models.ManyToManyField(Tag, blank=True, related_name="products")  # Many-to-many relationship

    def __str__(self):
        return self.title  # Human-readable representation

# -------------------------------
# ProductImage model
# -------------------------------
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")  # Stores images under media/products/

# -------------------------------
# Review model
# -------------------------------
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)  # Rating out of 5
    comment = models.TextField(blank=True)  # Optional comment
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for review creation

    class Meta:
        # Ensures a user can review a product only once
        unique_together = ("product", "user")

    def __str__(self):
        return f"Review({self.product_id}, {self.user_id})"  # Debug-friendly string

# -------------------------------
# Wishlist model
# -------------------------------
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlists")
    product = models.ForeignKey("Product", on_delete=models.CASCADE, related_name="wishlists")
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when product added to wishlist

    class Meta:
        # Ensures a user cannot add the same product multiple times
        unique_together = ("user", "product")

    def __str__(self):
        return f"Wishlist({self.user.username}, {self.product.title})"  # Debug-friendly string
from django.contrib import admin
from .models import Category, Brand, Tag, Product, ProductImage, Review

# --------------------------------------
# Inline for Product Images
# Allows adding/editing multiple images directly inside Product admin page
# --------------------------------------
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # Number of empty image fields to display by default

# --------------------------------------
# Product Admin
# Customizes the Django admin interface for Product model
# --------------------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Columns displayed in the product list view
    list_display = ("title", "price", "stock", "featured", "is_approved", "created_at")
    # Filters available in the sidebar
    list_filter = ("featured", "is_approved", "category", "brand")
    # Searchable fields
    search_fields = ("title", "description")
    # Include inline for managing related ProductImage instances
    inlines = [ProductImageInline]
    # Custom admin actions
    actions = ['approve_products', 'feature_products']

    # Action to approve multiple products at once
    def approve_products(self, request, queryset):
        queryset.update(is_approved=True)
    approve_products.short_description = "Approve selected products"

    # Action to mark multiple products as featured
    def feature_products(self, request, queryset):
        queryset.update(featured=True)
    feature_products.short_description = "Mark selected products as featured"

# --------------------------------------
# Register other models with default admin interface
# --------------------------------------
admin.site.register(Category)  # Category model
admin.site.register(Brand)     # Brand model
admin.site.register(Tag)       # Tag model
admin.site.register(Review)    # Review model
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, TagViewSet, ProductViewSet, ReviewViewSet, WishlistViewSet
from rest_framework_nested.routers import NestedSimpleRouter  # Optional: allows nested resources like product reviews

# -------------------------------
# Main router
# -------------------------------
# DefaultRouter automatically generates standard CRUD URLs for each viewset.
router = DefaultRouter()

# Register products endpoint
# - Provides: /products/ [GET, POST], /products/<id>/ [GET, PUT, PATCH, DELETE]
router.register("products", ProductViewSet, basename="product")

# Register categories endpoint
# - Provides: /categories/ [GET, POST], /categories/<id>/ [GET, PUT, PATCH, DELETE]
router.register("categories", CategoryViewSet, basename="category")

# Register brands endpoint
# - Provides: /brands/ [GET, POST], /brands/<id>/ [GET, PUT, PATCH, DELETE]
router.register("brands", BrandViewSet, basename="brand")

# Register tags endpoint
# - Provides: /tags/ [GET, POST], /tags/<id>/ [GET, PUT, PATCH, DELETE]
router.register("tags", TagViewSet, basename="tag")

# Register wishlist endpoint
# - Only accessible by authenticated users
router.register("wishlist", WishlistViewSet, basename="wishlist")


# -------------------------------
# Nested router for reviews
# -------------------------------
# Reviews are associated with a specific product, hence nested under /products/<product_pk>/reviews/
# We are manually wiring these URLs instead of using rest_framework_nested (to keep dependencies minimal)
urlpatterns = [
    *router.urls,  # Include all automatically generated routes
    path(
        "products/<int:product_pk>/reviews/",  # Nested URL for reviews under a specific product
        ReviewViewSet.as_view({"get": "list", "post": "create"}),  # Map GET to list, POST to create
        name="review-list-create"
    ),
]
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import filters as drf_filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Category, Brand, Tag, Product, ProductImage, Review, Wishlist
from .serializers import (
    CategorySerializer, BrandSerializer, TagSerializer,
    ProductSerializer, ProductImageSerializer, ReviewSerializer, WishlistSerializer
)


# -------------------------------
# Custom Permission Class
# -------------------------------
class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Allows only the seller of a product (or admin) to edit it.
    Read-only requests are allowed for everyone.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True  # Allow GET, HEAD, OPTIONS requests
        # Allow modification only for the seller or admin
        return obj.seller == request.user or request.user.is_staff


# -------------------------------
# Categories
# -------------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    """
    Provides full CRUD for product categories.
    Anyone can view categories; no authentication required.
    """
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# -------------------------------
# Brands
# -------------------------------
class BrandViewSet(viewsets.ModelViewSet):
    """
    Provides full CRUD for brands.
    Publicly accessible.
    """
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


# -------------------------------
# Tags
# -------------------------------
class TagViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for product tags.
    Publicly accessible.
    """
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


# -------------------------------
# Product Filtering
# -------------------------------
class ProductFilter(django_filters.FilterSet):
    """
    Enable filtering products by category slug.
    Additional filters: brand, tags.
    """
    category = django_filters.CharFilter(field_name="category__slug")

    class Meta:
        model = Product
        fields = ["category", "brand", "tags"]


# -------------------------------
# Products
# -------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD for products with filtering, search, and custom seller views.
    Only authenticated users can modify; read-only for others.
    """
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]  # Handle file uploads
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter]
    search_fields = ["title", "description"]
    filterset_class = ProductFilter

    def get_serializer_context(self):
        """
        Pass the request to the serializer to handle nested or context-dependent data.
        """
        return {"request": self.request}

    def perform_create(self, serializer):
        """
        Automatically set the seller as the logged-in user.
        Handle multiple image uploads associated with the product.
        """
        product = serializer.save(seller=self.request.user)
        images = self.request.FILES.getlist("images")
        for img in images:
            ProductImage.objects.create(product=product, image=img)

    def perform_update(self, serializer):
        """
        Update product data and allow adding new images without deleting old ones.
        """
        product = serializer.save()
        images = self.request.FILES.getlist("images")
        for img in images:
            ProductImage.objects.create(product=product, image=img)

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """
        Custom endpoint to retrieve all featured products.
        """
        featured_products = Product.objects.filter(featured=True).order_by("-created_at")
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="seller")
    def seller_products(self, request):
        """
        Custom endpoint to get all products created by the logged-in seller.
        Checks if the user has a seller profile.
        """
        user = request.user
        profile = getattr(user, "profile", None)
        if profile is None or not profile.is_seller:
            return Response({"detail": "You are not a seller"}, status=403)
        products = Product.objects.filter(seller=user).order_by("-created_at")
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


# -------------------------------
# Reviews
# -------------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    """
    CRUD for reviews of a specific product.
    Only authenticated users can create reviews.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Retrieve reviews only for the product specified in the URL (nested routing).
        Orders reviews by newest first.
        """
        return Review.objects.filter(product_id=self.kwargs["product_pk"]).order_by("-created_at")

    def perform_create(self, serializer):
        """
        Automatically assign the review to the logged-in user and associated product.
        """
        serializer.save(user=self.request.user, product_id=self.kwargs["product_pk"])


# -------------------------------
# Product Images
# -------------------------------
class ProductImageViewSet(viewsets.ModelViewSet):
    """
    CRUD for images of a specific product.
    Only the seller or admin can modify images.
    """
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]

    def get_queryset(self):
        """
        Get all images associated with a given product.
        """
        return ProductImage.objects.filter(product_id=self.kwargs["product_pk"])


# -------------------------------
# Wishlist
# -------------------------------
class WishlistViewSet(viewsets.ModelViewSet):
    """
    Manage wishlist items for the authenticated user.
    Only logged-in users can create or view wishlist.
    """
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns wishlist items of the logged-in user, ordered by creation date.
        """
        return Wishlist.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        """
        Assign the wishlist item to the logged-in user automatically.
        """
        serializer.save(user=self.request.user)
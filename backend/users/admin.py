from django.contrib import admin
from .models import Profile, SellerProfile, CustomerProfile

# ------------------------------
# Base Admin for Profiles
# ------------------------------
class BaseProfileAdmin(admin.ModelAdmin):
    """
    Base admin class for Profile-related models.
    Defines common fields and search functionality to reduce repetition.
    """
    list_display = ("user", "mobile", "city", "country", "is_seller")  # Columns shown in admin list
    search_fields = ("user__username", "mobile", "city", "country")   # Fields searchable via admin search bar


# ------------------------------
# Seller Profiles Admin
# ------------------------------
@admin.register(SellerProfile)
class SellerProfileAdmin(BaseProfileAdmin):
    """
    Admin for SellerProfile proxy model.
    Filters queryset to display only users marked as sellers.
    """
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_seller=True)


# ------------------------------
# Customer Profiles Admin
# ------------------------------
@admin.register(CustomerProfile)
class CustomerProfileAdmin(BaseProfileAdmin):
    """
    Admin for CustomerProfile proxy model.
    Filters queryset to display only users not marked as sellers (i.e., customers).
    """
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_seller=False)
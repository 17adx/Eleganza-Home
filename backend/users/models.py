from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import gettext_lazy as _

# ------------------------------
# Profile Associated with the default User model
# ------------------------------
class Profile(models.Model):
    """
    Extends the default Django User model with additional fields.

    Attributes:
        user (OneToOneField): Each Profile is linked to exactly one User.
        mobile (CharField): Optional mobile number for the user.
        birthdate (DateField): Optional birthdate.
        address, city, country (CharField): Optional address details.
        avatar (ImageField): Optional profile picture, stored in 'avatars/' directory.
        is_seller (BooleanField): Flag to indicate if the user is a seller.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    mobile = models.CharField(max_length=20, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_seller = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile({self.user.username})"


# ------------------------------
# Proxy Models for Admin Convenience
# ------------------------------
class SellerProfile(Profile):
    """
    Proxy model to represent seller users separately in the admin panel.
    Inherits all fields from Profile but allows custom admin display.
    """
    class Meta:
        proxy = True
        verbose_name = _("Seller")
        verbose_name_plural = _("Sellers")


class CustomerProfile(Profile):
    """
    Proxy model to represent customer users separately in the admin panel.
    Inherits all fields from Profile but allows custom admin display.
    """
    class Meta:
        proxy = True
        verbose_name = _("Customer")
        verbose_name_plural = _("Customers")
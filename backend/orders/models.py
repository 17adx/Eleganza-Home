from django.db import models
from django.contrib.auth.models import User
from catalog.models import Product

# -----------------------------------
# Cart model
# -----------------------------------
class Cart(models.Model):
    # Linked to a registered user (optional for guests)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts", null=True, blank=True)
    # Session key for guest users (optional)
    session_key = models.CharField(max_length=120, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)  # Record when the cart was created
    updated_at = models.DateTimeField(auto_now=True)      # Record when the cart was last updated

    def __str__(self):
        return f"Cart(user={self.user}, session={self.session_key})"


# -----------------------------------
# CartItem model
# -----------------------------------
class CartItem(models.Model):
    # Each item belongs to a cart
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    # The product in the cart
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # Quantity of this product
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"


# -----------------------------------
# Order model
# -----------------------------------
class Order(models.Model):
    # Possible order statuses
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
    ]
    # Supported payment methods
    PAYMENT_CHOICES = [
        ("COD", "Cash on Delivery"),
        ("CARD", "Credit/Debit Card"),
        ("PAYPAL", "PayPal"),
    ]

    # Registered user who made the order (optional for guest checkout)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders", null=True, blank=True)
    # Session key for guest checkout
    session_key = models.CharField(max_length=100, null=True, blank=True)

    shipping_address = models.CharField(max_length=255)  # Shipping destination
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="COD")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Total price of the order
    created_at = models.DateTimeField(auto_now_add=True)  # When the order was created

    def __str__(self):
        return f"Order(id={self.id}, user={self.user}, total=${self.total})"


# -----------------------------------
# OrderItem model
# -----------------------------------
class OrderItem(models.Model):
    # Each item belongs to an order
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    # Product reference
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    # Price per unit at the time of order (with discount applied if any)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Quantity ordered
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.title} (${self.price})"
from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from catalog.models import Product
from catalog.serializers import ProductSerializer
from django.core.validators import MinLengthValidator
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

# -----------------------------------
# CartItem Serializer
# -----------------------------------
class CartItemSerializer(serializers.ModelSerializer):
    # Nested product representation (read-only)
    product = ProductSerializer(read_only=True)
    # Write-only field to allow creating items by product ID
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    # Compute the line total (price * quantity, with discount applied if available)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "cart", "product", "product_id", "quantity", "line_total"]
        read_only_fields = ["cart"]

    # Override create to use product_id instead of nested product object
    def create(self, validated_data):
        product = validated_data.pop("product_id")
        return CartItem.objects.create(product=product, **validated_data)

    # Compute total price for this cart item
    def get_line_total(self, obj):
        price = float(obj.product.price)
        if hasattr(obj.product, "discount_percent") and obj.product.discount_percent:
            price = price * (100 - obj.product.discount_percent) / 100
        return round(price * obj.quantity, 2)


# -----------------------------------
# Cart Serializer
# -----------------------------------
class CartSerializer(serializers.ModelSerializer):
    # Nested items
    items = CartItemSerializer(many=True, read_only=True)
    # Compute subtotal for the entire cart
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "session_key", "items", "subtotal"]
        read_only_fields = ["user"]

    def get_subtotal(self, obj):
        subtotal = 0.0
        for it in obj.items.all():
            price = float(it.product.price)
            if hasattr(it.product, "discount_percent") and it.product.discount_percent:
                price = price * (100 - it.product.discount_percent) / 100
            subtotal += price * it.quantity
        return round(subtotal, 2)


# -----------------------------------
# OrderItem Serializer
# -----------------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    # Display product title (read-only) for convenience
    product_title = serializers.ReadOnlyField(source="product.title")

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_title", "price", "quantity"]


# -----------------------------------
# Order Serializer
# -----------------------------------
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    # Validate shipping address length
    shipping_address = serializers.CharField(validators=[MinLengthValidator(10)])

    class Meta:
        model = Order
        fields = [
            "id", "user", "session_key", "shipping_address",
            "payment_method", "status", "total", "created_at", "items"
        ]
        read_only_fields = ["user", "status", "total", "created_at"]

    # Override create to handle nested order items and compute totals
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user if self.context["request"].user.is_authenticated else None
        session_key = self.context["request"].data.get("session_key", "")

        # Use transaction.atomic() to ensure data integrity
        with transaction.atomic():
            # Create the order
            order = Order.objects.create(user=user, session_key=session_key, **validated_data)
            total = 0.0

            # Loop through each item and create OrderItem
            for item in items_data:
                product = item["product"]
                price = float(product.price)
                if getattr(product, "discount_percent", 0):
                    price = price * (100 - product.discount_percent) / 100
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=round(price, 2),
                    quantity=item["quantity"]
                )
                total += price * item["quantity"]

            # Save total on the order
            order.total = round(total, 2)
            order.save()

            # Clear user's cart after order creation
            if user:
                CartItem.objects.filter(cart__user=user).delete()
            elif session_key:
                CartItem.objects.filter(cart__session_key=session_key).delete()

            # Send confirmation email
            try:
                email_to = user.email if user else self.context["request"].data.get("email")
                if email_to:
                    send_mail(
                        subject=f"Order Confirmation #{order.id}",
                        message=f"Thank you for your order! Total: ${order.total}\nShipping to: {order.shipping_address}\nPayment Method: {order.payment_method}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email_to],
                        fail_silently=True
                    )
            except Exception as e:
                print("Email send failed:", e)

        return order
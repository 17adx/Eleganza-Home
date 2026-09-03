from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from .permissions import IsCartOwner
# -----------------------------------
# Cart ViewSet
# -----------------------------------
class CartViewSet(viewsets.ModelViewSet):
    """
    Handles all CRUD operations for Cart.
    Can fetch carts for logged-in users or by session key for guests.
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can access cart (guest or authenticated)

    def get_queryset(self):
        """
        Return carts depending on authentication or session.
        """
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            return Cart.objects.filter(user=user)
        session_key = self.request.query_params.get("session_key", "")
        if session_key:
            return Cart.objects.filter(session_key=session_key)
        return Cart.objects.none()

    def perform_create(self, serializer):
        """
        Save a new cart and associate with authenticated user if available.
        """
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def my(self, request):
        """
        Custom action to retrieve the current user's cart.
        Handles both authenticated users and guest users with session_key.
        """
        user = request.user if request.user.is_authenticated else None
        session_key = request.query_params.get("session_key", "")
        cart = None
        if user:
            cart, _ = Cart.objects.get_or_create(user=user)
        elif session_key:
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)


# -----------------------------------
# CartItem ViewSet
# -----------------------------------
class CartItemViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for items inside a cart.

    ```
    Access is restricted to the owner of the cart.
    """

    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny, IsCartOwner]

    def get_queryset(self):
        """
        Return only items belonging to a cart owned by the current
        authenticated user or guest session.
        """
        cart_id = self.kwargs["cart_pk"]

        queryset = CartItem.objects.filter(
            cart_id=cart_id
        ).select_related(
            "product",
            "product__category",
            "product__brand",
            "product__seller",
        ).prefetch_related(
            "product__images",
            "product__reviews",
            "product__reviews__user",
            "product__tags",
        ).order_by("id")

        if self.request.user.is_authenticated:
            return queryset.filter(cart__user=self.request.user)

        session_key = self.request.query_params.get("session_key", "")

        if session_key:
            return queryset.filter(
                cart__user__isnull=True,
                cart__session_key=session_key,
            )

        return CartItem.objects.none()

    def perform_create(self, serializer):
        """
        Create an item only inside a cart owned by the current user/session.
        """
        cart_id = self.kwargs["cart_pk"]

        cart_queryset = Cart.objects.filter(pk=cart_id)

        if self.request.user.is_authenticated:
            cart_queryset = cart_queryset.filter(
                user=self.request.user
            )
        else:
            session_key = self.request.query_params.get("session_key", "")

            if not session_key:
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "A valid session_key is required for guest carts."
                )

            cart_queryset = cart_queryset.filter(
                user__isnull=True,
                session_key=session_key,
            )

        cart = cart_queryset.first()

        if cart is None:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to access this cart."
            )

        serializer.save(cart=cart)

    @action(detail=True, methods=["patch"])
    def update_quantity(self, request, cart_pk=None, pk=None):
        """
        Increase or decrease the quantity of a cart item.

        The item is resolved through get_queryset(), so ownership
        checks are applied before modification.
        """
        try:
            item = self.get_queryset().get(pk=pk)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        action_type = request.data.get("action")

        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"error": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action_type == "increase":
            item.quantity += quantity

        elif action_type == "decrease":
            item.quantity = max(1, item.quantity - quantity)

        else:
            return Response(
                {
                    "error": (
                        "Invalid action, use 'increase' or 'decrease'"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.save(update_fields=["quantity"])

        serializer = self.get_serializer(item)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )




# -----------------------------------
# Order ViewSet
# -----------------------------------
class OrderViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Orders.
    Only authenticated users can access their own orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns all orders for the authenticated user, ordered by most recent.
        """
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

    @action(detail=False, methods=["get"], url_path="seller")
    def seller_orders(self, request):
        """
        Custom action to retrieve all orders that include products sold by the current user.
        This is useful for sellers to view orders containing their products.
        """
        user = request.user
        queryset = Order.objects.filter(items__product__seller=user).distinct()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
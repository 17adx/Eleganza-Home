from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer

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
    Supports updating quantity via custom action.
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Returns items for the specified cart.
        """
        cart_id = self.kwargs["cart_pk"]
        return CartItem.objects.filter(cart_id=cart_id).order_by("id")

    def perform_create(self, serializer):
        """
        Create a new cart item and associate it with the correct cart.
        """
        cart_id = self.kwargs["cart_pk"]
        cart = get_object_or_404(Cart, pk=cart_id)
        serializer.save(cart=cart)

    @action(detail=True, methods=["patch"])
    def update_quantity(self, request, cart_pk=None, pk=None):
        """
        Custom action to increase or decrease the quantity of a cart item.
        Expects 'action' ('increase' or 'decrease') and optional 'quantity' in request data.
        """
        item = get_object_or_404(CartItem, pk=pk, cart_id=cart_pk)
        action_type = request.data.get("action")
        quantity = int(request.data.get("quantity", 1))

        if action_type == "increase":
            item.quantity += quantity
        elif action_type == "decrease":
            item.quantity = max(1, item.quantity - quantity)  # Prevent quantity from going below 1
        else:
            return Response(
                {"error": "Invalid action, use 'increase' or 'decrease'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.save()
        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
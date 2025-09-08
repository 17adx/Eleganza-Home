from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import CartViewSet, CartItemViewSet, OrderViewSet

# -----------------------------------
# Main router for top-level resources
# -----------------------------------
router = DefaultRouter()
# Cart endpoints: /carts/
router.register("carts", CartViewSet, basename="cart")
# Order endpoints: /orders/
router.register("orders", OrderViewSet, basename="order")

# -----------------------------------
# Nested router for cart items
# -----------------------------------
# This creates endpoints like:
# /carts/{cart_pk}/items/  -> List and create items
# /carts/{cart_pk}/items/{pk}/ -> Retrieve, update, delete a specific item
cart_router = NestedDefaultRouter(router, "carts", lookup="cart")
cart_router.register("items", CartItemViewSet, basename="cart-items")

# -----------------------------------
# URL patterns combining main and nested routers
# -----------------------------------
urlpatterns = [
    # Include all top-level routes from the main router
    path("", include(router.urls)),
    # Include all nested cart-items routes
    path("", include(cart_router.urls)),
]
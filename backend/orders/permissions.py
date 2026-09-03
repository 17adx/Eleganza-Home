from rest_framework import permissions

from .models import Cart

class IsCartOwner(permissions.BasePermission):
    """
    Allow access only when the requested cart belongs to the
    authenticated user or to the supplied guest session key.
    """

    message = "You do not have permission to access this cart."

    def has_permission(self, request, view):
        cart_id = view.kwargs.get("cart_pk")

        # Non-nested cart endpoints do not provide a cart_pk.
        if cart_id is None:
            return True

        try:
            cart = Cart.objects.get(pk=cart_id)
        except Cart.DoesNotExist:
            return False

        if request.user.is_authenticated:
            return cart.user_id == request.user.id

        session_key = request.query_params.get("session_key", "")

        return bool(session_key) and cart.user_id is None and (
            cart.session_key == session_key
        )


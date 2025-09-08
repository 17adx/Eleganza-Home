from django.contrib import admin
from .models import Order, OrderItem

# -----------------------------------
# Admin configuration for OrderItem
# -----------------------------------
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('order', 'product', 'quantity', 'price')
    # You could also add filters or search if needed

# -----------------------------------
# Admin configuration for Order
# -----------------------------------
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('id', 'user', 'status', 'total', 'created_at')
    # Filters for easier navigation
    list_filter = ('status', 'created_at')
    # Search orders by username of the user
    search_fields = ('user__username',)

    # Override changelist view to add extra context (total sales)
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        # Calculate the sum of all order totals currently displayed
        queryset = self.get_queryset(request)
        total_sales = sum(o.total for o in queryset)
        extra_context['total_sales'] = total_sales
        # Pass the extra context to the default changelist view
        return super().changelist_view(request, extra_context=extra_context)
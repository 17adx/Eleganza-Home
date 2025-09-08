from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import handle_auth_cancelled

urlpatterns = [
    # -----------------------------------
    # Home Pages (server-rendered)
    # -----------------------------------
    path("", include("pages.urls")),  # Include URLs for the Pages app (Home, About, Contact...)

    # -----------------------------------
    # User authentication and management
    # -----------------------------------
    path("api/auth/", include("users.urls")),               # Custom user endpoints (profile, etc.)
    path("api/auth/", include("djoser.urls")),              # Djoser standard endpoints (login, registration)
    path("api/auth/", include("djoser.urls.authtoken")),   # Djoser token authentication endpoints

    # -----------------------------------
    # Social login (OAuth)
    # -----------------------------------
    path("api/auth/", include("social_django.urls", namespace="social")), # Social login endpoints
    path('auth/cancelled/', handle_auth_cancelled, name='auth_cancelled'), # Custom handler if social login is cancelled

    # -----------------------------------
    # Catalog (Products, Categories, Tags) & Orders
    # -----------------------------------
    path("api/catalog/", include("catalog.urls")),  # Product catalog API endpoints
    path("api/orders/", include("orders.urls")),    # Orders, cart, checkout endpoints

    # -----------------------------------
    # Admin site
    # -----------------------------------
    path("admin/", admin.site.urls),  # Django admin panel
]

# -----------------------------------
# Media files serving (development only)
# -----------------------------------
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
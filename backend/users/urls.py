from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    MeView, 
    ProfileMeView, 
    ResendActivationEmail, 
    ActivateAccount, 
    SocialLoginJWT, 
    social_login_jwt, 
    handle_auth_cancelled, 
    validate_user_password
)

urlpatterns = [
    # ----------------------------
    # User Registration & Validation
    # ----------------------------
    path("register/", RegisterView.as_view(), name="register"),
    path("validate-password/", validate_user_password, name="validate-password"),  # Validate password strength before registration

    # ----------------------------
    # JWT Authentication Endpoints
    # ----------------------------
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # Obtain JWT tokens (access + refresh)
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # Refresh access token using refresh token

    # ----------------------------
    # Authenticated User Endpoints
    # ----------------------------
    path("me/", MeView.as_view(), name="me"),  # Retrieve or update logged-in user's basic info
    path("me/profile/", ProfileMeView.as_view(), name="profile_me"),  # Retrieve or update logged-in user's profile info

    # ----------------------------
    # Djoser Endpoints (for standard auth features)
    # ----------------------------
    path('auth/', include('djoser.urls')),  # Includes registration, password reset, etc.
    path('auth/', include('djoser.urls.authtoken')),  # Token-based authentication endpoints

    # ----------------------------
    # Account Activation
    # ----------------------------
    path('resend-activation/', ResendActivationEmail.as_view(), name="resend-activation"),  # Resend activation email for inactive accounts
    path('activate/<uidb64>/<token>/', ActivateAccount.as_view(), name='activate-account'),  # Activate account using token

    # ----------------------------
    # Social Authentication (JWT generation)
    # ----------------------------
    path("api/auth/social-login-jwt/", SocialLoginJWT.as_view(), name="social-login-jwt"),  # JWT via APIView for social login
    path('social-login-jwt/', social_login_jwt, name='social-login-jwt'),  # JWT via function-based view

    # ----------------------------
    # Social Login Exception Handling
    # ----------------------------
    path('auth/complete/', handle_auth_cancelled, name='auth_cancelled'),  # Redirect if social login is cancelled
]
from pathlib import Path
import os
from datetime import timedelta
import dj_database_url


# -----------------------------------
# Base directory of the project
# -----------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Security key & debug
SECRET_KEY = os.environ.get("SECRET_KEY")  # Keep secret in environment variable
DEBUG = False  # Set to False in production
ALLOWED_HOSTS = ["*"]  # Allow all hosts for development

# -----------------------------------
# Installed applications
# -----------------------------------
INSTALLED_APPS = [
    # Django default apps
    "django.contrib.admin",       # Admin panel
    "django.contrib.auth",        # User authentication system
    "django.contrib.contenttypes",# Content types framework
    "django.contrib.sessions",    # Session management
    "django.contrib.messages",    # Temporary messages (flash)
    "django.contrib.staticfiles", # Static file management

    # Third-party apps
    'social_django',              # Social login (Google, Facebook, Twitter)
    "rest_framework",             # Django REST Framework
    "django_filters",             # Filters for DRF
    "corsheaders",                # Handle Cross-Origin requests
    'djoser',                     # Ready-to-use user management endpoints

    # Local apps
    "users",                      # Custom user management (profiles, auth)
    "catalog",                    # Products, categories, tags
    "orders",                     # Orders and cart management
    "pages",                      # Public pages: home, about, contact
]

# -----------------------------------
# Middleware configuration
# -----------------------------------
MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "corsheaders.middleware.CorsMiddleware",      # Handle CORS
    'django.middleware.common.CommonMiddleware',  # General request enhancements
    "django.middleware.security.SecurityMiddleware", # Security headers
    "django.contrib.sessions.middleware.SessionMiddleware", # Session support
    "django.middleware.csrf.CsrfViewMiddleware",  # CSRF protection
    "django.contrib.auth.middleware.AuthenticationMiddleware", # Attach user to request
    "django.contrib.messages.middleware.MessageMiddleware",    # Flash messages
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Prevent clickjacking
    "users.views.SocialAuthExceptionMiddleware", # Custom middleware for social auth errors
]

ROOT_URLCONF = "ecommerce.urls"

# -----------------------------------
# Templates configuration
# -----------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # Add custom template dirs if needed
        "APP_DIRS": True,  # Automatically load templates from apps
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "ecommerce.wsgi.application"

# -----------------------------------
# Database configuration (SQLite for dev)
# -----------------------------------
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}

# -----------------------------------
# Social Authentication Backends
# -----------------------------------
AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',     # Google login
    'social_core.backends.facebook.FacebookOAuth2', # Facebook login
    'social_core.backends.twitter.TwitterOAuth',    # Twitter login
    'django.contrib.auth.backends.ModelBackend',    # Default Django auth
)

# API keys (add your keys in environment variables)
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get("SOCIAL_AUTH_GOOGLE_OAUTH2_KEY")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get("SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET")
SOCIAL_AUTH_FACEBOOK_KEY = '<FACEBOOK_APP_ID>'
SOCIAL_AUTH_FACEBOOK_SECRET = '<FACEBOOK_APP_SECRET>'
SOCIAL_AUTH_TWITTER_KEY = '<TWITTER_API_KEY>'
SOCIAL_AUTH_TWITTER_SECRET = '<TWITTER_API_SECRET>'

# Redirect URLs for social auth
SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:5173/social-login/'  # After login success
SOCIAL_AUTH_LOGIN_ERROR_URL = '/auth/cancelled/'                        # On error/cancel
LOGOUT_REDIRECT_URL = '/'                                                # After logout
SOCIAL_AUTH_POSTGRES_JSONFIELD = True

# Force new social account creation for new emails
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

# Optionally prevent associating by email
SOCIAL_AUTH_ASSOCIATE_BY_EMAIL = False

# -----------------------------------
# Password validation
# -----------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -----------------------------------
# Internationalization
# -----------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -----------------------------------
# Static & Media files
# -----------------------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Development: where Django will look for static files in your apps + project
STATICFILES_DIRS = [
    BASE_DIR / "static",  # Project-level static folder
]

# Production: where `collectstatic` will collect all static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -----------------------------------
# Django REST Framework settings
# -----------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

# -----------------------------------
# Simple JWT settings
# -----------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# -----------------------------------
# CORS Settings (for frontend on localhost:5173)
# -----------------------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://17adx.github.io",
]
CSRF_TRUSTED_ORIGINS = [
    "https://17adx.github.io/Eleganza-Home/",
]

# -----------------------------------
# Email settings (for development)
# -----------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# -----------------------------------
# Djoser Settings (User management)
# -----------------------------------
DJOSER = {
    'SEND_ACTIVATION_EMAIL': False,
    'PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND': False,
    'ACTIVATION_URL': 'activate/{uid}/{token}/',  
    "PASSWORD_RESET_CONFIRM_URL": "password-reset-confirm/{uid}/{token}/",
    'EMAIL': {
        'activation': 'users.email.ActivationEmail',
        "password_reset": "users.email.PasswordResetEmail",
    },
}

# Frontend domain
DOMAIN = "https://17adx.github.io/Eleganza-Home/"

# Optional account verification
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
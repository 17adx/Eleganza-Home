from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer
from .models import Profile
from djoser.conf import settings as djoser_settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from users.email import ActivationEmail, send_welcome_email
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from social_core.exceptions import AuthCanceled
from django.utils.deprecation import MiddlewareMixin
import re
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from django.conf import settings

# -----------------------------------
# Simple API for sending arbitrary email
# -----------------------------------
@api_view(['POST'])
def send_email(request):
    """
    Send an email to a specified recipient.
    Expects 'subject', 'message', 'recipient' in POST data.
    """
    subject = request.data.get('subject', 'No Subject')
    message = request.data.get('message', 'No Content')
    recipient = request.data.get('recipient', 'yourmail@example.com')

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )
    return Response({"status": "Email sent successfully!"})

# -----------------------------------
# Test endpoint for sending a welcome email
# -----------------------------------
def test_email(request):
    send_welcome_email("test@example.com")
    return HttpResponse("Email sent!")

# -----------------------------------
# Redirects user if social auth login is cancelled
# -----------------------------------
def handle_auth_cancelled(request, exception=None):
    return redirect('http://localhost:5173/login/')

# -----------------------------------
# Middleware to catch social auth exceptions (like AuthCanceled)
# -----------------------------------
class SocialAuthExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, AuthCanceled):
            return redirect("http://localhost:5173/login/")
        return None

# -----------------------------------
# Generate JWT tokens for authenticated social login
# -----------------------------------
def social_login_jwt(request):
    user = request.user
    if user.is_authenticated:
        refresh = RefreshToken.for_user(user)
        profile = getattr(user, "profile", None)

        return JsonResponse({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
            'is_seller': profile.is_seller if profile else False,
            'avatar': profile.avatar.url if profile and profile.avatar else None,
        })
    return JsonResponse({'error': 'User not authenticated'}, status=401)

# APIView version for social login JWT
class SocialLoginJWT(APIView):
    """
    Returns JWT tokens for authenticated users logging in via social platforms.
    """
    def post(self, request):
        user = request.user
        if user.is_authenticated:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response({"detail": "User not authenticated"}, status=401)

# -----------------------------------
# Account activation via emailed token
# -----------------------------------
class ActivateAccount(APIView):
    """
    Activates a user account given uidb64 and token.
    Returns JWT tokens on success.
    """
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "detail": "Account activated successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=200)
        else:
            return Response({"detail": "Invalid activation link."}, status=400)

# -----------------------------------
# Resend activation email for inactive accounts
# -----------------------------------
class ResendActivationEmail(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=400)
        
        users = User.objects.filter(email=email, is_active=False)
        if not users.exists():
            return Response({"detail": "No inactive account found with this email."}, status=404)
        
        errors = []
        for user in users:
            try:
                email_obj = ActivationEmail(context={'user': user})
                email_obj.send(to=[user.email])
            except Exception as e:
                errors.append(str(e))
        
        if errors:
            return Response({"detail": f"Some emails failed to send: {errors}"}, status=500)
        return Response({"detail": "Activation email resent."}, status=200)

# -----------------------------------
# Register a new user
# -----------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    fields = '__all__'

# -----------------------------------
# Retrieve or update the authenticated user's basic info
# -----------------------------------
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# -----------------------------------
# Retrieve or update the authenticated user's profile
# -----------------------------------
class ProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure profile exists, otherwise create
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

# -----------------------------------
# Validate user password with custom rules
# -----------------------------------
@api_view(["POST"])
def validate_user_password(request):
    """
    Validates password strength using Django validators + custom rules.
    Returns JSON with validation result and errors (if any).
    """
    password = request.data.get("password", "")
    custom_errors = []

    try:
        validate_password(password)
    except DjangoValidationError as e:
        for msg in e.messages:
            if "too short" in msg.lower():
                custom_errors.append("Password must be at least 8 characters long.")
            elif "too common" in msg.lower():
                custom_errors.append("Password is too common.")
            elif "entirely numeric" in msg.lower():
                custom_errors.append("Password cannot be only numbers.")
            else:
                custom_errors.append(msg)

    # Custom regex rules
    if not re.search(r"[A-Z]", password):
        custom_errors.append("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        custom_errors.append("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", password):
        custom_errors.append("Password must contain at least one number.")

    if custom_errors:
        return Response({"valid": False, "errors": custom_errors}, status=status.HTTP_200_OK)

    return Response({"valid": True, "errors": []}, status=status.HTTP_200_OK)
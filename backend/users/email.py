from djoser import email
from djoser.conf import settings as djoser_settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.contrib.auth.models import User
from djoser.email import PasswordResetEmail as BasePasswordResetEmail
from .email_utils import send_email
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

# ------------------------------
# Activation Email
# ------------------------------
class ActivationEmail(email.ActivationEmail):
    """
    Custom activation email for user account verification.
    Overrides Djoser's default to include a full activation URL using the frontend domain.
    """
    template_name = "email/activation.html"

    def get_context_data(self):
        """
        Adds custom activation_url to the context for the email template.
        """
        context = super().get_context_data()
        user = context["user"]
        token = context["token"]

        # Encode user ID in base64 format
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Format activation path and prepend frontend domain
        activation_path = djoser_settings.ACTIVATION_URL.format(uid=uidb64, token=token)
        context["activation_url"] = f"http://{settings.DOMAIN}/{activation_path}"
        return context

# ------------------------------
# Password Reset Email
# ------------------------------
class PasswordResetEmail(BasePasswordResetEmail):
    """
    Custom password reset email that sends a full reset URL and triggers the email utility.
    """
    def get_context_data(self):
        """
        Adds custom reset_url and sends the email using the send_email helper.
        """
        context = super().get_context_data()
        user = context["user"]
        token = context["token"]

        # Encode user ID in base64 format
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Format reset path and prepend frontend domain
        reset_path = djoser_settings.PASSWORD_RESET_CONFIRM_URL.format(uid=uidb64, token=token)
        context["reset_url"] = f"http://{settings.DOMAIN}/{reset_path}"

        # Send email using reusable email utility
        send_email("email/password_reset_email", user, context, subject="Password Reset Request")
        return context

# ------------------------------
# Welcome Email
# ------------------------------
def send_welcome_email(user_email):
    """
    Sends a welcome email to a new user after registration.
    Uses both plain-text and HTML email content.
    """
    subject = "Welcome to Our Site!"
    from_email = "youremail@example.com"
    to = [user_email]

    # Plain-text fallback
    text_content = "Welcome to our site! We're glad to have you."

    # HTML content using template
    html_content = render_to_string("emails/welcome.html", {"username": user_email})

    # Create and send email with both HTML and plain-text alternatives
    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
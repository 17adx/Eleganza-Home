from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def send_email(template_name, user, context=None, subject="Notification"):
    """
    Sends an email to a given user with both plain-text and HTML content.

    Parameters:
    - template_name (str): The name of the HTML template (without .html extension) in your templates folder.
    - user (User): Django User object to send the email to.
    - context (dict, optional): Additional context variables for rendering the template.
    - subject (str, optional): Subject line of the email (default: "Notification").

    Functionality:
    1. Renders the HTML template with provided context and the user object.
    2. Provides a fallback plain-text message.
    3. Sends the email using Django's EmailMultiAlternatives, allowing both HTML and plain-text versions.
    """
    from_email = "youremail@example.com"  # Sender email address
    to = [user.email]  # Recipient list

    # Render HTML template
    html_content = render_to_string(
        f"{template_name}.html",
        {**(context or {}), "user": user}  # Merge context with user
    )

    # Fallback plain-text content
    text_content = f"Hello {user.username}, please check your email."

    # Create email object with both plain-text and HTML alternatives
    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()  # Send the email
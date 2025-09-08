from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

# ----------------------------
# Basic User Serializer
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    """
    Serializes the built-in Django User model.
    Includes only essential fields for front-end display or API responses.
    """
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


# ----------------------------
# Profile Serializer
# ----------------------------
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializes the custom Profile model.
    Embeds the UserSerializer for the related user.
    Read-only: cannot modify user data via this serializer.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "mobile", "birthdate", "address", "city", "country", "avatar", "is_seller"]


# ----------------------------
# Registration Serializer
# ----------------------------
class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration including profile creation.
    Validates password confirmation and manages optional profile fields.
    """
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    mobile = serializers.CharField(write_only=True, required=False, allow_blank=True)
    avatar = serializers.ImageField(write_only=True, required=False, allow_null=True)
    is_seller = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "confirm_password",
            "mobile",
            "avatar",
            "is_seller",
        ]

    def validate(self, data):
        """
        Ensures that password and confirm_password match.
        Raises a ValidationError if they do not match.
        """
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """
        Creates a new User instance (inactive by default) and associated Profile.
        Handles optional fields like mobile, avatar, and is_seller.
        """
        # Extract optional profile fields
        mobile = validated_data.pop("mobile", "")
        avatar = validated_data.pop("avatar", None)
        is_seller = validated_data.pop("is_seller", False)
        
        # Remove confirm_password before creating the user
        validated_data.pop("confirm_password")
        
        # Extract and set password securely
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data, is_active=False)
        user.set_password(password)
        user.save()

        # Create related Profile
        Profile.objects.create(
            user=user,
            mobile=mobile,
            avatar=avatar,
            is_seller=is_seller,
        )

        return user
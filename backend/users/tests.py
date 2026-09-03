from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Profile


class UserRegistrationTests(APITestCase):
    def test_user_registration(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123",
            "confirm_password": "TestPassword123",
            "mobile": "01000000000",
            "is_seller": False,
        }

        response = self.client.post(
            "/api/auth/register/",
            payload,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="testuser")

        self.assertFalse(user.is_active)
        self.assertTrue(Profile.objects.filter(user=user).exists())

        profile = user.profile
        self.assertEqual(profile.mobile, "01000000000")
        self.assertFalse(profile.is_seller)

    def test_registration_rejects_password_mismatch(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "username": "mismatchuser",
            "email": "mismatch@example.com",
            "password": "TestPassword123",
            "confirm_password": "DifferentPassword123",
            "mobile": "01000000000",
            "is_seller": False,
        }

        response = self.client.post(
            "/api/auth/register/",
            payload,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            User.objects.filter(username="mismatchuser").exists()
        )


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="authuser",
            email="auth@example.com",
            password="TestPassword123",
            first_name="Auth",
            last_name="User",
            is_active=True,
        )

        self.profile = Profile.objects.create(
            user=self.user,
            mobile="01000000000",
            is_seller=False,
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "authuser",
                "password": "TestPassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "authuser",
                "password": "WrongPassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rejects_inactive_user(self):
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "authuser",
                "password": "TestPassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="TestPassword123",
            first_name="Profile",
            last_name="User",
            is_active=True,
        )

        self.profile = Profile.objects.create(
            user=self.user,
            mobile="01000000000",
            birthdate="1995-01-01",
            address="Test Address",
            city="Cairo",
            country="Egypt",
            is_seller=False,
        )

        self.client.force_authenticate(user=self.user)

    def test_me_endpoint_returns_authenticated_user(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profileuser")
        self.assertEqual(response.data["email"], "profile@example.com")

    def test_profile_me_endpoint_returns_profile(self):
        response = self.client.get("/api/auth/me/profile/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["mobile"], "01000000000")
        self.assertEqual(response.data["city"], "Cairo")
        self.assertEqual(response.data["country"], "Egypt")
        self.assertFalse(response.data["is_seller"])

    def test_me_endpoint_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_me_endpoint_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/auth/me/profile/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

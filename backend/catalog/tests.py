from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
Brand,
Category,
Product,
Review,
Tag,
Wishlist,
)

class CatalogTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
        username="seller",
        email="[seller@example.com](mailto:seller@example.com)",
        password="SellerPassword123",
        )

        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="CustomerPassword123",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="OtherPassword123",
        )

        self.category = Category.objects.create(
            name="Furniture",
            slug="furniture",
        )

        self.brand = Brand.objects.create(
            name="IKEA",
            slug="ikea",
        )

        self.tag = Tag.objects.create(
            name="Modern",
            slug="modern",
        )

        self.product = Product.objects.create(
            seller=self.seller,
            title="Test Sofa",
            description="A comfortable modern sofa for testing.",
            price=Decimal("1000.00"),
            stock=10,
            category=self.category,
            brand=self.brand,
            discount_percent=10,
            featured=True,
        )

        self.product.tags.add(self.tag)

    # -----------------------------------
    # Public catalog endpoints
    # -----------------------------------

    def test_anyone_can_list_categories(self):
        response = self.client.get("/api/catalog/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anyone_can_list_brands(self):
        response = self.client.get("/api/catalog/brands/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anyone_can_list_tags(self):
        response = self.client.get("/api/catalog/tags/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anyone_can_list_products(self):
        response = self.client.get("/api/catalog/products/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_product_final_price_with_discount(self):
        response = self.client.get(
            f"/api/catalog/products/{self.product.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["final_price"], 900.0)

    def test_featured_products_endpoint(self):
        response = self.client.get(
            "/api/catalog/products/featured/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["id"],
            self.product.id,
        )

    # -----------------------------------
    # Product creation and permissions
    # -----------------------------------

    def test_unauthenticated_user_cannot_create_product(self):
        payload = {
            "title": "Unauthorized Product",
            "description": "This should not be created.",
            "price": "500.00",
            "stock": 5,
            "category": self.category.slug,
            "brand": self.brand.slug,
        }

        response = self.client.post(
            "/api/catalog/products/",
            payload,
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_create_product(self):
        self.client.force_authenticate(user=self.seller)

        payload = {
            "title": "New Product",
            "description": "A newly created product.",
            "price": "500.00",
            "stock": 5,
            "category": self.category.slug,
            "brand": self.brand.slug,
            "tags": [self.tag.slug],
            "discount_percent": 20,
        }

        response = self.client.post(
            "/api/catalog/products/",
            payload,
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        product = Product.objects.get(
            title="New Product"
        )

        self.assertEqual(
            product.seller,
            self.seller,
        )

        self.assertEqual(
            product.price,
            Decimal("500.00"),
        )

        self.assertEqual(
            product.tags.count(),
            1,
        )

    def test_only_product_seller_can_update_product(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            f"/api/catalog/products/{self.product.id}/",
            {"title": "Hacked Product"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.title,
            "Test Sofa",
        )

    def test_product_seller_can_update_product(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.patch(
            f"/api/catalog/products/{self.product.id}/",
            {"title": "Updated Sofa"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.title,
            "Updated Sofa",
        )

    # -----------------------------------
    # Filtering and search
    # -----------------------------------

    def test_filter_products_by_category(self):
        response = self.client.get(
            "/api/catalog/products/",
            {"category": self.category.slug},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    def test_search_products_by_title(self):
        response = self.client.get(
            "/api/catalog/products/",
            {"search": "Sofa"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # -----------------------------------
    # Reviews
    # -----------------------------------

    def test_unauthenticated_user_cannot_create_review(self):
        response = self.client.post(
            f"/api/catalog/products/{self.product.id}/reviews/",
            {
                "rating": 5,
                "comment": "Excellent product",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_create_review(self):
        self.client.force_authenticate(
            user=self.customer
        )

        response = self.client.post(
            f"/api/catalog/products/{self.product.id}/reviews/",
            {
                "rating": 5,
                "comment": "Excellent product",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Review.objects.filter(
                product=self.product,
                user=self.customer,
            ).exists()
        )

    # -----------------------------------
    # Wishlist
    # -----------------------------------

    def test_unauthenticated_user_cannot_access_wishlist(self):
        response = self.client.get(
            "/api/catalog/wishlist/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_add_product_to_wishlist(self):
        self.client.force_authenticate(
            user=self.customer
        )

        response = self.client.post(
            "/api/catalog/wishlist/",
            {
                "product_id": self.product.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Wishlist.objects.filter(
                user=self.customer,
                product=self.product,
            ).exists()
        )

    def test_user_can_only_see_own_wishlist(self):
        Wishlist.objects.create(
            user=self.other_user,
            product=self.product,
        )

        self.client.force_authenticate(
            user=self.customer
        )

        response = self.client.get(
            "/api/catalog/wishlist/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            0,
        )
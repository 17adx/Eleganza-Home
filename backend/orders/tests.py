from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from decimal import Decimal
from catalog.models import Product
from orders.models import Cart, CartItem, Order, OrderItem


class OrdersBaseTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword123",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="TestPassword123",
        )

        self.product = Product.objects.create(
            title="Test Product",
            price="100.00",
            seller=self.user,
        )

        self.cart = Cart.objects.create(user=self.user)

    def authenticate(self, user=None):
        user = user or self.user

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": user.username,
                "password": "TestPassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )


class CartTests(OrdersBaseTestCase):
    def test_authenticated_user_can_get_cart(self):
        self.authenticate()

        response = self.client.get("/api/orders/carts/my/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.cart.id)
        self.assertEqual(response.data["user"], self.user.id)

    def test_authenticated_user_can_create_cart_item(self):
        self.authenticate()

        response = self.client.post(
            f"/api/orders/carts/{self.cart.id}/items/",
            {
                "product_id": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        item = CartItem.objects.get(cart=self.cart)

        self.assertEqual(item.product, self.product)
        self.assertEqual(item.quantity, 2)

    def test_cart_item_quantity_can_increase(self):
        self.authenticate()

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.patch(
            f"/api/orders/carts/{self.cart.id}/items/{item.id}/update_quantity/",
            {
                "action": "increase",
                "quantity": 3,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        item.refresh_from_db()

        self.assertEqual(item.quantity, 5)

    def test_cart_item_quantity_can_decrease(self):
        self.authenticate()

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=5,
        )

        response = self.client.patch(
            f"/api/orders/carts/{self.cart.id}/items/{item.id}/update_quantity/",
            {
                "action": "decrease",
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        item.refresh_from_db()

        self.assertEqual(item.quantity, 3)

    def test_cart_item_quantity_cannot_go_below_one(self):
        self.authenticate()

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.patch(
            f"/api/orders/carts/{self.cart.id}/items/{item.id}/update_quantity/",
            {
                "action": "decrease",
                "quantity": 10,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        item.refresh_from_db()

        self.assertEqual(item.quantity, 1)

    def test_invalid_quantity_action_returns_bad_request(self):
        self.authenticate()

        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.patch(
            f"/api/orders/carts/{self.cart.id}/items/{item.id}/update_quantity/",
            {
                "action": "invalid",
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class OrderTests(OrdersBaseTestCase):
    def test_authenticated_user_can_create_order(self):
        self.authenticate()

        payload = {
            "shipping_address": "123 Test Street, Cairo",
            "payment_method": "COD",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 2,
                }
            ],
        }

        response = self.client.post(
            "/api/orders/orders/",
            payload,
            format="json",
        )

        print("\nCREATE ORDER RESPONSE:")
        print(response.status_code)
        print(response.data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(user=self.user)

        self.assertEqual(order.payment_method, "COD")
        self.assertEqual(order.status, "PENDING")
        self.assertEqual(order.total, Decimal("200.00"))

        self.assertTrue(
            OrderItem.objects.filter(
                order=order,
                product=self.product,
                quantity=2,
                price="100.00",
            ).exists()
        )

    def test_order_requires_authentication(self):
        response = self.client.post(
            "/api/orders/orders/",
            {
                "shipping_address": "123 Test Street, Cairo",
                "payment_method": "COD",
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 1,
                    }
                ],
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_user_can_only_see_their_own_orders(self):
        Order.objects.create(
            user=self.other_user,
            shipping_address="456 Other Street, Cairo",
            payment_method="COD",
            total="100.00",
        )

        Order.objects.create(
            user=self.user,
            shipping_address="123 Test Street, Cairo",
            payment_method="COD",
            total="200.00",
        )

        self.authenticate()

        response = self.client.get("/api/orders/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("\nMY ORDERS RESPONSE:")
        print(response.status_code)
        print(response.data)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["user"], self.user.id)

    def test_order_creation_clears_user_cart(self):
        self.authenticate()

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            1,
        )

        response = self.client.post(
            "/api/orders/orders/",
            {
                "shipping_address": "123 Test Street, Cairo",
                "payment_method": "COD",
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 2,
                    }
                ],
            },
            format="json",
        )

        print("\nCLEAR CART ORDER RESPONSE:")
        print(response.status_code)
        print(response.data)

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            0,
        )
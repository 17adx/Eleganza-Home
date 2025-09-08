import random
from faker import Faker
from django.contrib.auth.models import User
from catalog.models import Product, Review

faker = Faker()  # Faker instance for generating fake data

def seed_reviews(n_per_product=3):
    """
    Seed fake reviews for all products in the database.
    
    Args:
        n_per_product (int): Number of reviews to create per product. Defaults to 3.
    
    Notes:
        - Ensures that each user reviews a product only once.
        - Randomly selects users who haven't already reviewed a product.
        - Generates random rating and a fake comment for each review.
    """
    
    users = list(User.objects.all())  # Fetch all users
    products = Product.objects.all()  # Fetch all products

    # Check if there are users available
    if not users:
        print("⚠️ There are no users in the database. Create some users first.")
        return

    # Loop through each product
    for product in products:
        # Get IDs of users who already reviewed this product
        existing_users = set(Review.objects.filter(product=product).values_list("user_id", flat=True))
        
        # Filter out users who already reviewed
        available_users = [u for u in users if u.id not in existing_users]

        # Randomly select users to review this product (up to n_per_product)
        selected_users = random.sample(available_users, min(n_per_product, len(available_users)))

        # Create reviews for selected users
        for user in selected_users:
            Review.objects.create(
                product=product,
                user=user,
                rating=random.randint(1, 5),  # Random rating between 1 and 5
                comment=faker.sentence(nb_words=12),  # Generate a fake comment
            )

    print("✅ Fake reviews created successfully.")
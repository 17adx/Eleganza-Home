from django.contrib.auth.models import User
from users.models import Profile
from faker import Faker

# Initialize Faker for generating realistic fake data
fake = Faker()

def generate_fake_sellers(n=10):
    """
    Generate 'n' fake seller users with associated profiles.

    Args:
        n (int): Number of fake sellers to generate. Default is 10.

    Workflow:
        1. Creates a new User instance with realistic first_name, last_name, username, and email.
        2. Sets a default password ("test1234") for all generated users.
        3. Creates a related Profile with mobile number and sets 'is_seller' to True.
    
    Notes:
        - Users are created using 'create_user' to ensure password is hashed correctly.
        - Generated data is suitable for testing or seeding a development database.
    """
    for _ in range(n):
        # Create a User with fake credentials
        user = User.objects.create_user(
            username=fake.user_name(),
            email=fake.email(),
            password="test1234",
            first_name=fake.first_name(),
            last_name=fake.last_name()
        )
        
        # Create the associated Profile
        Profile.objects.create(
            user=user,
            mobile=fake.phone_number(),
            is_seller=True
        )
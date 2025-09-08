# Django Backend (DRF + JWT)

## Setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Apps
- users: registration, JWT login, profile
- catalog: products, categories, brands, tags, reviews
- orders: cart + order + checkout

## Auth
- JWT:
  - POST `/api/auth/login/` body: { "username": "", "password": "" }
  - returns access & refresh tokens
- Register:
  - POST `/api/auth/register/`

## Docs
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- SimpleJWT: https://django-rest-framework-simplejwt.readthedocs.io/
- CORS Headers: https://github.com/adamchainz/django-cors-headers

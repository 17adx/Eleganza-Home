# 🛋️ Eleganza Home — Full-Stack E-Commerce Platform

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=flat\&logo=react\&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Backend-Django%20%7C%20DRF-092E20?style=flat\&logo=django\&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat\&logo=json-web-tokens)](https://jwt.io/)

<p align="center">
  <strong>A modern full-stack e-commerce platform built with React and Django REST Framework.</strong>
</p>

<p align="center">
  <a href="https://eleganza.anassobhi.dev">🌐 Live Demo</a>
  •
  <a href="https://github.com/17adx/Eleganza-Home">📦 Repository</a>
  •
  <a href="https://anassobhi.dev">👨‍💻 Portfolio</a>
</p>

---

## 📖 Overview

**Eleganza Home** is a full-stack e-commerce platform designed for browsing, discovering, and purchasing home and furniture products.

The application combines a **React + Vite frontend** with a **Django REST Framework backend**, providing a complete shopping experience with user authentication, product discovery, cart management, wishlist functionality, reviews, and order workflows.

The project was built with a focus on **reusable components, responsive UI, RESTful API integration, authentication, and scalable project structure**.

---

## 📸 Screenshots

### 🛍️ Product Catalog

<p align="center">
  <img src="https://i.ibb.co/dsDCG68V/2.png" alt="Eleganza Home Product Catalog" width="100%">
</p>

### 🔐 Authentication

<p align="center">
  <img src="https://i.ibb.co/SDF1mBdT/3.png" alt="Eleganza Home Authentication" width="100%">
</p>

### 🔑 Password Reset

<p align="center">
  <img src="https://i.ibb.co/dsf2M3NS/4.png" alt="Eleganza Home Password Reset" width="100%">
</p>

### 🛒 Shopping Cart

<p align="center">
  <img src="https://i.ibb.co/GQXWs5GM/6.png" alt="Eleganza Home Shopping Cart" width="100%">
</p>

<details>
<summary>More Screenshots</summary>

<br>

<p align="center">
  <img src="https://i.ibb.co/m5XF4Nk7/1.png" alt="Eleganza Home Preview" width="100%">
</p>

<p align="center">
  <img src="https://i.ibb.co/9kzv0ZXt/5.png" alt="Eleganza Home Preview" width="100%">
</p>

</details>

---

## ✨ Features

* 🔐 **Authentication & Authorization** — JWT-based authentication with user accounts and protected application flows.
* 🛍️ **Product Catalog** — Browse products through categories with search and filtering functionality.
* 🛒 **Shopping Cart** — Add, update, and remove products from the cart.
* ❤️ **Wishlist** — Save products for later.
* ⭐ **Product Reviews** — Customer review functionality for products.
* 👤 **User Profiles** — Manage user information and account-related functionality.
* 🏪 **Seller Features** — Product and seller management workflows.
* 📦 **Orders & Checkout** — Manage the shopping and order workflow.
* 📱 **Responsive Design** — Optimized for desktop, tablet, and mobile devices.
* ⚡ **REST API Integration** — React frontend communicating with a Django REST API.

---

## 🏗️ Architecture

Eleganza Home follows a separated frontend/backend architecture:

```text
┌─────────────────────────────────┐
│          React Frontend         │
│                                 │
│  React + Vite                   │
│  React Router                   │
│  Context API / Custom Hooks     │
│  Axios                           │
│  Tailwind CSS                   │
└────────────────┬────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────┐
│       Django REST Backend       │
│                                 │
│  Django                         │
│  Django REST Framework          │
│  JWT Authentication             │
│  Djoser                         │
│                                 │
│  Users                          │
│  Catalog                        │
│  Orders                         │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│            Database             │
│                                 │
│  PostgreSQL / SQLite            │
└─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **Vite**
* **React Router**
* **Axios**
* **Tailwind CSS**
* **Bootstrap / React Bootstrap**
* **Framer Motion**
* **Swiper**
* **SweetAlert2**
* **React Icons / Font Awesome**

### Backend

* **Python**
* **Django**
* **Django REST Framework**
* **Djoser**
* **Simple JWT**
* **django-filter**
* **PostgreSQL**
* **SQLite**
* **Cloudinary**

### Development Tools

* **Git**
* **GitHub**
* **npm**
* **ESLint**

---

## 📂 Project Structure

```text
Eleganza-Home/
│
├── backend/
│   ├── catalog/              # Products, categories, brands, tags & reviews
│   ├── orders/               # Cart, checkout & orders
│   ├── users/                # Authentication & user management
│   ├── ecommerce/            # Django project configuration
│   ├── pages/                # Additional backend pages
│   ├── media/                # Local media files
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Images and static assets
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # Application state & context providers
│   │   ├── pages/            # Application pages
│   │   ├── api.js            # API configuration/integration
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔐 Authentication

Authentication is handled through **JWT (JSON Web Tokens)**.

The backend uses Django REST Framework together with **Simple JWT** and **Djoser** to provide authentication-related functionality.

The frontend communicates with the authentication endpoints through the REST API and uses protected application flows where authentication is required.

---

## 🔌 API

The frontend communicates with the Django backend through RESTful API endpoints.

The backend is organized into dedicated applications:

```text
/users
/catalog
/orders
```

This separation keeps authentication, product management, and order-related functionality organized independently.

For detailed API and backend setup information, see:

* [`backend/README.md`](./backend/README.md)

For frontend-specific documentation, see:

* [`frontend/README.md`](./frontend/README.md)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Python 3.x
* PostgreSQL

---

### 1. Clone the Repository

```bash
git clone https://github.com/17adx/Eleganza-Home.git

cd Eleganza-Home
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create the required environment files for the frontend and backend based on the configuration used by the project.

> **Never commit real API keys, passwords, JWT secrets, database credentials, or other sensitive information to the repository.**

A `.env.example` file should be provided for required environment variables without exposing their actual values.

---

## 📚 Documentation

More detailed documentation is available in the individual project directories:

* 📘 [Frontend Documentation](./frontend/README.md)
* ⚙️ [Backend Documentation](./backend/README.md)

---

## 🎯 What This Project Demonstrates

Eleganza Home demonstrates practical experience with:

* Building modern React applications
* Creating reusable frontend components
* Managing application state with Context API and custom hooks
* Implementing client-side routing
* Integrating REST APIs
* Implementing JWT-based authentication
* Building Django REST APIs
* Working with relational databases
* Designing responsive interfaces
* Structuring a full-stack application into separate frontend and backend layers

---

## 🔮 Future Improvements

Potential improvements include:

* 💳 Production payment gateway integration
* 📦 Advanced order tracking
* 🔔 Real-time notifications
* 🧪 Automated frontend and backend testing
* ⚡ Further performance optimization
* 🚀 CI/CD automation
* 📊 Extended seller and admin analytics

---

## 👨‍💻 Author

**Anas Sobhi Salem**

Junior Frontend Developer focused on **React.js and modern frontend development**.

<p align="center">
  <a href="https://anassobhi.dev">Portfolio</a>
  •
  <a href="https://www.linkedin.com/in/anassobhisalem/">LinkedIn</a>
  •
  <a href="mailto:anassalem810@gmail.com">Email</a>
</p>

---

<p align="center">
  ⭐ If you found this project interesting, consider giving it a star!
</p>

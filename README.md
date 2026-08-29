# 🏡 Eleganza Home – Smart Home Management System

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat&logo=json-web-tokens)](https://jwt.io/)

**Eleganza Home** is an intuitive, full-stack IoT and Smart Home management dashboard. It provides a centralized, interactive interface for real-time monitoring and control of smart household appliances across multiple zones and floor plans.

---

## 📸 Preview

<p align="center">
  <img src="https://i.ibb.co/m5XF4Nk7/1.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
  <img src="https://i.ibb.co/dsDCG68V/2.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
  <img src="https://i.ibb.co/SDF1mBdT/3.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
  <img src="https://i.ibb.co/dsf2M3NS/4.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
  <img src="https://i.ibb.co/9kzv0ZXt/5.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
  <img src="https://i.ibb.co/GQXWs5GM/6.png" alt="Eleganza Home Dashboard Preview" border="0" width="100%">
</p>

---

## ✨ Features

- 🗺️ **Interactive Multi-Zone Floor Plans:** Visual overview and intuitive control of appliances across zones (Ground Floor, First Floor, Garage, Garden, and Roof).
- 💡 **Smart Device Management:** Seamless toggling and status tracking for connected devices (Lighting, Climate / AC units, Security Cameras, and Power Outlets).
- 📊 **Real-Time Status & Metrics:** Visual feedback for active appliances, environmental status, and energy/activity metrics.
- 🔐 **Secure Authentication:** Token-based user authentication using JWT (JSON Web Tokens) with role-based access control.
- 🎨 **Responsive & Clean UI:** Modern light-theme interface optimized for desktop, tablet, and mobile displays.
- ⚡ **RESTful Architecture:** Modular Django REST Framework backend coupled with an optimized React/Vite frontend.

---

## 🛠️ Tech Stack

### **Frontend**
- **Core:** React.js, Vite
- **Styling:** Tailwind CSS, Modern UI components & Icons
- **State Management & Routing:** React Router, Context API / Custom Hooks
- **API Client:** Axios / Fetch API

### **Backend**
- **Framework:** Python, Django, Django REST Framework (DRF)
- **Authentication:** Simple JWT / Djoser
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **API Design:** RESTful Architecture

---

## 📂 Project Structure

```bash
Eleganza-Home/
├── backend/                  # Django project root
│   ├── core/                 # Project settings and configurations
│   ├── devices/              # App managing device controls & states
│   ├── users/                # App managing authentication & profiles
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── assets/           # Floor plans, icons, and illustrations
│   │   ├── components/       # Reusable UI components (DeviceCards, Controls)
│   │   ├── pages/            # Dashboard, FloorViews, Settings, Login
│   │   ├── services/         # API clients and endpoints
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md

# Smart Order and Billing – Premium Restaurant Management Portal 🇮🇳

**Smart Order and Billing** is a state-of-the-art restaurant management and discovery platform specializing in the deep culinary heritage of India. This application is designed to be a complete unified portal for diners and restaurant administrators.

Here, guests can easily **order food** for delivery/takeaway or **reserve a table** with a pre-ordered meal, all seamlessly managed by an intuitive admin dashboard and automated billing system.

🌍 **Live Demo:** [https://smart-order-and-billing-portal-vjwy.vercel.app/](https://smart-order-and-billing-portal-vjwy.vercel.app/)

## 🚀 Key Features

*   **Food Ordering & Cart**: A premium, mobile-responsive cart system allowing users to add multiple dishes, set quantities, select Dining Modes (Delivery, Dine-In, Takeaway), add tips, and apply promotional codes.
*   **Table Reservation System**: Pick a date, time, and party size to pre-book a table. Users can even pre-order food so it is ready upon arrival!
*   **Indian Culinary Engine**: Browse authentic Indian dishes sorted alphabetically by state (Andhra Pradesh to West Bengal) or by Regional Territories (North, South, East, West).
*   **100+ Unique & Authentic Items**: Programmatically generated items spanning all Indian districts utilizing real cooking instructions and professional food imagery via TheMealDB API.
*   **Instant Digital Billing**: Automated bill generation for every successful order. The system handles subtotals, packaging layers, promo discounts, and calculates the grand total gracefully.
*   **Role-Based Dashboards**: 
    *   **Customer Dashboard**: Users can track their active food orders, view past bills, and monitor their upcoming table reservations.
    *   **Admin Dashboard**: Employees get specialized views with real-time notifications for incoming orders and table bookings, inventory management, and revenue analytics.
*   **Premium UI/UX**: High-end modern Web aesthetics featuring Day/Night mode, "Glassmorphism" cart drawers, micro-animations, and dynamic visual indicators for dietary tags (Veg/Non-Veg).

## 🏗️ Technology Stack

*   **Frontend**: React (Vite), React Router, Context API, Lucide Icons, pure CSS Modules (tailored for Day/Night views).
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose). 
*   **Security**: bcrypt.js for password hashing, JWTs (JSON Web Tokens) for secure session persistence.
*   **External APIs**: TheMealDB for dynamic recipe instructions and metadata.

## 🛠️ Installation & Local Setup

**1. Clone the repository**:
```bash
git clone https://github.com/Sandip4083/smart-order-and-billing-portal.git
cd smart-order-and-billing-portal
```

**2. Backend Setup**:
```bash
cd backend
npm install
# Set your environment variables (e.g. MONGO_URI, JWT_SECRET) in .env file
npm start # or npm run dev
```

**3. Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment (Vercel)

This project has been explicitly optimized for full-stack deployment on Vercel using `vercel.json`.

1. Install Vercel CLI globally: 
   ```bash
   npm install -g vercel
   ```
2. Navigate to the project root and run `vercel`.
3. Vercel will process the `vercel.json` routing rules:
   * **API Requests (`/api/*`)**: Handled by Node.js Serverless Functions mapping to `backend/server.js`.
   * **Frontend Requests (`/*`)**: Serves the Vite React single-page application build output from `frontend/dist`.

---
*Developed with ❤️ to empower smarter restaurant experiences.*

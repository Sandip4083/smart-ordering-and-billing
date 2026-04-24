# Smart Order and Billing – Premium Restaurant Management Portal 🇮🇳

**Smart Order and Billing** is a state-of-the-art restaurant management and discovery platform specializing in the deep culinary heritage of India. This application is designed to be a complete unified portal for diners and restaurant administrators.

Here, guests can easily **order food** for delivery/takeaway or **reserve a table** with a pre-ordered meal, all seamlessly managed by an intuitive admin dashboard and automated billing system.

🌍 **Live Demo:** [https://smart-order-and-billing-portal.vercel.app/](https://smart-order-and-billing-portal.vercel.app/)

## 🚀 Key Features

### 🛒 Customer Side

- **Food Ordering & Cart**: A premium, mobile-responsive cart system allowing users to add multiple dishes, set quantities, select Dining Modes (Delivery, Dine-In, Takeaway), add tips, and apply promotional codes.
- **Table Reservation System**: Pick a date, time, and party size to pre-book a table. Users can even pre-order food so it is ready upon arrival!
- **Indian Culinary Engine**: Browse authentic Indian dishes sorted by state (Andhra Pradesh to West Bengal), Regional Territories (North, South, East, West), or Special Categories (Street Food, Biryani, Thali, Desserts, Breads, Drinks).
- **80+ Authentic Dishes**: Handcrafted menu items spanning 15+ Indian states and 40+ districts with Hindi names, calories, prep time, allergens, spice levels, and origin info.
- **Instant Digital Billing**: Automated bill generation with subtotals, packaging charges, promo discounts, and grand total calculation.
- **Favorites & Reviews**: Save favorite dishes and leave star-rating reviews.
- **Day/Night Mode**: Premium dark mode toggle across all pages.

### 👨‍💼 Admin Side

- **Role-Based Dashboards**:
  - **Customer Dashboard**: Track active food orders, view past bills, and manage upcoming table reservations.
  - **Admin Dashboard**: Real-time notifications for incoming orders and table bookings, inventory management, revenue analytics, and user management.
- **Premium UI/UX**: High-end modern web aesthetics featuring Glassmorphism cart drawers, micro-animations (Framer Motion), and dynamic visual indicators for dietary tags (Veg/Non-Veg).

## 🏗️ Technology Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| **Frontend**   | React 18, Vite 5, React Router v6, Framer Motion, Recharts, Lucide Icons |
| **Styling**    | CSS Modules with Day/Night theme support, Glassmorphism effects          |
| **Backend**    | Node.js, Express.js 4                                                    |
| **Database**   | MongoDB Atlas (Mongoose ODM)                                             |
| **Auth**       | bcrypt.js (password hashing), JWT (session tokens)                       |
| **Deployment** | Vercel (Serverless Functions + Static SPA)                               |

## 📁 Project Structure

```
smart-order-and-billing-portal/
├── api/                          # Vercel serverless entry point
│   └── index.js
├── backend/
│   ├── data/
│   │   └── menuData.js           # 80+ Indian dishes database
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js, Order.js, Bill.js, Reservation.js
│   │   ├── Notification.js, Review.js, Favorite.js, Feedback.js
│   ├── routes/                   # Express API routes
│   │   ├── auth.js               # Login, Register, Reset Password
│   │   ├── menu.js               # Menu items & filtering
│   │   ├── orders.js             # Order CRUD & status management
│   │   ├── bills.js              # Invoice generation
│   │   ├── reservations.js       # Table booking
│   │   ├── payments.js           # Payment processing
│   │   ├── notifications.js, reviews.js, favorites.js, feedback.js, users.js
│   ├── scripts/
│   │   └── setup_admin.js        # Seed admin user
│   └── server.js                 # Express app entry point
├── frontend/
│   ├── public/
│   │   └── gen_imgs/authentic/   # AI-generated food images
│   └── src/
│       ├── components/           # Navbar, CartSidebar, ProtectedRoute, ScrollToTop, TimePicker
│       ├── context/
│       │   └── CartContext.jsx    # Global cart state
│       ├── pages/
│       │   ├── Home.jsx          # Landing page with cuisine showcase
│       │   ├── Menu.jsx          # Full menu with filters & search
│       │   ├── About.jsx         # About the restaurant
│       │   ├── Login.jsx         # Customer auth (Login/Register/Reset)
│       │   ├── Dashboard.jsx     # Customer dashboard
│       │   └── admin/            # AdminLogin.jsx, AdminDashboard.jsx
│       ├── App.jsx, api.js, main.jsx, index.css
├── vercel.json                   # Deployment configuration
├── package.json                  # Root scripts (concurrently)
└── README.md
```

## 🛠️ Installation & Local Setup

**1. Clone the repository**:

```bash
git clone https://github.com/Sandip4083/smart-order-and-billing-portal.git
cd smart-order-and-billing-portal
```

**2. Install all dependencies**:

```bash
npm run install-all
```

**3. Configure environment variables** — Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-order-billing
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**4. Seed admin user** (optional):

```bash
cd backend
node scripts/setup_admin.js
```

> Default admin: `admin` / `adminpassword`

**5. Start development server**:

```bash
npm start
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🌐 Deployment (Vercel)

This project has been explicitly optimized for full-stack deployment on Vercel using `vercel.json`.

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Navigate to the project root and run `vercel`.
3. Vercel will process the `vercel.json` routing rules:
   - **API Requests (`/api/*`)**: Handled by Node.js Serverless Functions mapping to `backend/server.js`.
   - **Frontend Requests (`/*`)**: Serves the Vite React single-page application build output from `frontend/dist`.

## 📸 Pages Overview

| Page        | Route          | Description                                                        |
| ----------- | -------------- | ------------------------------------------------------------------ |
| Home        | `/`            | Landing page with cuisine carousel, how-it-works, gallery, reviews |
| Menu        | `/menu`        | Searchable menu with 10 categories, filters, and add-to-cart       |
| About       | `/about`       | Restaurant story, team, and mission                                |
| Login       | `/login`       | Customer sign-in, sign-up, and password reset                      |
| Dashboard   | `/dashboard`   | Order tracking, bill history, and reservations                     |
| Admin Login | `/admin/login` | Employee authentication                                            |
| Admin Panel | `/admin`       | Order management, analytics, notifications, user management        |

## 🔑 API Endpoints

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| `POST` | `/api/auth/login/customer` | Customer login            |
| `POST` | `/api/auth/register`       | New customer registration |
| `POST` | `/api/auth/reset-password` | Password reset            |
| `GET`  | `/api/menu/all`            | Get all menu items        |
| `GET`  | `/api/menu/regions`        | Get regional categories   |
| `POST` | `/api/orders`              | Place a new order         |
| `GET`  | `/api/orders/my`           | Get user's orders         |
| `POST` | `/api/reservations`        | Book a table              |
| `GET`  | `/api/bills/my`            | Get user's bills          |
| `GET`  | `/api/notifications`       | Get notifications         |

---

_Developed with ❤️ to empower smarter restaurant experiences._

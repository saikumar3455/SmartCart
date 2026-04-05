# SmartCart — Full-Stack Ecommerce App

A complete ecommerce application built with React + Vite. No backend required — all data is stored in `localStorage`.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@smartcart.com    | admin123  |
| User  | Register any new account |          |

---

## 📁 Folder Structure

```
smartcart-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                        ← React entry point
    ├── App.jsx                         ← Root: providers + router
    │
    ├── styles/
    │   └── global.css                  ← CSS variables, buttons, badges, modals, toasts
    │
    ├── utils/
    │   └── helpers.jsx                 ← fmt(), uid(), stars(), localStorage helpers
    │
    ├── data/
    │   ├── products.js                 ← 12 default products
    │   └── seed.js                     ← Seeds localStorage on first run
    │
    ├── context/
    │   ├── AuthContext.jsx             ← user, login(), logout()
    │   ├── CartContext.jsx             ← cart state, per-user persistence
    │   └── AppContext.jsx              ← page routing, toast notifications
    │
    ├── components/
    │   ├── Toast.jsx                   ← Floating toast notifications
    │   ├── Navbar/
    │   │   ├── Navbar.jsx              ← Sticky nav: search, cart badge, profile dropdown
    │   │   └── Navbar.module.css
    │   └── ProductCard/
    │       ├── ProductCard.jsx         ← Product card with hover, ratings, add-to-cart
    │       └── ProductCard.module.css
    │
    └── pages/
        ├── Welcome.jsx + .module.css   ← Landing page
        ├── Auth.jsx + .module.css      ← Login & Signup
        ├── Homepage.jsx + .module.css  ← Product grid, search, filter, sort
        ├── ProductDetails.jsx + .css   ← Full product page
        ├── CartPage.jsx + .module.css  ← Cart with qty controls, summary
        ├── Checkout.jsx + .module.css  ← 3-step: Shipping → Payment → Review
        ├── Success.jsx + .module.css   ← Order confirmation
        ├── Orders.jsx + .module.css    ← My order history
        ├── Profile.jsx + .module.css   ← Edit profile, stats
        └── Admin.jsx + .module.css     ← Admin panel (Dashboard, Products, Users, Orders)
```

---

## ✅ Features

### Customer
- Register & Login with validation
- Browse products with search, category filter, and sort
- Product detail page with quantity selector
- Cart with per-user persistence
- 3-step checkout (Shipping → Payment → Review)
- Order history
- Editable profile

### Admin Panel (`/admin`)
- Dashboard with stats (revenue, orders, users, products)
- Add / Edit / Delete products
- View all users, delete non-admin users
- View all orders across all users

---

## 🛠 Tech Stack

- **React 18** with hooks
- **Vite** for fast dev/build
- **CSS Modules** for scoped styles
- **localStorage** for persistence (no backend needed)
- **Google Fonts**: Playfair Display + Outfit
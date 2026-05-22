# TOC Admin Panel

## Quick Start

### 1. Backend
```bash
cd backend
npm install
node database/seed.js    # creates DB + admin account + seeds 21 products
node server.js           # starts API on http://localhost:4000
```

### 2. Admin UI
```bash
cd frontend
npm install
npm run dev              # starts UI on http://localhost:5174
```

### 3. Login
- URL: http://localhost:5174
- Email: admin@theorganiccosmos.com
- Password: Admin@TOC2025

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/products | — | List products |
| GET | /api/products/:id | — | Get product |
| POST | /api/products | ✓ | Create product |
| PUT | /api/products/:id | ✓ | Update product |
| DELETE | /api/products/:id | ✓ | Delete product |
| POST | /api/products/upload/image | ✓ | Upload image |
| GET | /api/products/meta/stats | — | Dashboard stats |
| GET | /api/products/meta/categories | — | All categories |

## Structure
```
backend/
  server.js          Express API (port 4000)
  database/
    db.js            SQLite schema + connection
    seed.js          Seeds admin + 21 products
    toc.db           SQLite database file (auto-created)
  routes/
    auth.js          Login, setup, /me
    products.js      Full CRUD + image upload
  middleware/
    auth.js          JWT verification
  uploads/           Uploaded product images

frontend/
  src/
    App.jsx          Router + auth context
    api.js           API client
    pages/
      Login.jsx      Sign-in screen
      Setup.jsx      First-time admin creation
      Dashboard.jsx  Product table + stats
      ProductForm.jsx Add / edit product
    components/
      Sidebar.jsx    Dark sidebar navigation
```

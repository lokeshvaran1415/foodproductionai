# FoodProd AI — Food Production Planning & Inventory Management

## AI-Driven Food Production Planning & Inventory Management System

A full-stack MERN application for managing food production, demand forecasting, inventory tracking, and alerts.

---

## 🚀 Quick Start

### Option 1: Double-click `START.bat` (Recommended)
Double-click `START.bat` to automatically start both servers and open the browser.

### Option 2: Manual

**Start Backend:**
```bash
cd server
npm install
node server.js
```

**Start Frontend:**
```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodprod.com | demo1234 |
| Production Manager | manager@foodprod.com | demo1234 |
| Demand Planner | planner@foodprod.com | demo1234 |
| Inventory Manager | inventory@foodprod.com | demo1234 |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Charts | Recharts |
| Auth | JWT (jsonwebtoken) |
| HTTP | Axios |

---

## 🗂️ Project Structure

```
food-production-ai/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/axios.js       # Axios with JWT interceptors
│   │   ├── context/AuthContext.jsx
│   │   ├── components/Layout.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── DemandForecast.jsx
│   │       ├── ProductionPlanning.jsx
│   │       ├── Inventory.jsx
│   │       ├── Alerts.jsx
│   │       └── Analytics.jsx
│   └── package.json
│
└── server/                    # Express Backend
    ├── models/                # Mongoose schemas
    ├── routes/                # Express routes
    ├── controllers/           # Business logic
    ├── middleware/            # JWT auth middleware
    ├── seed.js                # Database seeder
    └── server.js              # Entry point
```

---

## 🧠 AI Demand Forecasting Algorithm

The system uses a **Weighted Moving Average + Linear Trend** algorithm:

1. Collects historical weekly demand data
2. Applies weighted moving average (recent data = higher weight)
3. Detects upward/downward trends using linear regression
4. Predicts: `forecast = WMA + trend_slope`
5. Calculates confidence based on data variance

---

## 📊 Core Modules

1. **Dashboard** — KPI cards, production vs demand charts
2. **Demand Forecasting** — WMA+Trend algorithm, product-wise predictions
3. **Production Planning** — Create/manage production plans per product
4. **Inventory Management** — Track raw materials, batches, stock levels
5. **Expiry Tracking** — Monitor batch expiry, highlight critical items
6. **Alerts** — Auto-generated alerts for low stock, expiry, demand spikes
7. **Analytics** — Charts for trends, utilization, waste risk analysis

---

## 📝 Notes

- The application runs in **Demo Mode** if MongoDB is not installed
- All CRUD operations work with in-memory demo data in demo mode
- To use MongoDB: install locally and run `cd server && npm run seed`

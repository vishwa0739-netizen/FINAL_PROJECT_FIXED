# 🍽️ NGH Foods — Online Food Ordering System

A fully functional online food ordering platform built with **Vanilla HTML/CSS/JS** on the frontend, **Vercel Serverless Functions (Node.js)** on the backend, and **Supabase (PostgreSQL)** as the database.

---

## ✨ Features

- 🍔 Browse 24+ food items across 6 categories
- 🏪 6 restaurant listings with ratings and delivery times
- 🔍 Real-time search, category filters, and sort by price/rating
- 🛒 Cart with quantity controls and stock validation
- ✅ Checkout form that saves customer + order to Supabase
- 📦 Order tracking by phone number
- 🔔 Toast notifications and skeleton loading states
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript         |
| Backend    | Vercel Serverless Functions (Node.js)   |
| Database   | Supabase (PostgreSQL)                   |
| Hosting    | Vercel (frontend + API)                 |
| DB Client  | `@supabase/supabase-js` v2              |

---

## 📁 Project Structure

```
ngh-foods/
├── index.html              ← Single-page frontend
├── style.css               ← All styles
├── script.js               ← Frontend logic (fetches from API)
├── api/
│   ├── foods.js            ← GET  /api/foods
│   ├── restaurants.js      ← GET  /api/restaurants
│   ├── place-order.js      ← POST /api/place-order
│   └── orders.js           ← GET  /api/orders?phone=...
├── lib/
│   └── supabase.js         ← Supabase client singleton
├── database/
│   ├── schema.sql          ← PostgreSQL table definitions
│   └── seed.sql            ← Seed data (categories, restaurants, foods)
├── package.json
├── vercel.json
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`
- A free [Supabase](https://supabase.com) account

---

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ngh-foods.git
cd ngh-foods
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run `database/schema.sql` first, then `database/seed.sql`.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role (secret)** key → `SUPABASE_SERVICE_KEY`

### 4. Configure environment variables
```bash
cp .env.example .env
# Edit .env and fill in your Supabase credentials
```

### 5. Run locally with Vercel Dev
```bash
vercel dev
```
Open [http://localhost:3000](http://localhost:3000)

> **Why `vercel dev`?** It emulates Vercel's serverless function environment locally, reading `.env` and serving the `/api` routes alongside the static files.

---

## 🌐 Deploy to Vercel

### Option A — Vercel CLI
```bash
vercel
```
Then go to your Vercel project dashboard → **Settings → Environment Variables** and add:
```
SUPABASE_URL        = https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY = your-service-role-secret-key
```
Re-deploy after adding the variables:
```bash
vercel --prod
```

### Option B — GitHub Integration (Recommended)
1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` under **Environment Variables**.
4. Click **Deploy** — Vercel builds and deploys automatically on every push.

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/api/foods`       | All food items with category/restaurant |
| GET    | `/api/restaurants` | All restaurants ordered by rating  |
| POST   | `/api/place-order` | Place a new order                  |
| GET    | `/api/orders?phone=` | Order history by phone number   |

### POST `/api/place-order` — Request Body
```json
{
  "customer": {
    "name": "Naresh Kumar",
    "phone": "9876543210",
    "email": "naresh@example.com",
    "address": "123, Anna Nagar, Chennai"
  },
  "payment_method": "Cash on Delivery",
  "items": [
    { "id": 1, "qty": 2 },
    { "id": 5, "qty": 1 }
  ]
}
```

---

## 🗄️ Database Tables

| Table         | Purpose                                 |
|---------------|-----------------------------------------|
| `categories`  | Food categories (Fast Food, Meals, …)   |
| `restaurants` | Restaurant info, ratings, images        |
| `food_items`  | Menu items linked to restaurant+category|
| `customers`   | Customer records (phone is unique key)  |
| `orders`      | Order header with total and status      |
| `order_items` | Line items for each order               |
| `payments`    | Payment records per order               |

---

## 🔒 Security Notes

- `SUPABASE_SERVICE_KEY` is used **server-side only** (Vercel functions) — never exposed to the browser.
- All API inputs are validated server-side before any database operation.
- HTML output from the API is escaped client-side to prevent XSS.
- The `.env` file is gitignored.

---

## 📞 Contact

**Naresh** · naresh@nghfoods.com · +91 8838889474 · Chennai, Tamil Nadu

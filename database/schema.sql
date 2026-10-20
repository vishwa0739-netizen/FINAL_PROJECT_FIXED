-- ═══════════════════════════════════════════════════════════════
-- NGH Foods – Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL
);

-- 2. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  location      VARCHAR(150) DEFAULT 'Chennai',
  rating        DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  delivery_time VARCHAR(30)  DEFAULT '30–40 min',
  price_for_two VARCHAR(30)  DEFAULT '₹300 for two',
  image         TEXT,
  description   VARCHAR(255)
);

-- 3. FOOD ITEMS
CREATE TABLE IF NOT EXISTS food_items (
  id            SERIAL PRIMARY KEY,
  restaurant_id INT          NOT NULL REFERENCES restaurants(id),
  category_id   INT          NOT NULL REFERENCES categories(id),
  name          VARCHAR(120) NOT NULL,
  description   VARCHAR(255),
  price         DECIMAL(10,2) NOT NULL CHECK (price > 0),
  rating        DECIMAL(2,1)  DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  stock         INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image         TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  UNIQUE NOT NULL,
  email      VARCHAR(120),
  address    TEXT         NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  customer_id    INT           NOT NULL REFERENCES customers(id),
  total_amount   DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  payment_method VARCHAR(30)   NOT NULL,
  status         VARCHAR(30)   NOT NULL DEFAULT 'Confirmed',
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- 6. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_id    INT           NOT NULL REFERENCES food_items(id),
  quantity   INT           NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0)
);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id       SERIAL PRIMARY KEY,
  order_id INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method   VARCHAR(30)   NOT NULL,
  amount   DECIMAL(10,2) NOT NULL,
  status   VARCHAR(30)   NOT NULL DEFAULT 'Completed',
  paid_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_food_items_restaurant ON food_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category   ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer       ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone       ON customers(phone);

-- ═══════════════════════════════════════════════════════════════
-- USEFUL VIEWS
-- ═══════════════════════════════════════════════════════════════

-- Sales report view
CREATE OR REPLACE VIEW v_sales_report AS
SELECT
  DATE(o.created_at) AS sale_date,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(o.total_amount) AS total_revenue
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Popular foods view
CREATE OR REPLACE VIEW v_popular_foods AS
SELECT
  f.id,
  f.name,
  SUM(oi.quantity) AS quantity_sold,
  SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM order_items oi
JOIN food_items f ON f.id = oi.food_id
GROUP BY f.id, f.name
ORDER BY quantity_sold DESC;

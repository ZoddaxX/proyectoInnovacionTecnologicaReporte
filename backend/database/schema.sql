CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'seller',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  return_policy_days INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  emoji_icon VARCHAR(10) DEFAULT '📦',
  is_active BOOLEAN DEFAULT true,
  ai_report JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  size VARCHAR(20),
  color VARCHAR(50),
  stock INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  buyer_name VARCHAR(255) NOT NULL,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_variant_id INTEGER REFERENCES product_variants(id),
  quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS returns (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id),
  buyer_name VARCHAR(255) NOT NULL,
  store_id INTEGER REFERENCES stores(id),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('wrong_size','defective','not_as_described','other')),
  comment TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','approved','rejected')),
  return_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_events (
  id SERIAL PRIMARY KEY,
  return_id INTEGER REFERENCES returns(id),
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

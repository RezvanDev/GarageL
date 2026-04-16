-- Comprehensive Database Schema for Garage Platform (Unified)

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    user_code VARCHAR(20) UNIQUE,
    role_id INTEGER REFERENCES roles(id),
    allowed_brands JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Catalog/Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    description TEXT,
    image_url TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    supplier_price DECIMAL(10, 2),
    supplier_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders/Requests table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    supplier_id INTEGER REFERENCES users(id),
    item_name TEXT NOT NULL,
    car_info TEXT, -- brand model vin
    car_brand VARCHAR(100),
    year VARCHAR(10),
    description TEXT,
    photo_url TEXT,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    price DECIMAL(10, 2),
    delivery_method VARCHAR(20),
    track_number VARCHAR(100),
    weight DECIMAL(10, 2),
    dimensions VARCHAR(100),
    shipping_price DECIMAL(10, 2),
    warehouse_photo_url TEXT,
    shipping_track_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Offers table (from Suppliers)
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    supplier_id INTEGER REFERENCES users(id),
    price DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2),
    quantity INTEGER DEFAULT 1,
    delivery_time VARCHAR(100),
    photo_url TEXT,
    condition VARCHAR(100),
    item_name TEXT,
    item_code VARCHAR(100),
    comment TEXT,
    year VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Roles
INSERT INTO roles (name) VALUES ('client'), ('supplier'), ('logist'), ('admin') ON CONFLICT DO NOTHING;

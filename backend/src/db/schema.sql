-- Database Schema for Garage Platform

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Catalog/Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders/Requests table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    supplier_id INTEGER REFERENCES users(id),
    item_name TEXT NOT NULL,
    car_info TEXT, -- brand model vin
    description TEXT, -- for multi-part requests
    photo_url TEXT,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, offered, paid, shipping, arrived
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offers table (from Suppliers)
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    supplier_id INTEGER REFERENCES users(id),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    delivery_time VARCHAR(100),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Roles
INSERT INTO roles (name) VALUES ('client'), ('supplier'), ('logist'), ('admin') ON CONFLICT DO NOTHING;

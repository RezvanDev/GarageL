-- Migration to add supplier brand restrictions

-- 1. Add allowed_brands to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_brands JSONB DEFAULT '[]'::jsonb;

-- 2. Add explicit car_brand to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS car_brand VARCHAR(100);

-- Migrate existing orders: Extract first word from car_info as car_brand
UPDATE orders 
SET car_brand = split_part(car_info, ' ', 1) 
WHERE car_brand IS NULL AND car_info IS NOT NULL;

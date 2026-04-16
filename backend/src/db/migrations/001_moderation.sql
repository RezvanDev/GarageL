-- Migration to add Moderation and Markup functionality

-- Update products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES users(id);

-- Update offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'; -- pending, approved, rejected
ALTER TABLE offers ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);

-- Ensure admin is the only one who can set is_approved
-- Logic will be handled in backend controller.

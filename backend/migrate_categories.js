const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    try {
        console.log('Starting category schema migration...');
        
        // 1. Add columns to users
        console.log('Adding columns to users table...');
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_categories JSONB DEFAULT '[]'::jsonb;`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS logistics_type VARCHAR(20);`);
        
        // 2. Add category column to orders
        console.log('Adding category column to orders table...');
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'parts';`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10, 2);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS logist_shipping_price DECIMAL(10, 2);`);

        // 3. Set default values for existing rows
        console.log('Setting default values for existing rows...');
        await pool.query(`UPDATE users SET allowed_categories = '[]'::jsonb WHERE allowed_categories IS NULL;`);
        await pool.query(`UPDATE orders SET category = 'parts' WHERE category IS NULL;`);

        console.log('Category schema migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();

const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    try {
        console.log('Starting migration...');
        
        // 1. Add columns to users
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_code VARCHAR(20) UNIQUE;`);
        
        // 2. Add columns to orders
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS track_number VARCHAR(100);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_price DECIMAL(10, 2);`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS warehouse_photo_url TEXT;`);
        await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_track_number VARCHAR(100);`);

        // 3. Generate user_codes for existing users
        const users = await pool.query(`SELECT id FROM users WHERE user_code IS NULL ORDER BY id`);
        console.log(`Found ${users.rows.length} users with no code.`);
        for (let i = 0; i < users.rows.length; i++) {
            const userId = users.rows[i].id;
            const code = 'MG-' + (1000 + userId);
            await pool.query('UPDATE users SET user_code = $1 WHERE id = $2', [code, userId]);
            console.log(`Assigned ${code} to user ID ${userId}`);
        }
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();

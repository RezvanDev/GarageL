const db = require('./index');

const runMigrations = async () => {
    try {
        console.log('🔄 Running database migrations...');

        // 1. Users table migrations
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_code VARCHAR(20) UNIQUE;`);
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_brands JSONB DEFAULT '[]'::jsonb;`);

        // 2. Products table migrations
        await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES users(id);`);
        await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;`);

        // 3. Orders table migrations
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS track_number VARCHAR(100);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_price DECIMAL(10, 2);`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS warehouse_photo_url TEXT;`);
        await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_track_number VARCHAR(100);`);

        // 4. Generate user_codes for existing users if any are null
        const users = await db.query(`SELECT id FROM users WHERE user_code IS NULL ORDER BY id`);
        if (users.rows.length > 0) {
            console.log(`Generating user codes for ${users.rows.length} users...`);
            for (let i = 0; i < users.rows.length; i++) {
                const userId = users.rows[i].id;
                const code = 'MG-' + (1000 + userId);
                await db.query('UPDATE users SET user_code = $1 WHERE id = $2', [code, userId]);
            }
        }

        // 5. Create Indexes
        await db.query(`CREATE INDEX IF NOT EXISTS idx_products_lower_brand ON products (LOWER(brand));`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_products_lower_model ON products (LOWER(model));`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_products_is_approved ON products (is_approved);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders (client_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders (supplier_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_offers_order_id ON offers (order_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_offers_supplier_id ON offers (supplier_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);`);

        console.log('✅ Database migrations checked and applied successfully.');
    } catch (err) {
        console.error('❌ Database migration failed:', err);
    }
};

module.exports = runMigrations;

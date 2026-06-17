const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrateIndexes = async () => {
    try {
        console.log('Starting index migration...');

        // Products
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_lower_brand ON products (LOWER(brand));`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_lower_model ON products (LOWER(model));`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_is_approved ON products (is_approved);`);
        
        // Orders
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders (client_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders (supplier_id);`);

        // Offers
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_offers_order_id ON offers (order_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_offers_supplier_id ON offers (supplier_id);`);

        // Users
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);`);

        console.log('Index migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Index migration failed:', err);
        process.exit(1);
    }
};

migrateIndexes();

const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrateCatalogCheckout = async () => {
    try {
        console.log('Starting catalog checkout migration...');

        // Add product_id column to orders table if it doesn't exist
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id);
        `);

        console.log('Catalog checkout migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Catalog checkout migration failed:', err);
        process.exit(1);
    }
};

migrateCatalogCheckout();

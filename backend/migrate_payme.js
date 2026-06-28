const db = require('./src/db');

async function migrate() {
    try {
        console.log("Starting migration: payme_transactions...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS payme_transactions (
                id VARCHAR(255) PRIMARY KEY,
                time BIGINT NOT NULL,
                state INTEGER NOT NULL,
                amount BIGINT NOT NULL,
                order_id INTEGER REFERENCES orders(id),
                create_time BIGINT NOT NULL,
                perform_time BIGINT,
                cancel_time BIGINT,
                reason INTEGER
            );
        `);
        
        console.log("Migration completed: payme_transactions table created successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

migrate();

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log("Connected to DB successfully.");

        // Check columns of orders table
        const colsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
        `);
        console.log("--- Orders Table Columns ---");
        colsRes.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type}`);
        });

        // Check recent orders
        const ordersRes = await client.query(`
            SELECT id, item_name, status, shipping_price, logist_shipping_price 
            FROM orders 
            ORDER BY id DESC 
            LIMIT 10
        `);
        console.log("--- Recent Orders ---");
        console.table(ordersRes.rows);

    } catch (err) {
        console.error("Error executing query:", err);
    } finally {
        await client.end();
    }
}

run();

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const db = require('../src/db');

async function listRecentOrders() {
    try {
        const res = await db.query('SELECT id, status, price, shipping_price FROM orders ORDER BY id DESC LIMIT 10');
        console.log("Recent orders in DB:");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

listRecentOrders();

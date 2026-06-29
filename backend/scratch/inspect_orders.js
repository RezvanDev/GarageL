const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const db = require('../src/db');

async function inspectOrders() {
    try {
        const res = await db.query('SELECT id, status, price, shipping_price FROM orders WHERE id IN (65, 66) ORDER BY id');
        console.log("Order statuses in DB:");
        console.log(JSON.stringify(res.rows, null, 2));

        const txRes = await db.query('SELECT * FROM payme_transactions WHERE order_id IN (65, 66) ORDER BY order_id, time');
        console.log("Related transactions in DB:");
        console.log(JSON.stringify(txRes.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

inspectOrders();

const db = require('../db');

class Offer {
    static async create(data) {
        const { order_id, supplier_id, price, delivery_time, photo_url, condition, item_name, item_code, comment, year, quantity } = data;
        const result = await db.query(
            'INSERT INTO offers (order_id, supplier_id, price, delivery_time, photo_url, condition, item_name, item_code, comment, year, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [order_id, supplier_id, price, delivery_time, photo_url, condition, item_name, item_code, comment, year, quantity || 1]
        );

        // Update order status to 'offer_created'
        await db.query("UPDATE orders SET status = 'offer_created' WHERE id = $1", [order_id]);

        return result.rows[0];
    }

    static async getByOrder(orderId) {
        const result = await db.query(
            `SELECT o.*, u.name as supplier_name 
             FROM offers o 
             JOIN users u ON o.supplier_id = u.id 
             WHERE o.order_id = $1`,
            [orderId]
        );
        return result.rows;
    }

    static async getAllPending() {
        const result = await db.query(
            `SELECT o.*, ord.item_name, ord.car_info, u.name as supplier_name 
             FROM offers o 
             JOIN orders ord ON o.order_id = ord.id 
             JOIN users u ON o.supplier_id = u.id 
             WHERE o.status = 'pending'`
        );
        return result.rows;
    }

    static async approve(offerId, { finalPrice, itemName, deliveryTime }) {
        // 1. Update offer status and details (if changed by admin)
        const offerResult = await db.query(
            'UPDATE offers SET status = \'approved\', final_price = $1, delivery_time = $2 WHERE id = $3 RETURNING *',
            [finalPrice, deliveryTime, offerId]
        );
        const offer = offerResult.rows[0];

        // 2. Update order status to 'offer_created'
        await db.query(
            "UPDATE orders SET status = 'offer_created' WHERE id = $1",
            [offer.order_id]
        );

        return offer;
    }

    static async getApprovedByOrder(orderId) {
        const result = await db.query(
            "SELECT * FROM offers WHERE order_id = $1 AND status = 'approved'",
            [orderId]
        );
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query('SELECT * FROM offers WHERE id = $1', [id]);
        return result.rows[0];
    }
}

module.exports = Offer;

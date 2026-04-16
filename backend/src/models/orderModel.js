const db = require('../db');

class Order {
    static async create(orderData) {
        const { client_id, item_name, car_info, description, photo_url, car_brand, year, quantity } = orderData;

        const result = await db.query(
            `INSERT INTO orders (client_id, item_name, car_info, description, photo_url, car_brand, year, quantity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [client_id, item_name, car_info, description, photo_url, car_brand, year, quantity || 1]
        );

        return result.rows[0];
    }

    static async getByClient(clientId) {
        const result = await db.query(
            'SELECT * FROM orders WHERE client_id = $1 ORDER BY created_at DESC',
            [clientId]
        );
        return result.rows;
    }

    static async getAllPending() {
        const result = await db.query(
            "SELECT o.*, u.name as client_name FROM orders o JOIN users u ON o.client_id = u.id WHERE o.status = 'pending' ORDER BY o.created_at DESC"
        );
        return result.rows;
    }

    static async update(id, data) {
        const fields = [];
        const params = [id];
        let i = 2;

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${i++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;

        const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const result = await db.query(query, params);
        return result.rows[0];
    }

    static async getByStatus(statuses) {
        const statusArray = Array.isArray(statuses) ? statuses : [statuses];
        const placeholders = statusArray.map((_, idx) => `$${idx + 1}`).join(', ');
        const query = `
            SELECT o.*, u.name as client_name, u.user_code 
            FROM orders o 
            JOIN users u ON o.client_id = u.id 
            WHERE o.status IN (${placeholders}) 
            ORDER BY o.updated_at DESC`;
        const result = await db.query(query, statusArray);
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query(
            'SELECT o.*, u.name as client_name, u.user_code FROM orders o JOIN users u ON o.client_id = u.id WHERE o.id = $1',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Order;

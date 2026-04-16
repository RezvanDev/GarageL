const db = require('../db');

class Product {
    static async getAll(filters = {}) {
        let query = 'SELECT * FROM products';
        const params = [];
        const whereClauses = [];

        // By default, only show approved products
        if (filters.includeUnapproved !== 'true') {
            whereClauses.push('is_approved = true');
        }

        if (filters.brand) {
            params.push(filters.brand.toLowerCase());
            whereClauses.push(`LOWER(brand) = $${params.length}`);
        }

        if (filters.model) {
            params.push(filters.model.toLowerCase());
            whereClauses.push(`LOWER(model) = $${params.length}`);
        }

        if (filters.search) {
            params.push(`%${filters.search.toLowerCase()}%`);
            whereClauses.push(`(LOWER(name) LIKE $${params.length} OR LOWER(code) LIKE $${params.length})`);
        }

        if (filters.supplier_id) {
            params.push(filters.supplier_id);
            whereClauses.push(`supplier_id = $${params.length}`);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    static async create(data) {
        const { brand, model, name, code, price, description, image_url, supplier_id, supplier_price, is_approved, quantity } = data;
        const result = await db.query(
            'INSERT INTO products (brand, model, name, code, price, description, image_url, supplier_id, supplier_price, is_approved, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [brand, model, name, code, price, description, image_url, supplier_id, supplier_price, is_approved || false, quantity || 1]
        );
        return result.rows[0];
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

        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await db.query(query, params);
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Product;

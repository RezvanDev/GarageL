const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const AppError = require('../utils/appError');

class User {
    static async findByPhone(phone) {
        const result = await db.query(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.phone = $1',
            [phone]
        );
        return result.rows[0];
    }

    static async create({ phone, password, name, roleName, allowedBrands }) {
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get role ID
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length === 0) throw new AppError('Invalid role', 400);

        const roleId = roleResult.rows[0].id;

        const result = await db.query(
            'INSERT INTO users (phone, password_hash, name, role_id, allowed_brands) VALUES ($1, $2, $3, $4, $5) RETURNING id, phone, name, allowed_brands',
            [phone, hashedPassword, name, roleId, JSON.stringify(allowedBrands || [])]
        );

        const newUser = result.rows[0];
        const userCode = 'MG-' + (1000 + newUser.id);
        
        await db.query('UPDATE users SET user_code = $1 WHERE id = $2', [userCode, newUser.id]);
        newUser.user_code = userCode;

        return newUser;
    }

    static async findById(id) {
        const result = await db.query(
            'SELECT u.id, u.phone, u.name, u.user_code, u.allowed_brands, u.telegram_chat_id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await db.query(
            'SELECT u.id, u.phone, u.name, u.user_code, u.allowed_brands, r.name as role, u.created_at FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC'
        );
        return result.rows;
    }

    static async updateRole(userId, roleName) {
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length === 0) throw new AppError('Invalid role', 400);

        const roleId = roleResult.rows[0].id;
        const result = await db.query(
            'UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id, phone, name',
            [roleId, userId]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        return true;
    }

    static async setTelegramSyncToken(userId, token) {
        await db.query(
            'UPDATE users SET telegram_sync_token = $1 WHERE id = $2',
            [token, userId]
        );
    }

    static async comparePassword(candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword);
    }
}

module.exports = User;

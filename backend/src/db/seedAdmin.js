const { query } = require('./index');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const phone = '999';
        const password = 'admin';
        const name = 'Главный Админ';

        // 1) Get admin role id
        const roleRes = await query('SELECT id FROM roles WHERE name = $1', ['admin']);
        if (roleRes.rows.length === 0) {
            console.error('Admin role not found. Please run schema.sql first.');
            return;
        }
        const roleId = roleRes.rows[0].id;

        // 2) Check if user exists
        const userRes = await query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (userRes.rows.length > 0) {
            console.log('Admin user already exists.');
            return;
        }

        // 3) Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users (phone, password_hash, name, role_id) VALUES ($1, $2, $3, $4)',
            [phone, hashedPassword, name, roleId]
        );

        console.log('Admin user created successfully!');
        console.log('Phone: 999');
        console.log('Password: admin');
    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        process.exit();
    }
};

seedAdmin();

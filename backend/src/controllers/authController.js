const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');
const { v4: uuidv4 } = require('uuid');


exports.updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.updateRole(req.params.id, role);
        res.status(200).json({
            status: 'success',
            user: updatedUser
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await User.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

exports.getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.getByClient(req.params.id);
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    } catch (err) {
        next(err);
    }
};

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    // Remove password from output
    user.password_hash = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = async (req, res, next) => {
    try {
        const { phone, password, name, role, allowedBrands } = req.body;

        // Basic validation
        if (!phone || !password) {
            return next(new AppError('Please provide phone and password', 400));
        }

        const newUser = await User.create({
            phone,
            password,
            name,
            roleName: role || 'client', // Default to client
            allowedBrands: role === 'supplier' ? allowedBrands : []
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        if (err.code === '23505') { // Unique violation in PG
            return next(new AppError('Phone number already registered', 400));
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return next(new AppError('Please provide phone and password', 400));
        }

        const user = await User.findByPhone(phone);

        if (!user || !(await User.comparePassword(password, user.password_hash))) {
            return next(new AppError('Incorrect phone or password', 401));
        }

        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            user
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            status: 'success',
            users
        });
    } catch (err) {
        next(err);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.updateRole(req.params.id, role);
        res.status(200).json({
            status: 'success',
            user: updatedUser
        });
    } catch (err) {
        next(err);
    }
};

exports.getTelegramToken = async (req, res, next) => {
    try {
        const token = uuidv4();
        await User.setTelegramSyncToken(req.user.id, token);
        
        const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Garage_Notification_Bot';
        const link = `https://t.me/${botUsername}?start=${token}`;
        
        res.status(200).json({
            status: 'success',
            data: {
                token,
                link
            }
        });
    } catch (err) {
        next(err);
    }
};

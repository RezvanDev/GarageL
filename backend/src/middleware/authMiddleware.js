const jwt = require('jsonwebtoken');
const { query } = require('../db');
const AppError = require('../utils/appError');

exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // 2) Verification token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const result = await query(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
            [decoded.id]
        );
        const currentUser = result.rows[0];

        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        next(new AppError('Invalid token. Please log in again.', 401));
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'logist']. req.user.role is 'client'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

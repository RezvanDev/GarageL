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

        // 3) Grant access directly from JWT payload (role and allowedBrands)
        req.user = {
            id: decoded.id,
            role: decoded.role,
            allowed_brands: decoded.allowedBrands || []
        };
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

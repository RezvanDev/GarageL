const express = require('express');
const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', authController.getMe);
router.get('/telegram-token', authController.getTelegramToken);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));
router.get('/users', authController.getAllUsers);
router.patch('/users/:id/role', authController.updateRole);
router.delete('/users/:id', authController.deleteUser);
router.get('/users/:id/orders', authController.getUserOrders);

module.exports = router;

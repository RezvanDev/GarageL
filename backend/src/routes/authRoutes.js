const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema, updateRoleSchema, telegramSyncSchema } = require('../utils/schemas');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', authController.getMe);
router.get('/telegram-token', authController.getTelegramToken);
router.post('/telegram-sync-webapp', validate(telegramSyncSchema), authController.syncTelegramWebApp);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));
router.get('/users', authController.getAllUsers);
router.patch('/users/:id/role', validate(updateRoleSchema), authController.updateRole);
router.delete('/users/:id', authController.deleteUser);
router.get('/users/:id/orders', authController.getUserOrders);

module.exports = router;


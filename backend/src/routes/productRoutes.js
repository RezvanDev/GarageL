const express = require('express');
const productController = require('../controllers/productController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication so we can detect role
router.use(protect);

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);

// Admin only routes
router.patch('/:id', restrictTo('admin'), productController.updateProduct);
router.delete('/:id', restrictTo('admin', 'supplier'), productController.deleteProduct);
router.patch('/:id/approve', restrictTo('admin'), productController.approveProduct);

module.exports = router;

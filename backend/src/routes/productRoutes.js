const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { getAllProductsSchema, createProductSchema, updateProductSchema } = require('../utils/schemas');

const router = express.Router();

// All routes require authentication so we can detect role
router.use(protect);

router.get('/', validate(getAllProductsSchema), productController.getAllProducts);
router.post('/', validate(createProductSchema), productController.createProduct);

// Admin only routes
router.patch('/:id', restrictTo('admin', 'supplier'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', restrictTo('admin', 'supplier'), productController.deleteProduct);
router.patch('/:id/approve', restrictTo('admin'), productController.approveProduct);

module.exports = router;


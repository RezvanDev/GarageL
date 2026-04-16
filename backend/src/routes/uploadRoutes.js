const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../utils/fileUpload');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/product-image',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'supplier'),
    upload.single('image'),
    uploadController.uploadProductImage
);

router.post('/order-image',
    authMiddleware.protect,
    upload.single('image'),
    uploadController.uploadProductImage // Re-use controller for now
);

module.exports = router;

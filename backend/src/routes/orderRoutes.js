const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All order routes are protected
router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my', orderController.getMyOrders);

// Supplier/Admin
router.get('/pending', orderController.getPendingOrders);
router.post('/respond', orderController.respondToOrder);

// Client specific
router.get('/:id/offers', orderController.getOrderOffers);

// Admin only moderation
router.get('/pending-offers', restrictTo('admin'), orderController.getPendingOffers);
router.patch('/offers/:id/approve', restrictTo('admin'), orderController.approveOffer);

// Logistics & Flow
router.post('/select-offer', orderController.selectOffer);
router.patch('/:orderId/confirm-product-payment', restrictTo('admin'), orderController.confirmProductPayment);
router.patch('/update-track', restrictTo('supplier', 'admin'), orderController.updateTrackNumber);
router.patch('/receive-warehouse', restrictTo('logist', 'admin'), orderController.receiveAtWarehouse);
router.patch('/:orderId/confirm-delivery-payment', restrictTo('admin'), orderController.confirmDeliveryPayment);
router.patch('/ship-to-uz', restrictTo('logist', 'admin'), orderController.shipToUzbekistan);
router.patch('/:orderId/mark-delivered', restrictTo('logist', 'admin', 'admin'), orderController.markDelivered);
router.get('/by-status', restrictTo('admin', 'logist', 'supplier'), orderController.getOrdersByStatus);
router.get('/logistics-stats', restrictTo('admin', 'logist'), orderController.getLogisticsStats);

module.exports = router;

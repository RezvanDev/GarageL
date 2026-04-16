const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');
const AppError = require('../utils/appError');
const db = require('../db');

exports.createOrder = async (req, res, next) => {
    try {
        let { itemName, carInfo, description, photoUrl, carBrand, year, quantity } = req.body;

        if (!itemName) {
            return next(new AppError('Item name is required', 400));
        }

        // Fallback for cached frontends that omit carBrand: extract first word from carInfo
        if (!carBrand && carInfo) {
            carBrand = carInfo.split(' ')[0];
        }

        const newOrder = await Order.create({
            client_id: req.user.id,
            item_name: itemName,
            car_info: carInfo,
            description,
            photo_url: photoUrl,
            car_brand: carBrand,
            year,
            quantity: quantity ? parseInt(quantity, 10) : 1
        });

        res.status(201).json({
            status: 'success',
            data: {
                order: newOrder
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.getByClient(req.user.id);

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

exports.getPendingOrders = async (req, res, next) => {
    try {
        // Only suppliers and admins can see all pending orders
        if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
            return next(new AppError('You do not have permission to view pending orders', 403));
        }

        let orders = await Order.getAllPending();

        if (req.user.role === 'supplier') {
            const allowedBrands = req.user.allowed_brands || [];
            orders = orders.filter(o => allowedBrands.includes(o.car_brand));
        }

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

exports.respondToOrder = async (req, res, next) => {
    try {
        const { orderId, offers } = req.body;

        if (!orderId || !offers || !Array.isArray(offers)) {
            return next(new AppError('Order ID and an array of offers are required', 400));
        }

        if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
            return next(new AppError('Only suppliers can respond to orders', 403));
        }

        const createdOffers = [];
        for (const offerData of offers) {
            const newOffer = await Offer.create({
                order_id: orderId,
                supplier_id: req.user.id,
                price: offerData.price,
                delivery_time: offerData.deliveryTime || null,
                photo_url: offerData.photoUrl || null,
                condition: offerData.condition || 'new',
                item_name: offerData.itemName || null,
                item_code: offerData.itemCode || null,
                comment: offerData.comment || null,
                year: offerData.year || null,
                quantity: offerData.quantity ? parseInt(offerData.quantity, 10) : 1
            });
            createdOffers.push(newOffer);
        }

        res.status(200).json({
            status: 'success',
            data: {
                offers: createdOffers
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getOrderOffers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const offers = await Offer.getApprovedByOrder(id);

        res.status(200).json({
            status: 'success',
            data: {
                offers
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getPendingOffers = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can view pending offers', 403));
        }

        const offers = await Offer.getAllPending();

        res.status(200).json({
            status: 'success',
            data: {
                offers
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.approveOffer = async (req, res, next) => {
    try {
        const { finalPrice, itemName, deliveryTime } = req.body;
        const { id } = req.params; // offerId

        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can approve offers', 403));
        }

        const approvedOffer = await Offer.approve(id, {
            finalPrice,
            itemName,
            deliveryTime
        });

        // Update order status to offer_created (renamed from offered for consistency)
        await Order.update(approvedOffer.order_id, { status: 'offer_created' });

        res.status(200).json({
            status: 'success',
            data: {
                offer: approvedOffer
            }
        });
    } catch (err) {
        next(err);
    }
};

// --- NEW LOGISTICS FLOW ---

exports.selectOffer = async (req, res, next) => {
    try {
        const { orderId, offerId, deliveryMethod } = req.body;
        
        const order = await Order.getById(orderId);
        if (order.client_id !== req.user.id) {
            return next(new AppError('Not your order', 403));
        }

        const offer = await Offer.getById(offerId);
        
        await Order.update(orderId, {
            status: 'offer_selected',
            price: offer.final_price || offer.price,
            supplier_id: offer.supplier_id,
            delivery_method: deliveryMethod
        });

        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.confirmProductPayment = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return next(new AppError('Admin only', 403));
        const { orderId } = req.params;
        
        await Order.update(orderId, { status: 'paid_product' });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.updateTrackNumber = async (req, res, next) => {
    try {
        const { orderId, trackNumber } = req.body;
        const order = await Order.getById(orderId);
        
        if (req.user.role !== 'supplier' || order.supplier_id !== req.user.id) {
            return next(new AppError('Wrong supplier', 403));
        }

        await Order.update(orderId, {
            track_number: trackNumber,
            status: 'shipped_by_seller'
        });

        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.receiveAtWarehouse = async (req, res, next) => {
    try {
        if (req.user.role !== 'logist' && req.user.role !== 'admin') {
            return next(new AppError('Logist or Admin only', 403));
        }

        const { orderId, weight, dimensions, shippingPrice, photoUrl } = req.body;
        
        await Order.update(orderId, {
            weight,
            dimensions,
            shipping_price: shippingPrice,
            warehouse_photo_url: photoUrl,
            status: 'waiting_delivery_payment'
        });

        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.confirmDeliveryPayment = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return next(new AppError('Admin only', 403));
        const { orderId } = req.params;
        
        await Order.update(orderId, { status: 'delivery_paid' });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.shipToUzbekistan = async (req, res, next) => {
    try {
        if (req.user.role !== 'logist' && req.user.role !== 'admin') return next(new AppError('Logist/Admin only', 403));
        const { orderId, shippingTrackNumber } = req.body;
        
        await Order.update(orderId, {
            shipping_track_number: shippingTrackNumber,
            status: 'shipped_to_uzbekistan'
        });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.markDelivered = async (req, res, next) => {
    try {
        if (req.user.role !== 'logist' && req.user.role !== 'admin') return next(new AppError('Logist/Admin only', 403));
        const { orderId } = req.params;
        
        await Order.update(orderId, { status: 'delivered' });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.getOrdersByStatus = async (req, res, next) => {
    try {
        const { statuses } = req.query; // e.g. status1,status2
        const statusList = statuses ? statuses.split(',') : [];
        
        let orders = await Order.getByStatus(statusList);
        
        // Security: Suppliers only see their own orders
        if (req.user.role === 'supplier') {
            orders = orders.filter(o => Number(o.supplier_id) === Number(req.user.id));
        }
        
        res.status(200).json({
            status: 'success',
            data: { orders }
        });
    } catch (err) {
        next(err);
    }
};
exports.getLogisticsStats = async (req, res, next) => {
    try {
        if (req.user.role !== 'logist' && req.user.role !== 'admin') {
            return next(new AppError('Unauthorized', 403));
        }

        const stats = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'shipped_by_seller') as to_receive,
                COUNT(*) FILTER (WHERE status = 'arrived_warehouse') as in_warehouse,
                COUNT(*) FILTER (WHERE status = 'waiting_delivery_payment') as waiting_payment,
                COUNT(*) FILTER (WHERE status = 'delivery_paid') as ready_to_ship,
                COUNT(*) FILTER (WHERE status = 'shipped_to_uzbekistan') as in_transit
            FROM orders
        `);

        res.status(200).json({
            status: 'success',
            data: stats.rows[0]
        });
    } catch (err) {
        next(err);
    }
};

const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');
const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const db = require('../db');
const telegramService = require('../services/telegramService');

exports.createOrder = async (req, res, next) => {
    try {
        let { productId, deliveryMethod, itemName, carInfo, description, photoUrl, carBrand, year, quantity } = req.body;

        let newOrder;

        if (productId) {
            const product = await Product.getById(productId);
            if (!product) {
                return next(new AppError('Товар не найден', 404));
            }
            if (!product.is_approved) {
                return next(new AppError('Товар еще не одобрен администратором', 400));
            }

            const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;

            newOrder = await Order.create({
                client_id: req.user.id,
                item_name: product.name,
                car_info: `${product.brand} ${product.model}`,
                description: product.description || `Заказ товара из каталога (Артикул: ${product.code})`,
                photo_url: product.image_url,
                car_brand: product.brand,
                year: '',
                quantity: parsedQuantity,
                product_id: product.id,
                supplier_id: product.supplier_id,
                price: product.price,
                supplier_price: product.supplier_price || product.price,
                status: 'offer_selected',
                delivery_method: deliveryMethod || 'air'
            });

            // Notify client and specific supplier asynchronously
            telegramService.notifyOrderUpdate(newOrder.id, 'offer_selected').catch(err => console.error(err));
            telegramService.notifySupplierOrderUpdate(newOrder.id, 'offer_selected').catch(err => console.error(err));

        } else {
            if (!itemName) {
                return next(new AppError('Item name is required', 400));
            }

            // Fallback for cached frontends that omit carBrand: extract first word from carInfo
            if (!carBrand && carInfo) {
                carBrand = carInfo.split(' ')[0];
            }

            const { category } = req.body;

            newOrder = await Order.create({
                client_id: req.user.id,
                item_name: itemName,
                car_info: carInfo,
                description,
                photo_url: photoUrl,
                car_brand: carBrand,
                year,
                quantity: quantity ? parseInt(quantity, 10) : 1,
                category: category || 'parts'
            });

            // Notify all suppliers about new order
            telegramService.notifyNewOrderToSuppliers(newOrder).catch(err => console.error(err));
        }

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
            if (allowedBrands.length > 0) {
                orders = orders.filter(o => allowedBrands.includes(o.car_brand));
            }

            const allowedCategories = req.user.allowed_categories || [];
            orders = orders.filter(o => {
                const orderCategory = o.category || 'parts';
                if (orderCategory === 'parts') {
                    return allowedCategories.length === 0 || allowedCategories.includes('parts');
                }
                return allowedCategories.includes(orderCategory);
            });
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

        const order = await Order.getById(orderId);
        if (!order) {
            return next(new AppError('Заказ не найден', 404));
        }

        // Если пользователь поставщик, проверяем, разрешен ли ему бренд авто данного заказа
        if (req.user.role === 'supplier') {
            const allowedBrands = req.user.allowed_brands || [];
            if (allowedBrands.length > 0 && !allowedBrands.includes(order.car_brand)) {
                return next(new AppError('У вас нет прав на отправку предложений для этого бренда автомобилей', 403));
            }
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
        const order = await Order.getById(id);
        if (!order) {
            return next(new AppError('Заказ не найден', 404));
        }

        // Only the client who created the order or an admin can see the offers
        if (order.client_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('У вас нет прав для просмотра предложений к этому заказу', 403));
        }

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

        // Notify client via Telegram
        await telegramService.notifyOrderUpdate(approvedOffer.order_id, 'offer_created');

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
        if (!order) {
            return next(new AppError('Заказ не найден', 404));
        }
        if (order.client_id !== req.user.id) {
            return next(new AppError('Not your order', 403));
        }

        const offer = await Offer.getById(offerId);
        if (!offer) {
            return next(new AppError('Предложение не найдено', 404));
        }

        // Проверяем, что выбранное предложение действительно относится к этому заказу
        if (Number(offer.order_id) !== Number(orderId)) {
            return next(new AppError('Это предложение не относится к данному заказу', 400));
        }

        await Order.update(orderId, {
            status: 'offer_selected',
            price: offer.final_price || offer.price,
            supplier_price: offer.price,
            supplier_id: offer.supplier_id,
            delivery_method: deliveryMethod
        });

        // Notify client
        await telegramService.notifyOrderUpdate(orderId, 'offer_selected');
        // Notify supplier
        await telegramService.notifySupplierOrderUpdate(orderId, 'offer_selected');

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
        await telegramService.notifyOrderUpdate(orderId, 'paid_product');
        await telegramService.notifySupplierOrderUpdate(orderId, 'paid_product');
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
        await telegramService.notifyOrderUpdate(orderId, 'shipped_by_seller');
        await telegramService.notifyLogistsNewPackage(orderId);

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
            logist_shipping_price: shippingPrice,
            warehouse_photo_url: photoUrl,
            status: 'logistics_review'
        });
        // Notify admin (optional, they see it in dashboard)
        // await telegramService.notifyOrderUpdate(orderId, 'logistics_review');

        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.approveLogistics = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return next(new AppError('Admin only', 403));
        const { orderId, finalShippingPrice } = req.body;

        await Order.update(orderId, {
            shipping_price: finalShippingPrice,
            status: 'waiting_delivery_payment'
        });
        await telegramService.notifyOrderUpdate(orderId, 'waiting_delivery_payment');
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
        await telegramService.notifyOrderUpdate(orderId, 'delivery_paid');
        await telegramService.notifyLogistsReadyToShip(orderId);
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
        await telegramService.notifyOrderUpdate(orderId, 'shipped_to_uzbekistan');
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
        await telegramService.notifyOrderUpdate(orderId, 'delivered');
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

        // Logistics separation: Logists only see orders matching their logistics type
        if (req.user.role === 'logist') {
            const logisticsType = req.user.logistics_type;
            if (logisticsType) {
                orders = orders.filter(o => o.delivery_method === logisticsType);
            }
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

        let queryStr = `
            SELECT 
                COUNT(*) FILTER (WHERE status = 'shipped_by_seller') as to_receive,
                COUNT(*) FILTER (WHERE status = 'arrived_warehouse') as in_warehouse,
                COUNT(*) FILTER (WHERE status = 'waiting_delivery_payment') as waiting_payment,
                COUNT(*) FILTER (WHERE status = 'delivery_paid') as ready_to_ship,
                COUNT(*) FILTER (WHERE status = 'shipped_to_uzbekistan') as in_transit
            FROM orders
        `;
        const params = [];
        if (req.user.role === 'logist' && req.user.logistics_type) {
            queryStr += ` WHERE delivery_method = $1`;
            params.push(req.user.logistics_type);
        }

        const stats = await db.query(queryStr, params);

        res.status(200).json({
            status: 'success',
            data: stats.rows[0]
        });
    } catch (err) {
        next(err);
    }
};

exports.getAdminAnalytics = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new AppError('Only admins can view analytics', 403));
        }

        // 1. Detailed orders bought
        const detailedOrdersResult = await db.query(`
            SELECT 
                o.id,
                o.item_name,
                o.car_info,
                o.quantity,
                o.price as client_price_uzs,
                o.supplier_price as supplier_price_cny,
                o.status,
                o.created_at,
                u_client.name as client_name,
                u_client.user_code as client_code,
                u_supplier.id as supplier_id,
                u_supplier.name as supplier_name,
                u_supplier.phone as supplier_phone
            FROM orders o
            LEFT JOIN users u_client ON o.client_id = u_client.id
            LEFT JOIN users u_supplier ON o.supplier_id = u_supplier.id
            WHERE o.status IN ('paid_product', 'shipped_by_seller', 'logistics_review', 'waiting_delivery_payment', 'delivery_paid', 'shipped_to_uzbekistan', 'delivered')
            ORDER BY o.created_at DESC
        `);

        // 2. Summary by supplier (how much money to send)
        const summaryBySupplierResult = await db.query(`
            SELECT 
                u_supplier.id as supplier_id,
                u_supplier.name as supplier_name,
                u_supplier.phone as supplier_phone,
                COUNT(o.id) as total_orders,
                SUM(COALESCE(o.supplier_price, o.price) * o.quantity) as total_supplier_cny,
                SUM(COALESCE(o.price, 0) * o.quantity) as total_client_uzs
            FROM orders o
            JOIN users u_supplier ON o.supplier_id = u_supplier.id
            WHERE o.status IN ('paid_product', 'shipped_by_seller', 'logistics_review', 'waiting_delivery_payment', 'delivery_paid', 'shipped_to_uzbekistan', 'delivered')
            GROUP BY u_supplier.id, u_supplier.name, u_supplier.phone
            ORDER BY total_supplier_cny DESC
        `);

        res.status(200).json({
            status: 'success',
            data: {
                detailedOrders: detailedOrdersResult.rows,
                summaryBySupplier: summaryBySupplierResult.rows
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getPaymentLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.getById(id);

        if (!order) {
            return next(new AppError('Заказ не найден', 404));
        }

        // Verify ownership
        if (order.client_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('У вас нет прав для оплаты этого заказа', 403));
        }

        // Verify status
        if (order.status !== 'offer_selected' && order.status !== 'waiting_delivery_payment' && order.status !== 'waiting_payment') {
            return next(new AppError('Этот заказ в данный момент не ожидает оплаты', 400));
        }

        let amount;
        if (order.status === 'offer_selected') {
            amount = Math.round(parseFloat(order.price) * 100);
        } else if (order.status === 'waiting_delivery_payment') {
            amount = Math.round(parseFloat(order.shipping_price) * 100);
        } else {
            // order.status === 'waiting_payment'
            // Check if there is already a performed transaction for this order
            const performedTxRes = await db.query(
                'SELECT * FROM payme_transactions WHERE order_id = $1 AND state = 2',
                [order.id]
            );
            if (performedTxRes.rows.length > 0) {
                amount = Math.round(parseFloat(order.shipping_price) * 100);
            } else {
                amount = Math.round(parseFloat(order.price) * 100);
            }
        }

        const merchantId = process.env.PAYME_MERCHANT_ID || '587f72c72cac0d162c722ae2';
        const returnUrl = process.env.PAYME_RETURN_URL || req.get('referer') || 'https://nexaicall.space';
        const redirectTimeout = 5000;
        const currencyCode = 860; // UZS

        const paramsString = `m=${merchantId};ac.order_id=${order.id};a=${amount};l=ru;c=${returnUrl};ct=${redirectTimeout};cr=${currencyCode}`;
        const base64Params = Buffer.from(paramsString).toString('base64');

        const isSandbox = process.env.PAYME_SANDBOX !== 'false';
        const checkoutUrl = isSandbox ? 'https://test.paycom.uz' : 'https://checkout.paycom.uz';

        const paymentLink = `${checkoutUrl}/${base64Params}`;

        res.status(200).json({
            status: 'success',
            data: {
                paymentLink
            }
        });
    } catch (err) {
        next(err);
    }
};


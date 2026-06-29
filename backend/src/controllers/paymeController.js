const fs = require('fs');
const path = require('path');
const db = require('../db');
const Order = require('../models/orderModel');
const telegramService = require('../services/telegramService');

// Payme transaction states
const STATE_CREATED = 1;
const STATE_PERFORMED = 2;
const STATE_CANCELLED_BEFORE_PAY = -1;
const STATE_CANCELLED_AFTER_PAY = -2;

const TRANSACTION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

exports.handleBilling = async (req, res, next) => {
    try {
        // 1) Basic Authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return respondError(res, req.body.id, -32504, 'Insufficient privilege');
        }

        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [username, password] = decoded.split(':');

        if (password !== process.env.PAYME_KEY) {
            return respondError(res, req.body.id, -32504, 'Insufficient privilege');
        }

        const { method, params, id } = req.body;

        switch (method) {
            case 'CheckPerformTransaction':
                return await handleCheckPerform(params, id, res);
            case 'CreateTransaction':
                return await handleCreateTransaction(params, id, res);
            case 'PerformTransaction':
                return await handlePerformTransaction(params, id, res);
            case 'CancelTransaction':
                return await handleCancelTransaction(params, id, res);
            case 'CheckTransaction':
                return await handleCheckTransaction(params, id, res);
            case 'GetStatement':
                return await handleGetStatement(params, id, res);
            case 'ChangePassword':
                return await handleChangePassword(params, id, res);
            default:
                return respondError(res, id, -32601, 'Method not found');
        }
    } catch (err) {
        console.error('Payme RPC error:', err);
        return respondError(res, req.body?.id, -32603, 'Internal error');
    }
};

// Helper: respond JSON-RPC success
function respondSuccess(res, id, result) {
    return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result
    });
}

// Helper: respond JSON-RPC error
function respondError(res, id, code, message, data = null) {
    return res.status(200).json({
        jsonrpc: '2.0',
        id,
        error: {
            code,
            message,
            ...(data ? { data } : {})
        }
    });
}

// Helper to build detail object for Payme fiscalization
function buildReceiptDetail(order, amountInTiyins) {
    const isDelivery = order.status === 'waiting_delivery_payment';
    
    // Default values for fiscalization
    const vatPercent = Number(process.env.PAYME_VAT_PERCENT) || 0; 
    
    // Fallback ИКПУ and package codes
    const defaultDeliveryIkpu = process.env.PAYME_DELIVERY_IKPU || '10901001001000000';
    const defaultProductIkpu = process.env.PAYME_PRODUCT_IKPU || '08703002001000001';
    
    const defaultDeliveryPackageCode = process.env.PAYME_DELIVERY_PACKAGE_CODE || '123456';
    const defaultProductPackageCode = process.env.PAYME_PRODUCT_PACKAGE_CODE || '123456';

    const items = [];

    if (isDelivery) {
        items.push({
            title: `Доставка заказа #${order.id}`,
            price: Number(amountInTiyins),
            count: 1,
            code: defaultDeliveryIkpu,
            package_code: defaultDeliveryPackageCode,
            vat_percent: vatPercent
        });
    } else {
        const count = Number(order.quantity) || 1;
        const unitPrice = Math.round(Number(amountInTiyins) / count);
        items.push({
            title: order.item_name || 'Автозапчасти',
            price: unitPrice,
            count: count,
            code: defaultProductIkpu,
            package_code: defaultProductPackageCode,
            vat_percent: vatPercent
        });
    }

    return {
        receipt_type: 0,
        items: items
    };
}

// Handler: CheckPerformTransaction
async function handleCheckPerform(params, id, res) {
    const { amount, account } = params;
    const orderId = account ? account.order_id : null;

    if (!orderId) {
        return respondError(res, id, -31050, 'order_id is required', 'order_id');
    }

    const order = await Order.getById(orderId);
    if (!order) {
        return respondError(res, id, -31050, 'Заказ не найден', 'order_id');
    }

    // Verify order status eligibility and amount
    const check = verifyOrderEligibility(order, amount);
    if (!check.allow) {
        const errorData = (check.errorCode >= -31099 && check.errorCode <= -31050) ? 'order_id' : null;
        return respondError(res, id, check.errorCode, check.errorMessage, errorData);
    }

    const detail = buildReceiptDetail(order, amount);
    return respondSuccess(res, id, { 
        allow: true, 
        detail: detail
    });
}

// Helper to check status eligibility and amount
function verifyOrderEligibility(order, amountInTiyins) {
    if (order.status !== 'offer_selected' && order.status !== 'waiting_delivery_payment') {
        return {
            allow: false,
            errorCode: -31052,
            errorMessage: 'Статус заказа не допускает оплату'
        };
    }

    let expectedAmount;
    if (order.status === 'waiting_delivery_payment') {
        expectedAmount = Math.round(parseFloat(order.shipping_price) * 100);
    } else {
        expectedAmount = Math.round(parseFloat(order.price) * 100);
    }

    if (isNaN(expectedAmount)) {
        expectedAmount = 0;
    }

    if (Math.abs(expectedAmount - amountInTiyins) > 1) { // allow 1 tiyin rounding difference
        return {
            allow: false,
            errorCode: -31001,
            errorMessage: 'Неверная сумма платежа'
        };
    }

    return { allow: true };
}

// Handler: CreateTransaction
async function handleCreateTransaction(params, id, res) {
    const { id: paymeTxId, time, amount, account } = params;
    const orderId = account ? account.order_id : null;

    if (!orderId) {
        return respondError(res, id, -31050, 'order_id is required', 'order_id');
    }

    const order = await Order.getById(orderId);
    if (!order) {
        return respondError(res, id, -31050, 'Заказ не найден', 'order_id');
    }

    // 1) Verify if transaction already exists in DB
    const txRes = await db.query('SELECT * FROM payme_transactions WHERE id = $1', [paymeTxId]);
    const existingTx = txRes.rows[0];

    if (existingTx) {
        // If transaction exists, check if details match
        if (Number(existingTx.amount) !== Number(amount)) {
            return respondError(res, id, -31001, 'Неверная сумма платежа');
        }

        // If transaction exists, check state
        if (existingTx.state === STATE_CREATED) {
            // Check timeout
            const now = Date.now();
            if (now - Number(existingTx.create_time) > TRANSACTION_TIMEOUT) {
                // Cancel transaction on timeout
                await db.query(
                    'UPDATE payme_transactions SET state = $1, cancel_time = $2, reason = 4 WHERE id = $3',
                    [STATE_CANCELLED_BEFORE_PAY, now, paymeTxId]
                );
                return respondError(res, id, -31008, 'Transaction timed out');
            }

            const detail = buildReceiptDetail(order, amount);
            return respondSuccess(res, id, {
                create_time: Number(existingTx.time),
                transaction: existingTx.id,
                state: existingTx.state,
                detail: detail
            });
        } else {
            return respondError(res, id, -31008, 'Transaction is not active');
        }
    }

    // 2) Verify order is eligible to create transaction
    const check = verifyOrderEligibility(order, amount);
    if (!check.allow) {
        const errorData = (check.errorCode >= -31099 && check.errorCode <= -31050) ? 'order_id' : null;
        return respondError(res, id, check.errorCode, check.errorMessage, errorData);
    }

    // 3) Verify if there is already another active transaction for this order
    const activeTxRes = await db.query(
        'SELECT * FROM payme_transactions WHERE order_id = $1 AND state = $2',
        [orderId, STATE_CREATED]
    );
    if (activeTxRes.rows.length > 0) {
        return respondError(res, id, -31099, 'Another transaction is pending for this order', 'order_id');
    }

    // 4) Create new transaction in DB
    const now = Date.now();
    await db.query(
        `INSERT INTO payme_transactions (id, time, state, amount, order_id, create_time) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [paymeTxId, time, STATE_CREATED, amount, orderId, now]
    );

    const detail = buildReceiptDetail(order, amount);
    return respondSuccess(res, id, {
        create_time: Number(time),
        transaction: paymeTxId,
        state: STATE_CREATED,
        detail: detail
    });
}

// Handler: PerformTransaction
async function handlePerformTransaction(params, id, res) {
    const { id: paymeTxId } = params;

    const txRes = await db.query('SELECT * FROM payme_transactions WHERE id = $1', [paymeTxId]);
    const tx = txRes.rows[0];

    if (!tx) {
        return respondError(res, id, -31003, 'Transaction not found');
    }

    const now = Date.now();

    if (tx.state === STATE_CREATED) {
        // 1) Verify timeout
        if (now - Number(tx.create_time) > TRANSACTION_TIMEOUT) {
            await db.query(
                'UPDATE payme_transactions SET state = $1, cancel_time = $2, reason = 4 WHERE id = $3',
                [STATE_CANCELLED_BEFORE_PAY, now, paymeTxId]
            );
            return respondError(res, id, -31008, 'Transaction timed out');
        }

        // 2) Update transaction state to performed
        await db.query(
            'UPDATE payme_transactions SET state = $1, perform_time = $2 WHERE id = $3',
            [STATE_PERFORMED, now, paymeTxId]
        );

        // 3) Update corresponding order status and notify via Telegram
        const order = await Order.getById(tx.order_id);
        if (order) {
            if (order.status === 'offer_selected') {
                await Order.update(order.id, { status: 'paid_product' });
                telegramService.notifyOrderUpdate(order.id, 'paid_product').catch(err => console.error(err));
                telegramService.notifySupplierOrderUpdate(order.id, 'paid_product').catch(err => console.error(err));
            } else if (order.status === 'waiting_delivery_payment') {
                await Order.update(order.id, { status: 'delivery_paid' });
                telegramService.notifyOrderUpdate(order.id, 'delivery_paid').catch(err => console.error(err));
                telegramService.notifyLogistsReadyToShip(order.id).catch(err => console.error(err));
            }
        }

        return respondSuccess(res, id, {
            transaction: paymeTxId,
            perform_time: now,
            state: STATE_PERFORMED
        });
    } else if (tx.state === STATE_PERFORMED) {
        // If already performed, return existing performance details
        return respondSuccess(res, id, {
            transaction: paymeTxId,
            perform_time: Number(tx.perform_time),
            state: STATE_PERFORMED
        });
    } else {
        return respondError(res, id, -31008, 'Cannot perform cancelled transaction');
    }
}

// Handler: CancelTransaction
async function handleCancelTransaction(params, id, res) {
    const { id: paymeTxId, reason } = params;

    const txRes = await db.query('SELECT * FROM payme_transactions WHERE id = $1', [paymeTxId]);
    const tx = txRes.rows[0];

    if (!tx) {
        return respondError(res, id, -31003, 'Transaction not found');
    }

    const now = Date.now();

    if (tx.state === STATE_CREATED) {
        // Cancel created transaction before payment
        await db.query(
            'UPDATE payme_transactions SET state = $1, cancel_time = $2, reason = $3 WHERE id = $4',
            [STATE_CANCELLED_BEFORE_PAY, now, reason, paymeTxId]
        );

        return respondSuccess(res, id, {
            transaction: paymeTxId,
            cancel_time: now,
            state: STATE_CANCELLED_BEFORE_PAY
        });
    } else if (tx.state === STATE_PERFORMED) {
        // Cancel performed transaction (Refund request)
        const order = await Order.getById(tx.order_id);
        if (order) {
            // Cancellation only allowed if order has not moved further down shipping/completion cycle
            const nonCancellableStatuses = [
                'shipped_by_seller', 'logistics_review', 
                'shipped_to_uzbekistan', 'delivered'
            ];
            if (nonCancellableStatuses.includes(order.status)) {
                return respondError(res, id, -31007, 'Cannot cancel transaction, product already shipped');
            }

            // Revert order status
            if (order.status === 'paid_product') {
                await Order.update(order.id, { status: 'offer_selected' });
            } else if (order.status === 'delivery_paid') {
                await Order.update(order.id, { status: 'waiting_delivery_payment' });
            }
        }

        await db.query(
            'UPDATE payme_transactions SET state = $1, cancel_time = $2, reason = $3 WHERE id = $4',
            [STATE_CANCELLED_AFTER_PAY, now, reason, paymeTxId]
        );

        return respondSuccess(res, id, {
            transaction: paymeTxId,
            cancel_time: now,
            state: STATE_CANCELLED_AFTER_PAY
        });
    } else {
        // If already cancelled, return existing details
        return respondSuccess(res, id, {
            transaction: paymeTxId,
            cancel_time: Number(tx.cancel_time),
            state: tx.state
        });
    }
}

// Handler: CheckTransaction
async function handleCheckTransaction(params, id, res) {
    const { id: paymeTxId } = params;

    const txRes = await db.query('SELECT * FROM payme_transactions WHERE id = $1', [paymeTxId]);
    const tx = txRes.rows[0];

    if (!tx) {
        return respondError(res, id, -31003, 'Transaction not found');
    }

    return respondSuccess(res, id, {
        create_time: Number(tx.time),
        perform_time: tx.perform_time ? Number(tx.perform_time) : 0,
        cancel_time: tx.cancel_time ? Number(tx.cancel_time) : 0,
        transaction: tx.id,
        state: tx.state,
        reason: tx.reason || null
    });
}

// Handler: GetStatement
async function handleGetStatement(params, id, res) {
    const { from, to } = params;
    if (!from || !to) {
        return respondError(res, id, -32600, 'from and to parameters are required');
    }

    try {
        const txsRes = await db.query(
            'SELECT * FROM payme_transactions WHERE time >= $1 AND time <= $2 ORDER BY time ASC',
            [from, to]
        );

        const transactions = txsRes.rows.map(tx => ({
            id: tx.id,
            time: Number(tx.time),
            amount: Number(tx.amount),
            account: {
                order_id: String(tx.order_id)
            },
            create_time: Number(tx.create_time),
            perform_time: tx.perform_time ? Number(tx.perform_time) : 0,
            cancel_time: tx.cancel_time ? Number(tx.cancel_time) : 0,
            transaction: tx.id,
            state: tx.state,
            reason: tx.reason || null
        }));

        return respondSuccess(res, id, { transactions });
    } catch (err) {
        console.error('Payme GetStatement error:', err);
        return respondError(res, id, -32400, 'System error during statement retrieval');
    }
}

// Handler: ChangePassword
async function handleChangePassword(params, id, res) {
    const { password } = params;
    if (!password) {
        return respondError(res, id, -32600, 'Password is required');
    }

    try {
        const envPath = path.join(__dirname, '../../.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        let updatedEnv = '';
        if (envContent.includes('PAYME_KEY=')) {
            updatedEnv = envContent.replace(/PAYME_KEY=([^ \r\n]*)/, `PAYME_KEY=${password}`);
        } else {
            updatedEnv = envContent + `\nPAYME_KEY=${password}`;
        }

        fs.writeFileSync(envPath, updatedEnv, 'utf8');
        process.env.PAYME_KEY = password;

        return respondSuccess(res, id, { success: true });
    } catch (err) {
        console.error('Failed to change Payme key:', err);
        return respondError(res, id, -32400, 'System error during password change');
    }
}

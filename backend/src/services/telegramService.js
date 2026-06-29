const TelegramBot = require('node-telegram-bot-api');
const db = require('../db');

class TelegramService {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        if (this.token) {
            // If webhook URL is missing, fall back to polling for testing
            const usePolling = !process.env.TELEGRAM_WEBHOOK_URL || process.env.TELEGRAM_POLLING === 'true';
            this.bot = new TelegramBot(this.token, { polling: usePolling });
            
            if (usePolling) {
                console.log('Telegram Bot started in POLLING mode');
                this.bot.on('message', (msg) => this.handleWebhook({ message: msg }));
            }
        }
    }

    async initWebhook() {
        if (!this.bot || !process.env.TELEGRAM_WEBHOOK_URL || process.env.TELEGRAM_POLLING === 'true') return;
        try {
            const url = `${process.env.TELEGRAM_WEBHOOK_URL}/api/v1/telegram/webhook`;
            const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || 'garage_secret_bot_token_2026';
            await this.bot.setWebHook(url, { secret_token: secretToken });
            console.log('Telegram Webhook set to:', url);
        } catch (err) {
            console.error('Failed to set Telegram Webhook:', err);
        }
    }

    async handleWebhook(update) {
        if (!this.bot) return;

        const message = update.message;
        if (!message || !message.text) return;

        const text = message.text;
        const chatId = message.chat.id;

        // Handle /start [token] for deep linking
        if (text.startsWith('/start ')) {
            const token = text.split(' ')[1];
            await this.linkAccount(chatId, token);
        } else if (text === '/start') {
            await this.bot.sendMessage(chatId, '👋 Привет! Чтобы получать уведомления, пожалуйста, нажмите кнопку "Привязать Telegram" в вашем личном кабинете на сайте nexaicall.space');
        }
    }

    async linkAccount(chatId, token) {
        try {
            const result = await db.query(
                'UPDATE users SET telegram_chat_id = $1, telegram_sync_token = NULL WHERE telegram_sync_token = $2 RETURNING name',
                [chatId, token]
            );

            if (result.rows.length > 0) {
                const user = result.rows[0];
                await this.bot.sendMessage(chatId, `✅ Привет, <b>${user.name}</b>! Ваш аккаунт успешно привязан к системе Garage.\n\nТеперь вы будете получать уведомления о новых предложениях и изменении статусов ваших заказов здесь.`);
            } else {
                await this.bot.sendMessage(chatId, '❌ Ссылка устарела или неверна. Пожалуйста, получите новую ссылку в личном кабинете на сайте.');
            }
        } catch (err) {
            console.error('Telegram Link Error:', err);
        }
    }

    async sendMessage(chatId, text) {
        if (!this.bot || !chatId) return;
        try {
            await this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            console.error('Telegram Send Error:', err);
        }
    }

    async notifyOrderUpdate(orderId, status) {
        try {
            const result = await db.query(
                `SELECT o.id, o.item_name, u.telegram_chat_id 
                 FROM orders o 
                 JOIN users u ON o.client_id = u.id 
                 WHERE o.id = $1`, 
                [orderId]
            );
            
            const order = result.rows[0];
            if (order && order.telegram_chat_id) {
                const statusMap = {
                    'pending': 'Ожидает обработки',
                    'offer_created': 'Поступило предложение ✨',
                    'offer_selected': 'Вы выбрали предложение',
                    'waiting_payment': 'Ожидает оплаты 💳',
                    'paid_product': 'Товар оплачен ✅',
                    'shipped_by_seller': 'Отправлено продавцом 🚚',
                    'waiting_delivery_payment': 'Прибыло на склад. Ожидает оплаты доставки 📦',
                    'delivery_paid': 'Доставка оплачена',
                    'shipped_to_uzbekistan': 'Отправлено в Узбекистан ✈️',
                    'delivered': 'Доставлено! 🎉',
                    'cancelled': 'Отменен ❌'
                };

                const statusText = statusMap[status] || status;
                const message = `🔔 <b>Обновление заказа #${order.id}</b>\n\nТовар: ${order.item_name}\nНовый статус: <b>${statusText}</b>\n\nПосмотреть детали: <a href="https://nexaicall.space/orders">Открыть кабинет</a>`;
                
                await this.sendMessage(order.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Error:', err);
        }
    }

    async notifyNewOrderToSuppliers(order) {
        try {
            if (!order.car_brand) return;
            
            const brandJson = JSON.stringify(order.car_brand);
            const category = order.category || 'parts';

            let queryStr = `
                SELECT u.telegram_chat_id 
                FROM users u
                JOIN roles r ON u.role_id = r.id 
                WHERE r.name = 'supplier' 
                AND u.telegram_chat_id IS NOT NULL
                AND u.allowed_brands @> $1::jsonb
            `;
            const params = [brandJson];

            if (category === 'parts') {
                queryStr += `
                    AND (
                        u.allowed_categories IS NULL 
                        OR u.allowed_categories = '[]'::jsonb 
                        OR u.allowed_categories @> '"parts"'::jsonb
                    )
                `;
            } else {
                queryStr += ` AND u.allowed_categories @> $2::jsonb`;
                params.push(JSON.stringify(category));
            }

            const result = await db.query(queryStr, params);

            const suppliers = result.rows;
            for (const s of suppliers) {
                const message = `🆕 <b>Новый запрос на запчасть!</b>\n\nМарка: <b>${order.car_brand}</b>\nДеталь: ${order.item_name}\nАвто: ${order.car_info}\n\nПосмотреть и предложить цену: <a href="https://nexaicall.space/supplier/orders">Открыть портал</a>`;
                await this.sendMessage(s.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Suppliers Error:', err);
        }
    }

    async notifySupplierOrderUpdate(orderId, status) {
        try {
            const result = await db.query(
                `SELECT o.id, o.item_name, u.telegram_chat_id 
                 FROM orders o 
                 JOIN users u ON o.supplier_id = u.id 
                 WHERE o.id = $1`, 
                [orderId]
            );
            
            const order = result.rows[0];
            if (order && order.telegram_chat_id) {
                const statusMap = {
                    'offer_selected': 'Ваше предложение выбрано клиентом! 🛒\nОжидайте оплаты товара.',
                    'paid_product': 'Товар оплачен! ✅\nПожалуйста, отправьте товар на склад и введите трек-номер в системе.'
                };

                const statusText = statusMap[status];
                if (!statusText) return;

                const message = `🔔 <b>Обновление по заказу #${order.id}</b>\n\nТовар: ${order.item_name}\n\n${statusText}\n\n<a href="https://nexaicall.space/supplier/orders">Перейти к заказу</a>`;
                
                await this.sendMessage(order.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Supplier Update Error:', err);
        }
    }

    async notifyLogistsNewPackage(orderId) {
        try {
            const result = await db.query(
                `SELECT o.id, o.item_name, o.car_info, o.delivery_method, o.track_number, u.name as client_name 
                 FROM orders o 
                 JOIN users u ON o.client_id = u.id 
                 WHERE o.id = $1`, 
                [orderId]
            );
            
            const order = result.rows[0];
            if (!order) return;

            const deliveryEmoji = order.delivery_method === 'air' ? '✈️ Авиа' : '🚛 Авто';

            const logistResult = await db.query(
                `SELECT u.telegram_chat_id 
                 FROM users u
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.name = 'logist' 
                 AND u.telegram_chat_id IS NOT NULL
                 AND (u.logistics_type = $1 OR u.logistics_type IS NULL)`,
                [order.delivery_method]
            );

            const logists = logistResult.rows;
            for (const l of logists) {
                const message = `📦 <b>Новое поступление на склад (${deliveryEmoji})!</b>\n\n` +
                                `Заказ: <b>#${order.id}</b>\n` +
                                `Товар: ${order.item_name}\n` +
                                `Авто: ${order.car_info}\n` +
                                `Клиент: ${order.client_name}\n` +
                                `Трек-номер продавца: <code>${order.track_number || '—'}</code>\n\n` +
                                `<a href="https://nexaicall.space/logist">Открыть панель логиста</a>`;
                await this.sendMessage(l.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Logists New Package Error:', err);
        }
    }

    async notifyLogistsReadyToShip(orderId) {
        try {
            const result = await db.query(
                `SELECT o.id, o.item_name, o.car_info, o.delivery_method, u.name as client_name 
                 FROM orders o 
                 JOIN users u ON o.client_id = u.id 
                 WHERE o.id = $1`, 
                [orderId]
            );
            
            const order = result.rows[0];
            if (!order) return;

            const deliveryEmoji = order.delivery_method === 'air' ? '✈️ Авиа' : '🚛 Авто';

            const logistResult = await db.query(
                `SELECT u.telegram_chat_id 
                 FROM users u
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.name = 'logist' 
                 AND u.telegram_chat_id IS NOT NULL
                 AND (u.logistics_type = $1 OR u.logistics_type IS NULL)`,
                [order.delivery_method]
            );

            const logists = logistResult.rows;
            for (const l of logists) {
                const message = `✈️ <b>Заказ готов к отправке в Узбекистан (${deliveryEmoji})!</b>\n\n` +
                                `Заказ: <b>#${order.id}</b>\n` +
                                `Товар: ${order.item_name}\n` +
                                `Клиент: ${order.client_name}\n` +
                                `Статус: <b>Доставка оплачена</b>\n\n` +
                                `Пожалуйста, отправьте заказ и введите трек-номер отправления.\n\n` +
                                `<a href="https://nexaicall.space/logist">Открыть панель логиста</a>`;
                await this.sendMessage(l.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Logists Ready To Ship Error:', err);
        }
    }
}

module.exports = new TelegramService();

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
            await this.bot.setWebHook(url);
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
                    'paid_product': 'Товар оплачен ✅',
                    'shipped_by_seller': 'Отправлено продавцом 🚚',
                    'waiting_delivery_payment': 'Прибыло на склад. Ожидает оплаты доставки 📦',
                    'delivery_paid': 'Доставка оплачена',
                    'shipped_to_uzbekistan': 'Отправлено в Узбекистан ✈️',
                    'delivered': 'Доставлено! 🎉'
                };

                const statusText = statusMap[status] || status;
                const message = `🔔 <b>Обновление заказа #${order.id}</b>\n\nТовар: ${order.item_name}\nНовый статус: <b>${statusText}</b>\n\nПосмотреть детали: <a href="https://nexaicall.space/orders">Открыть кабинет</a>`;
                
                await this.sendMessage(order.telegram_chat_id, message);
            }
        } catch (err) {
            console.error('Telegram Notify Error:', err);
        }
    }
}

module.exports = new TelegramService();

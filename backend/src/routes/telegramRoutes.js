const express = require('express');
const telegramService = require('../services/telegramService');

const router = express.Router();

// Public endpoint for Telegram Webhook
router.post('/webhook', async (req, res) => {
    try {
        const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || 'garage_secret_bot_token_2026';
        if (req.headers['x-telegram-bot-api-secret-token'] !== secretToken) {
            console.warn('Unauthorized Telegram Webhook request blocked');
            return res.status(403).send('Forbidden');
        }
        await telegramService.handleWebhook(req.body);
        res.status(200).send('OK');
    } catch (err) {
        console.error('Telegram Webhook Route error:', err);
        res.status(200).send('OK'); 
    }
});

module.exports = router;

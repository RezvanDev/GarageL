const express = require('express');
const telegramService = require('../services/telegramService');

const router = express.Router();

// Public endpoint for Telegram Webhook
router.post('/webhook', async (req, res) => {
    try {
        await telegramService.handleWebhook(req.body);
        res.status(200).send('OK');
    } catch (err) {
        console.error('Telegram Webhook Route error:', err);
        res.status(200).send('OK'); 
    }
});

module.exports = router;

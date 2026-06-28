const express = require('express');
const paymeController = require('../controllers/paymeController');

const router = express.Router();

router.post('/payme', paymeController.handleBilling);

module.exports = router;

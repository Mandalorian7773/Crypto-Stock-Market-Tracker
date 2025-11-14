const express = require('express');
const { getCryptoPrice } = require('../controllers/cryptoController');

const router = express.Router();

router.get('/price', getCryptoPrice);

module.exports = router;
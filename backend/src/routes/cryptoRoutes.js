const express = require('express');
const { getCryptoPrice, getTopCryptos } = require('../controllers/cryptoController');

const router = express.Router();

router.get('/price', getCryptoPrice);
router.get('/top', getTopCryptos);

module.exports = router;
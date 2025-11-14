const express = require('express');
const { 
  getTopCryptos, 
  getCryptoDetails, 
  getCryptoHistory,
  searchCryptos
} = require('../controllers/cryptoController');

const router = express.Router();

router.get('/top', getTopCryptos);
router.get('/search', searchCryptos);
router.get('/:id/details', getCryptoDetails);
router.get('/:id/history', getCryptoHistory);

module.exports = router;
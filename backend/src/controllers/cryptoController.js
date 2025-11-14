const coinGeckoService = require('../services/coinGeckoService');

async function getCryptoPrice(req, res, next) {
  try {
    const { cryptoId } = req.query;
    
    if (!cryptoId) {
      return res.status(400).json({
        success: false,
        message: 'cryptoId query parameter is required'
      });
    }
    
    // Validate cryptoId format (should be alphanumeric, underscores, hyphens, commas)
    const validCryptoId = /^[a-zA-Z0-9_,\-\s]+$/.test(cryptoId);
    if (!validCryptoId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cryptoId format'
      });
    }
    
    const data = await coinGeckoService.getCryptoPrice(cryptoId);
    
    // Check if we got data for the requested crypto
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({
        success: false,
        message: `No data found for cryptocurrency: ${cryptoId}`
      });
    }
    
    // Format the response for a single crypto
    const cryptoKeys = Object.keys(data);
    const firstCrypto = cryptoKeys[0];
    
    // If multiple cryptos were requested, return the first one
    const cryptoData = data[firstCrypto];
    
    const response = {
      symbol: firstCrypto,
      usd: cryptoData.usd || null,
      inr: cryptoData.inr || null,
      lastUpdated: new Date().toISOString()
    };
    
    // If multiple cryptos were requested, include all in the response
    if (cryptoKeys.length > 1) {
      response.prices = {};
      cryptoKeys.forEach(key => {
        response.prices[key] = {
          usd: data[key].usd || null,
          inr: data[key].inr || null
        };
      });
    }
    
    res.json(response);
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Cryptocurrency not found'
        });
      } else if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please try again later.'
        });
      } else if (error.response.status >= 500) {
        return res.status(500).json({
          success: false,
          message: 'CoinGecko API is temporarily unavailable. Please try again later.'
        });
      }
    }
    
    // Handle network errors or other issues
    console.error('Error fetching crypto price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cryptocurrency price'
    });
  }
}

module.exports = {
  getCryptoPrice
};
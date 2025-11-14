const coinGeckoService = require('../services/coinGeckoService');
const { calculateSMA, calculateEMA, calculateROI } = require('../utils/analytics');

async function getTopCryptos(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const cryptos = await coinGeckoService.getTopCryptos(parseInt(limit));
    
    const formattedCryptos = cryptos.map(crypto => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      image: crypto.image,
      current_price: crypto.current_price,
      market_cap: crypto.market_cap,
      market_cap_rank: crypto.market_cap_rank,
      price_change_percentage_24h: crypto.price_change_percentage_24h,
      total_volume: crypto.total_volume
    }));
    
    res.json({
      success: true,
      data: formattedCryptos
    });
  } catch (error) {
    next(error);
  }
}

async function getCryptoDetails(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Crypto ID is required'
      });
    }
    
    const crypto = await coinGeckoService.getCryptoDetails(id);
    
    if (!crypto || Object.keys(crypto).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cryptocurrency not found'
      });
    }
    
    const formattedCrypto = {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      image: crypto.image.large,
      market_data: {
        current_price: crypto.market_data.current_price.usd,
        market_cap: crypto.market_data.market_cap.usd,
        market_cap_rank: crypto.market_data.market_cap_rank,
        price_change_percentage_24h: crypto.market_data.price_change_percentage_24h,
        price_change_percentage_7d: crypto.market_data.price_change_percentage_7d,
        total_volume: crypto.market_data.total_volume.usd,
        high_24h: crypto.market_data.high_24h.usd,
        low_24h: crypto.market_data.low_24h.usd
      }
    };
    
    res.json({
      success: true,
      data: formattedCrypto
    });
  } catch (error) {
    next(error);
  }
}

async function getCryptoHistory(req, res, next) {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Crypto ID is required'
      });
    }
    
    const history = await coinGeckoService.getCryptoHistory(id, parseInt(days));
    
    if (!history || Object.keys(history).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cryptocurrency history not found'
      });
    }
    
    // Format the price data
    const prices = history.prices.map(pricePoint => ({
      timestamp: pricePoint[0],
      price: pricePoint[1]
    }));
    
    // Format the market caps data
    const market_caps = history.market_caps.map(mcPoint => ({
      timestamp: mcPoint[0],
      market_cap: mcPoint[1]
    }));
    
    // Format the total volumes data
    const total_volumes = history.total_volumes.map(volumePoint => ({
      timestamp: volumePoint[0],
      volume: volumePoint[1]
    }));
    
    // Calculate analytics if we have price data
    let analytics = {};
    if (prices.length > 0) {
      const priceValues = prices.map(p => p.price);
      const sma20 = calculateSMA(priceValues, Math.min(20, priceValues.length));
      const ema20 = calculateEMA(priceValues, Math.min(20, priceValues.length));
      const roi = priceValues.length > 0 ? 
        calculateROI(1000, priceValues[priceValues.length - 1], priceValues[0]) : 0;
      
      analytics = {
        sma20,
        ema20,
        roi
      };
    }
    
    res.json({
      success: true,
      data: {
        prices,
        market_caps,
        total_volumes,
        analytics
      }
    });
  } catch (error) {
    next(error);
  }
}

async function searchCryptos(req, res, next) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    
    const results = await coinGeckoService.searchCryptos(query);
    
    const formattedResults = results.map(item => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      market_cap_rank: item.market_cap_rank
    }));
    
    res.json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopCryptos,
  getCryptoDetails,
  getCryptoHistory,
  searchCryptos
};
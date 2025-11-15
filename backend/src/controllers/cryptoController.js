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
    
    // Try to get market data first for more complete information
    let marketData = [];
    try {
      marketData = await coinGeckoService.getCryptoMarketData(cryptoId);
      console.log('Market data fetched, length:', marketData.length);
    } catch (marketError) {
      console.log('Could not fetch market data, falling back to price data only:', marketError.message);
    }
    
    // Get price data
    const priceData = await coinGeckoService.getCryptoPrice(cryptoId);
    console.log('Price data fetched, keys:', Object.keys(priceData).length);
    
    // Check if we got data for the requested crypto
    if ((!priceData || Object.keys(priceData).length === 0) && 
        (!marketData || marketData.length === 0)) {
      return res.status(404).json({
        success: false,
        message: `No data found for cryptocurrency: ${cryptoId}`
      });
    }
    
    // TEMPORARY: Always try to use market data first, then fall back
    console.log('Trying market data approach');
    if (marketData && marketData.length > 0) {
      console.log('Using market data for response');
      const response = {
        symbol: marketData[0].symbol || cryptoId,
        name: marketData[0].name || cryptoId,
        usd: marketData[0].current_price || 0,
        inr: null, // We don't fetch INR in market data
        usd_24h_change: marketData[0].price_change_percentage_24h || 0,
        usd_24h_vol: marketData[0].total_volume || 0,
        usd_market_cap: marketData[0].market_cap || 0,
        lastUpdated: new Date().toISOString()
      };
      
      // If multiple cryptos were requested, include all in the response
      if (marketData.length > 1) {
        response.prices = {};
        marketData.forEach(item => {
          response.prices[item.id] = {
            symbol: item.symbol,
            name: item.name,
            usd: item.current_price,
            usd_24h_change: item.price_change_percentage_24h,
            usd_24h_vol: item.total_volume,
            usd_market_cap: item.market_cap
          };
        });
      }
      
      console.log('Sending market data response');
      return res.json(response);
    }
    
    // Fallback to simple price data if market data is not available
    console.log('Using price data for response');
    const cryptoKeys = Object.keys(priceData);
    const firstCrypto = cryptoKeys[0];
    
    // If multiple cryptos were requested, return the first one
    const cryptoData = priceData[firstCrypto];
    
    const response = {
      symbol: firstCrypto,
      name: firstCrypto, // We don't have the name from simple price endpoint
      usd: cryptoData.usd || null,
      inr: cryptoData.inr || null,
      usd_24h_change: 0, // Not available from simple price endpoint
      usd_24h_vol: 0, // Not available from simple price endpoint
      usd_market_cap: 0, // Not available from simple price endpoint
      lastUpdated: new Date().toISOString()
    };
    
    // If multiple cryptos were requested, include all in the response
    if (cryptoKeys.length > 1) {
      response.prices = {};
      cryptoKeys.forEach(key => {
        response.prices[key] = {
          symbol: key,
          name: key,
          usd: priceData[key].usd || null,
          inr: priceData[key].inr || null,
          usd_24h_change: 0,
          usd_24h_vol: 0,
          usd_market_cap: 0
        };
      });
    }
    
    console.log('Sending price data response');
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

async function getTopCryptos(req, res, next) {
  try {
    console.log('Fetching top cryptocurrencies...');
    // Get top 10 cryptocurrencies by market cap
    const marketData = await coinGeckoService.getCryptoMarketData('', 'usd');
    console.log('Market data fetched, length:', marketData.length);
    
    if (!marketData || marketData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No cryptocurrency data found'
      });
    }
    
    // Return the top 10 cryptocurrencies
    const topCryptos = marketData.slice(0, 10).map(crypto => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      current_price: crypto.current_price,
      price_change_percentage_24h: crypto.price_change_percentage_24h,
      total_volume: crypto.total_volume,
      market_cap: crypto.market_cap,
      image: crypto.image
    }));
    
    res.json({
      success: true,
      data: topCryptos
    });
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 429) {
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
    console.error('Error fetching top cryptocurrencies:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top cryptocurrencies'
    });
  }
}

module.exports = {
  getCryptoPrice,
  getTopCryptos
};
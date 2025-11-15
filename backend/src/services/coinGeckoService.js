const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://api.coingecko.com/api/v3';
const PRICE_ENDPOINT = '/simple/price';
const MARKET_ENDPOINT = '/coins/markets';
const API_KEY = process.env.COINGECKO_API_KEY; // Remove default API key

async function getCryptoPrice(ids, currencies = 'usd,inr') {
  const cacheKey = `crypto_price_${ids}_${currencies}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(BASE_URL + PRICE_ENDPOINT, {
      params: {
        ids: ids,
        vs_currencies: currencies,
        x_cg_demo_api_key: API_KEY
      }
    });
    
    const result = response.data || {};
    // Cache for 60 seconds (1 minute)
    cache.set(cacheKey, result, 60);
    return result;
  } catch (error) {
    console.error('Error fetching crypto price from CoinGecko:', error.message);
    throw error;
  }
}

async function getCryptoMarketData(ids = '', currency = 'usd') {
  const cacheKey = `crypto_market_${ids}_${currency}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const params = {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: false,
      x_cg_demo_api_key: API_KEY
    };
    
    // Only add ids parameter if it's not empty
    if (ids) {
      params.ids = ids;
    }
    
    const response = await axios.get(BASE_URL + MARKET_ENDPOINT, { params });
    
    const result = response.data || [];
    // Cache for 60 seconds (1 minute)
    cache.set(cacheKey, result, 60);
    return result;
  } catch (error) {
    console.error('Error fetching crypto market data from CoinGecko:', error.message);
    throw error;
  }
}

module.exports = {
  getCryptoPrice,
  getCryptoMarketData
};
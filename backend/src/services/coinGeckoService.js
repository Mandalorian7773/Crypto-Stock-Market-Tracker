const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://api.coingecko.com/api/v3';
const PRICE_ENDPOINT = '/simple/price';
const MARKET_ENDPOINT = '/coins/markets';
const API_KEY = process.env.COINGECKO_API_KEY || 'CG-pRDPVpeWdMwCsj7bHkqDeSg3';

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
    throw error;
  }
}

async function getCryptoMarketData(ids, currency = 'usd') {
  const cacheKey = `crypto_market_${ids}_${currency}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(BASE_URL + MARKET_ENDPOINT, {
      params: {
        vs_currency: currency,
        ids: ids,
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
        x_cg_demo_api_key: API_KEY
      }
    });
    
    const result = response.data || [];
    // Cache for 60 seconds (1 minute)
    cache.set(cacheKey, result, 60);
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getCryptoPrice,
  getCryptoMarketData
};
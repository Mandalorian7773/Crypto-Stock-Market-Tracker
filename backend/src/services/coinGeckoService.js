const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const API_KEY = process.env.COINGECKO_API_KEY || 'CG-pRDPVpeWdMwCsj7bHkqDeSg3';

async function getCryptoPrice(ids, currencies = 'usd,inr') {
  const cacheKey = `crypto_price_${ids}_${currencies}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        ids: ids,
        vs_currencies: currencies
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const result = response.data || {};
    // Cache for 60 seconds (1 minute)
    cache.set(cacheKey, result, 60);
    return result;
  } catch (error) {
    // If there's an API key error, try without the header
    if (error.response && error.response.status === 401) {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            ids: ids,
            vs_currencies: currencies
          }
        });
        
        const result = response.data || {};
        // Cache for 60 seconds (1 minute)
        cache.set(cacheKey, result, 60);
        return result;
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}

module.exports = {
  getCryptoPrice
};
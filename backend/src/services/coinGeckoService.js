const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://api.coingecko.com/api/v3';

async function getTopCryptos(limit = 10) {
  const cacheKey = `top_cryptos_${limit}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false
      }
    });
    
    const result = response.data || [];
    cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  } catch (error) {
    console.error('Error fetching top cryptos:', error.message);
    return [];
  }
}

async function getCryptoDetails(id) {
  const cacheKey = `crypto_details_${id}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });
    
    const result = response.data || {};
    cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  } catch (error) {
    console.error(`Error fetching crypto details for ${id}:`, error.message);
    return {};
  }
}

async function getCryptoHistory(id, days = 30) {
  const cacheKey = `crypto_history_${id}_${days}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: 'daily'
      }
    });
    
    const result = response.data || {};
    cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  } catch (error) {
    console.error(`Error fetching crypto history for ${id}:`, error.message);
    return {};
  }
}

async function searchCryptos(query) {
  const cacheKey = `search_crypto_${query}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        query: query
      }
    });
    
    const result = response.data.coins || [];
    cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  } catch (error) {
    console.error(`Error searching cryptos for ${query}:`, error.message);
    return [];
  }
}

module.exports = {
  getTopCryptos,
  getCryptoDetails,
  getCryptoHistory,
  searchCryptos
};
const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

async function searchSymbols(query) {
  const cacheKey = `search_${query}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  const response = await axios.get(BASE_URL, {
    params: {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: API_KEY
    }
  });
  
  const result = response.data.bestMatches || [];
  cache.set(cacheKey, result);
  return result;
}

async function getQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  const response = await axios.get(BASE_URL, {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: symbol,
      apikey: API_KEY
    }
  });
  
  const result = response.data['Global Quote'] || {};
  cache.set(cacheKey, result);
  return result;
}

async function getHistory(symbol) {
  const cacheKey = `history_${symbol}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  const response = await axios.get(BASE_URL, {
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      apikey: API_KEY
    }
  });
  
  const result = response.data['Time Series (Daily)'] || {};
  cache.set(cacheKey, result);
  return result;
}

module.exports = {
  searchSymbols,
  getQuote,
  getHistory
};
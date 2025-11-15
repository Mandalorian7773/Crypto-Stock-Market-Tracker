const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

// Remove mock data - only use real API data now

async function searchSymbols(query) {
  const cacheKey = `search_${query}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: query,
        token: API_KEY
      }
    });
    
    // Check if there's an error
    if (response.data.error) {
      console.log('Finnhub API error:', response.data.error);
      return [];
    }
    
    const result = response.data.result || [];
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error searching symbols:', error.message);
    return [];
  }
}

async function getQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: symbol,
        token: API_KEY
      }
    });
    
    // Log the raw response for debugging
    console.log('Finnhub raw response:', response.data);
    
    // Check if there's an error
    if (response.data.error) {
      console.log('Finnhub API error:', response.data.error);
      throw new Error('API error: ' + response.data.error);
    }
    
    // Check if we have valid data
    if (!response.data || response.data.c === undefined) {
      throw new Error('Invalid API response');
    }
    
    // Format the response to match our expected structure
    const formattedData = {
      symbol: symbol,
      name: symbol, // Finnhub doesn't provide name in quote endpoint
      price: response.data.c,
      change: response.data.d,
      changePercent: response.data.dp,
      dayHigh: response.data.h,
      dayLow: response.data.l,
      open: response.data.o,
      volume: response.data.v
    };
    
    cache.set(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching quote from Finnhub:', error.message);
    throw error;
  }
}

async function getHistory(symbol) {
  const cacheKey = `history_${symbol}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Get data for the last 30 days
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60); // 30 days ago
    
    const response = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol,
        resolution: 'D',
        from: from,
        to: to,
        token: API_KEY
      }
    });
    
    // Check if there's an error
    if (response.data.error) {
      console.log('Finnhub API error:', response.data.error);
      throw new Error('API error: ' + response.data.error);
    }
    
    // Check if we have valid data
    if (!response.data || response.data.s === 'no_data') {
      throw new Error('No data available for this symbol');
    }
    
    // Format the response to match our expected structure
    const result = {};
    if (response.data.t && response.data.c) {
      for (let i = 0; i < response.data.t.length; i++) {
        const date = new Date(response.data.t[i] * 1000).toISOString().split('T')[0];
        result[date] = {
          '4. close': response.data.c[i]
        };
      }
    }
    
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching history from Finnhub:', error.message);
    throw error;
  }
}

module.exports = {
  searchSymbols,
  getQuote,
  getHistory
};
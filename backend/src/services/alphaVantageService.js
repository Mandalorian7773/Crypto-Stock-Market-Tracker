const axios = require('axios');
const cache = require('../utils/cache');

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

// Mock data for when API is not available
const mockStockData = {
  'AAPL': {
    '01. symbol': 'AAPL',
    '02. open': '150.00',
    '03. high': '155.00',
    '04. low': '149.00',
    '05. price': '153.25',
    '06. volume': '1000000',
    '09. change': '3.25',
    '10. change percent': '2.12%'
  },
  'MSFT': {
    '01. symbol': 'MSFT',
    '02. open': '300.00',
    '03. high': '305.00',
    '04. low': '299.00',
    '05. price': '302.50',
    '06. volume': '800000',
    '09. change': '2.50',
    '10. change percent': '0.83%'
  },
  'GOOGL': {
    '01. symbol': 'GOOGL',
    '02. open': '2500.00',
    '03. high': '2550.00',
    '04. low': '2490.00',
    '05. price': '2525.75',
    '06. volume': '500000',
    '09. change': '25.75',
    '10. change percent': '1.03%'
  },
  'AMZN': {
    '01. symbol': 'AMZN',
    '02. open': '3200.00',
    '03. high': '3250.00',
    '04. low': '3190.00',
    '05. price': '3225.50',
    '06. volume': '600000',
    '09. change': '25.50',
    '10. change percent': '0.79%'
  },
  'TSLA': {
    '01. symbol': 'TSLA',
    '02. open': '800.00',
    '03. high': '820.00',
    '04. low': '795.00',
    '05. price': '810.25',
    '06. volume': '1200000',
    '09. change': '10.25',
    '10. change percent': '1.28%'
  },
  'NVDA': {
    '01. symbol': 'NVDA',
    '02. open': '500.00',
    '03. high': '510.00',
    '04. low': '495.00',
    '05. price': '505.75',
    '06. volume': '900000',
    '09. change': '5.75',
    '10. change percent': '1.15%'
  }
};

async function searchSymbols(query) {
  const cacheKey = `search_${query}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: API_KEY
      }
    });
    
    // Check if there's an error or information message
    if (response.data['Error Message'] || response.data['Information']) {
      // Return empty array if API fails
      return [];
    }
    
    const result = response.data.bestMatches || [];
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error searching symbols:', error.message);
    // Return empty array if API fails
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
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY
      }
    });
    
    // Log the raw response for debugging
    console.log('Alpha Vantage raw response:', response.data);
    
    // Check if there's an error or information message
    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }
    
    if (response.data['Information']) {
      throw new Error(response.data['Information']);
    }
    
    const result = response.data['Global Quote'] || {};
    
    // If we got empty data, return mock data
    if (!result || Object.keys(result).length === 0) {
      console.log('Using mock data for symbol:', symbol);
      return mockStockData[symbol] || mockStockData['AAPL']; // fallback to AAPL if symbol not found
    }
    
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching quote from Alpha Vantage:', error.message);
    // Return mock data when API fails
    console.log('Using mock data for symbol:', symbol);
    return mockStockData[symbol] || mockStockData['AAPL']; // fallback to AAPL if symbol not found
  }
}

async function getHistory(symbol) {
  const cacheKey = `history_${symbol}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY
      }
    });
    
    // Check if there's an error or information message
    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }
    
    if (response.data['Information']) {
      throw new Error(response.data['Information']);
    }
    
    const result = response.data['Time Series (Daily)'] || {};
    
    // If we got empty data, return empty object
    if (!result || Object.keys(result).length === 0) {
      return {};
    }
    
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching history from Alpha Vantage:', error.message);
    // Return empty object when API fails
    return {};
  }
}

module.exports = {
  searchSymbols,
  getQuote,
  getHistory
};
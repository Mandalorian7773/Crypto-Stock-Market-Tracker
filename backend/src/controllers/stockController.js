const alphaVantageService = require('../services/alphaVantageService');
const { calculateSMA, calculateEMA, calculateROI } = require('../utils/analytics');

async function searchStocks(req, res, next) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    
    const results = await alphaVantageService.searchSymbols(query);
    
    const formattedResults = results.map(item => ({
      symbol: item['1. symbol'],
      name: item['2. name'],
      type: item['3. type'],
      region: item['4. region'],
      currency: item['8. currency']
    }));
    
    res.json({
      success: true,
      data: formattedResults
    });
  } catch (error) {
    next(error);
  }
}

async function getStockQuote(req, res, next) {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
      });
    }
    
    const quote = await alphaVantageService.getQuote(symbol);
    
    // Log the quote response for debugging
    console.log('Alpha Vantage response for', symbol, ':', quote);
    
    // Check for API errors in the response
    if (quote['Error Message']) {
      return res.status(400).json({
        success: false,
        message: quote['Error Message']
      });
    }
    
    if (quote['Information']) {
      return res.status(400).json({
        success: false,
        message: quote['Information']
      });
    }
    
    // Check if we have valid quote data (either from API or mock)
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const formattedQuote = {
      symbol: quote['01. symbol'],
      name: quote['01. symbol'], // Add name field for consistency
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'] ? quote['10. change percent'].replace('%', '') : '0'
    };
    
    res.json({
      success: true,
      data: formattedQuote
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    next(error);
  }
}

async function getStockHistory(req, res, next) {
  try {
    const { symbol } = req.params;
    const { range } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
      });
    }
    
    const history = await alphaVantageService.getHistory(symbol);
    
    if (!history || Object.keys(history).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock history not found'
      });
    }
    
    // Convert history object to array
    const historyArray = Object.entries(history).map(([date, values]) => ({
      date,
      price: parseFloat(values['4. close'])
    }));
    
    // Apply range filtering
    let filteredHistory = [];
    switch (range) {
      case '1d':
        filteredHistory = historyArray.slice(0, 2);
        break;
      case '7d':
        filteredHistory = historyArray.slice(0, 7);
        break;
      case '30d':
        filteredHistory = historyArray.slice(0, 30);
        break;
      case '365d':
        filteredHistory = historyArray.slice(0, 365);
        break;
      default:
        filteredHistory = historyArray.slice(0, 30);
    }
    
    // Calculate analytics
    const prices = filteredHistory.map(item => item.price);
    const sma20 = calculateSMA(prices, Math.min(20, prices.length));
    const ema20 = calculateEMA(prices, Math.min(20, prices.length));
    const roi = prices.length > 0 ? calculateROI(1000, prices[prices.length - 1], prices[0]) : 0;
    
    res.json({
      success: true,
      data: {
        history: filteredHistory,
        analytics: {
          sma20,
          ema20,
          roi
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchStocks,
  getStockQuote,
  getStockHistory
};
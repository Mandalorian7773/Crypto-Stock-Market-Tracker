require('dotenv').config();
const coinGeckoService = require('./src/services/coinGeckoService');

async function test() {
  try {
    console.log('Testing CoinGecko Service...');
    console.log('API Key:', process.env.COINGECKO_API_KEY ? 'Loaded' : 'Not loaded');
    
    // Test crypto price
    console.log('Getting price for bitcoin...');
    const price = await coinGeckoService.getCryptoPrice('bitcoin');
    console.log('Price data:', JSON.stringify(price, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

test();
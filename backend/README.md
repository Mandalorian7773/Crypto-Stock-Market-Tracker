# Backend Setup

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```
FINNHUB_API_KEY=your_finnhub_api_key_here
COINGECKO_API_KEY=your_coingecko_api_key_here
```

## API Key Sources

1. **Finnhub API Key**: 
   - Get your free API key at [https://finnhub.io/dashboard](https://finnhub.io/dashboard)

2. **CoinGecko API Key**:
   - Get your free API key at [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)

## Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The server will run on port 5001 by default.
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add CORS middleware
const stockRoutes = require('./src/routes/stockRoutes');
const cryptoRoutes = require('./src/routes/cryptoRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();

// Add CORS middleware to allow requests from the frontend
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://localhost:8082', 
    'http://localhost:8083', 
    'http://localhost:8084', 
    'http://localhost:8085', 
    'http://localhost:8086', 
    'http://localhost:8087', 
    'http://localhost:8088',
    'https://crypto-stock-market-tracker.vercel.app' // Add Vercel frontend URL
  ], // Allow all frontend ports and Vercel deployment
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use('/api/crypto', cryptoRoutes);

app.use(errorHandler);

module.exports = app;
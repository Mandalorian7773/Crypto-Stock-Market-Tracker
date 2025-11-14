require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add CORS middleware
const stockRoutes = require('./src/routes/stockRoutes');
const cryptoRoutes = require('./src/routes/cryptoRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();

// Add CORS middleware to allow requests from all origins
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use('/api/crypto', cryptoRoutes);

app.use(errorHandler);

module.exports = app;
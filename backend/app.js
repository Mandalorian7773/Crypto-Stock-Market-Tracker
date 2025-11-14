require('dotenv').config();
const express = require('express');
const stockRoutes = require('./src/routes/stockRoutes');
const cryptoRoutes = require('./src/routes/cryptoRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/stocks', stockRoutes);
app.use('/api/crypto', cryptoRoutes);

app.use(errorHandler);

module.exports = app;
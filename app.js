require('dotenv').config();
const express = require('express');
const stockRoutes = require('./src/routes/stockRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/stocks', stockRoutes);

app.use(errorHandler);

module.exports = app;
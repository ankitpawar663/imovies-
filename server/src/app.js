const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'test' ? 1000 : 50 }), require('./routes/auth'));
app.use('/api', require('./routes/catalog'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});
module.exports = app;

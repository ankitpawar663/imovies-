require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is not set (see .env.example)'); process.exit(1); }
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('IMovies API on port ' + (process.env.PORT || 5000))))
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });

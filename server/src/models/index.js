const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m, required: true });

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }));

const Movie = mongoose.model('Movie', new Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, default: '' },
  genre: [String], language: { type: String, default: 'English' },
  duration: { type: Number, required: true, min: 1 }, rating: { type: Number, min: 0, max: 10, default: 0 },
  releaseDate: Date, posterUrl: String, backdropUrl: String, trailerUrl: String,
  cast: [String], director: String,
  status: { type: String, enum: ['nowShowing', 'comingSoon'], default: 'nowShowing' },
}, { timestamps: true }));

const Cinema = mongoose.model('Cinema', new Schema({
  name: { type: String, required: true }, location: { type: String, required: true }, address: String,
  screens: [{ name: String, rows: { type: Number, min: 1, max: 26 }, seatsPerRow: { type: Number, min: 1, max: 30 } }],
}, { timestamps: true }));

const showSchema = new Schema({
  movieId: ref('Movie'), cinemaId: ref('Cinema'), screenName: { type: String, required: true },
  rows: { type: Number, required: true }, seatsPerRow: { type: Number, required: true },
  showDate: { type: Date, required: true }, ticketPrice: { type: Number, required: true, min: 0 },
  bookedSeats: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true });
showSchema.index({ movieId: 1, showDate: 1 });
const Show = mongoose.model('Show', showSchema);

const Booking = mongoose.model('Booking', new Schema({
  bookingReference: { type: String, required: true, unique: true },
  userId: { ...ref('User'), index: true }, showId: ref('Show'),
  selectedSeats: [String], fee: Number, totalAmount: Number,
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true }));

module.exports = { User, Movie, Cinema, Show, Booking };

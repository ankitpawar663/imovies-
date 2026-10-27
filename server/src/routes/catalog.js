const router = require('express').Router();
const mongoose = require('mongoose');
const { Movie, Cinema, Show } = require('../models');
const { validId, fail } = require('../middleware/auth');
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/movies', async (req, res, next) => {
  try {
    const { q, genre, language, status, sort } = req.query, f = {};
    if (q) f.title = new RegExp(esc(q), 'i');
    if (genre) f.genre = String(genre);
    if (language) f.language = String(language);
    if (['nowShowing', 'comingSoon'].includes(status)) f.status = status;
    const s = { rating: { rating: -1 }, newest: { releaseDate: -1 }, title: { title: 1 } }[sort] || { releaseDate: -1 };
    res.json({ success: true, message: 'Movies retrieved successfully', data: await Movie.find(f).sort(s) });
  } catch (e) { next(e); }
});
router.get('/movies/:id', validId(), async (req, res, next) => {
  try { const m = await Movie.findById(req.params.id); if (!m) return fail(res, 404, 'Movie not found'); res.json({ success: true, data: m }); } catch (e) { next(e); }
});
router.get('/cinemas', async (req, res, next) => { try { res.json({ success: true, data: await Cinema.find() }); } catch (e) { next(e); } });
router.get('/shows', async (req, res, next) => {
  try {
    const f = { status: 'active', showDate: { $gte: new Date() } };
    if (req.query.movieId) { if (!mongoose.isValidObjectId(req.query.movieId)) return fail(res, 400, 'Invalid movieId'); f.movieId = req.query.movieId; }
    if (req.query.date) { const d = new Date(req.query.date + 'T00:00:00'); if (isNaN(d)) return fail(res, 400, 'Invalid date'); f.showDate = { $gte: new Date(Math.max(d, Date.now())), $lt: new Date(+d + 864e5) }; }
    const shows = await Show.find(f).sort('showDate').populate('cinemaId', 'name location').lean();
    res.json({ success: true, data: shows.map((s) => ({ ...s, availableSeats: s.rows * s.seatsPerRow - s.bookedSeats.length })) });
  } catch (e) { next(e); }
});
router.get('/shows/:id', validId(), async (req, res, next) => {
  try {
    const s = await Show.findById(req.params.id).populate('movieId', 'title posterUrl').populate('cinemaId', 'name location');
    if (!s) return fail(res, 404, 'Show not found'); res.json({ success: true, data: s });
  } catch (e) { next(e); }
});
module.exports = router;

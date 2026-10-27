const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { Show, Booking } = require('../models');
const { protect, fail } = require('../middleware/auth');
const FEE_PER_TICKET = 20; // demo convenience fee
const populate = (q) => q.populate({ path: 'showId', populate: [{ path: 'movieId', select: 'title posterUrl' }, { path: 'cinemaId', select: 'name location' }] });

router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    if (!mongoose.isValidObjectId(showId)) return fail(res, 400, 'Invalid showId');
    if (!Array.isArray(seats) || !seats.length || seats.length > 8 || new Set(seats).size !== seats.length) return fail(res, 400, 'Select 1 to 8 distinct seats');
    const show = await Show.findById(showId);
    if (!show || show.status !== 'active') return fail(res, 404, 'Show not found');
    if (show.showDate < new Date()) return fail(res, 409, 'This show has already started');
    for (const s of seats) {
      const m = typeof s === 'string' && /^([A-Z])([0-9]{1,2})$/.exec(s);
      if (!m || m[1].charCodeAt(0) - 64 > show.rows || +m[2] < 1 || +m[2] > show.seatsPerRow) return fail(res, 400, `Invalid seat ${s}`);
    }
    // Atomic conditional update: succeeds only if NONE of the seats is already booked.
    const r = await Show.updateOne({ _id: show._id, status: 'active', bookedSeats: { $nin: seats } }, { $push: { bookedSeats: { $each: seats } } });
    if (!r.modifiedCount) return fail(res, 409, 'One or more seats were just booked by someone else. Please pick other seats.');
    try {
      const fee = seats.length * FEE_PER_TICKET;
      const b = await Booking.create({ bookingReference: 'IM' + crypto.randomBytes(4).toString('hex').toUpperCase(), userId: req.user._id, showId: show._id, selectedSeats: seats, fee, totalAmount: seats.length * show.ticketPrice + fee });
      res.status(201).json({ success: true, message: 'Demo booking confirmed (no real payment taken)', data: b });
    } catch (e) { await Show.updateOne({ _id: show._id }, { $pull: { bookedSeats: { $in: seats } } }); throw e; } // roll back on failure
  } catch (e) { next(e); }
});
router.get('/mine', async (req, res, next) => {
  try { res.json({ success: true, data: await populate(Booking.find({ userId: req.user._id }).sort('-createdAt')) }); } catch (e) { next(e); }
});
router.get('/:ref', async (req, res, next) => {
  try {
    const b = await populate(Booking.findOne({ bookingReference: String(req.params.ref) }));
    if (!b || (String(b.userId) !== String(req.user._id) && req.user.role !== 'admin')) return fail(res, 404, 'Booking not found');
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});
router.post('/:ref/cancel', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ bookingReference: String(req.params.ref), userId: req.user._id });
    if (!b) return fail(res, 404, 'Booking not found');
    const show = await Show.findById(b.showId);
    if (b.status === 'cancelled') return fail(res, 409, 'Already cancelled');
    if (show.showDate - Date.now() < 2 * 3600e3) return fail(res, 409, 'Bookings can only be cancelled up to 2 hours before the show');
    const u = await Booking.updateOne({ _id: b._id, status: 'confirmed' }, { status: 'cancelled' });
    if (u.modifiedCount) await Show.updateOne({ _id: show._id }, { $pull: { bookedSeats: { $in: b.selectedSeats } } });
    res.json({ success: true, message: 'Booking cancelled, seats released' });
  } catch (e) { next(e); }
});
module.exports = router;

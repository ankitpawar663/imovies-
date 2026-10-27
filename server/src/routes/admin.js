const router = require('express').Router();
const { User, Movie, Cinema, Show, Booking } = require('../models');
const { protect, adminOnly, validId, fail } = require('../middleware/auth');
router.use(protect, adminOnly);

router.get('/stats', async (req, res, next) => {
  try {
    const [users, movies, shows, bookings] = await Promise.all([User.countDocuments(), Movie.countDocuments(), Show.countDocuments(), Booking.countDocuments({ status: 'confirmed' })]);
    res.json({ success: true, data: { users, movies, shows, bookings } });
  } catch (e) { next(e); }
});
router.get('/bookings', async (req, res, next) => {
  try { res.json({ success: true, data: await Booking.find().sort('-createdAt').limit(200).populate('userId', 'name email').populate({ path: 'showId', populate: { path: 'movieId', select: 'title' } }) }); } catch (e) { next(e); }
});
router.get('/users', async (req, res, next) => { try { res.json({ success: true, data: await User.find().sort('-createdAt') }); } catch (e) { next(e); } });

const crud = (path, Model, protectedFields = []) => {
  const clean = (b) => { const o = { ...b }; ['_id', '__v', 'createdAt', 'updatedAt', ...protectedFields].forEach((k) => delete o[k]); return o; };
  const bad = (e, res, next) => (e.name === 'ValidationError' ? fail(res, 400, e.message) : next(e));
  router.post('/' + path, async (req, res, next) => { try { res.status(201).json({ success: true, data: await Model.create(clean(req.body)) }); } catch (e) { bad(e, res, next); } });
  router.put('/' + path + '/:id', validId(), async (req, res, next) => {
    try { const d = await Model.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true }); d ? res.json({ success: true, data: d }) : fail(res, 404, 'Not found'); } catch (e) { bad(e, res, next); }
  });
  router.delete('/' + path + '/:id', validId(), async (req, res, next) => {
    try { const d = await Model.findByIdAndDelete(req.params.id); d ? res.json({ success: true, message: 'Deleted' }) : fail(res, 404, 'Not found'); } catch (e) { next(e); }
  });
};
crud('movies', Movie); crud('cinemas', Cinema); crud('shows', Show, ['bookedSeats']);
module.exports = router;

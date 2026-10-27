const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect, fail } = require('../middleware/auth');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const str = (v) => (typeof v === 'string' ? v.trim() : '');

router.post('/register', async (req, res, next) => {
  try {
    const name = str(req.body.name), email = str(req.body.email).toLowerCase(), password = str(req.body.password);
    if (!name || !emailRe.test(email) || password.length < 8) return fail(res, 400, 'Name, valid email and a password of 8+ characters are required');
    if (await User.findOne({ email })) return fail(res, 409, 'Email already registered');
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) }); // role is never taken from the client
    res.status(201).json({ success: true, message: 'Registered', data: { token: sign(user), user: pub(user) } });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: str(req.body.email).toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(str(req.body.password), user.passwordHash))) return fail(res, 401, 'Invalid email or password');
    res.json({ success: true, message: 'Logged in', data: { token: sign(user), user: pub(user) } });
  } catch (e) { next(e); }
});
router.get('/me', protect, (req, res) => res.json({ success: true, data: pub(req.user) }));
router.put('/me', protect, async (req, res, next) => {
  try {
    const name = str(req.body.name); if (name) req.user.name = name;
    const np = str(req.body.newPassword);
    if (np) {
      const u = await User.findById(req.user._id).select('+passwordHash');
      if (np.length < 8 || !(await bcrypt.compare(str(req.body.currentPassword), u.passwordHash))) return fail(res, 400, 'Current password wrong or new password too short');
      req.user.passwordHash = await bcrypt.hash(np, 10);
    }
    await req.user.save(); res.json({ success: true, message: 'Profile updated', data: pub(req.user) });
  } catch (e) { next(e); }
});
module.exports = router;

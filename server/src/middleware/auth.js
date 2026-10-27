const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../models');
const fail = (res, code, message) => res.status(code).json({ success: false, message });

exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return fail(res, 401, 'Authentication required');
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return fail(res, 401, 'User no longer exists');
    req.user = user; next();
  } catch { fail(res, 401, 'Invalid or expired token'); }
};
exports.adminOnly = (req, res, next) => (req.user && req.user.role === 'admin' ? next() : fail(res, 403, 'Administrator access required'));
exports.validId = (name = 'id') => (req, res, next) => (mongoose.isValidObjectId(req.params[name]) ? next() : fail(res, 400, 'Invalid id'));
exports.fail = fail;

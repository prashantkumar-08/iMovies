const jwt = require('jsonwebtoken');
const { User } = require('../models');
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.protect = exports.wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please log in' });
  try { req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id); } catch { return res.status(401).json({ message: 'Session expired' }); }
  if (!req.user) return res.status(401).json({ message: 'User not found' });
  next();
});
exports.adminOnly = (req, res, next) => (req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' }));
exports.errorHandler = (err, req, res, next) => {
  console.error(err.message);
  const code = err.code === 11000 ? 409 : err.name === 'ValidationError' || err.name === 'CastError' ? 400 : err.status || 500;
  res.status(code).json({ message: err.code === 11000 ? 'Already exists' : err.message });
};

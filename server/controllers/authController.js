const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User } = require('../models'), { wrap } = require('../middleware/auth');
const sign = (u) => ({ token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: { id: u._id, name: u.name, email: u.email, role: u.role } });
exports.register = wrap(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a 6+ character password are required' });
  const u = await User.create({ name, email, phone, password: await bcrypt.hash(password, 10) });
  res.status(201).json(sign(u));
});
exports.login = wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Wrong email or password' });
  if (req.body.role && req.body.role !== u.role) return res.status(403).json({ message: u.role === 'admin' ? 'This is an admin account. Use Admin login.' : 'This is not an admin account. Use User login.' });
  res.json(sign(u));
});
exports.me = (req, res) => res.json(req.user);

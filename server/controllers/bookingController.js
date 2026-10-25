const { Show, Seat, Booking, Payment, Notification, User } = require('../models'), { wrap } = require('../middleware/auth');
const LOCK_MS = 5 * 60 * 1000;
const push = (req, show, labels, status) => req.app.get('io').to(String(show)).emit('seats', { labels, status });
const free = { status: 'available', $unset: { lockedBy: 1, lockExpires: 1 } };
const release = async (req, b) => { await Seat.updateMany({ show: b.show, label: { $in: b.seats }, lockedBy: b.user, status: 'locked' }, free); push(req, b.show, b.seats, 'available'); };
// Atomically lock seats (expired locks count as free) and create a pending booking
exports.create = wrap(async (req, res) => {
  const { showId, seats } = req.body;
  if (!Array.isArray(seats) || !seats.length || seats.length > 8) return res.status(400).json({ message: 'Choose 1 to 8 seats' });
  const show = await Show.findById(showId);
  if (!show || show.startsAt < new Date()) return res.status(400).json({ message: 'This show is no longer available' });
  const now = new Date(), expires = new Date(+now + LOCK_MS);
  const r = await Seat.updateMany({ show: showId, label: { $in: seats }, $or: [{ status: 'available' }, { status: 'locked', lockExpires: { $lt: now } }] }, { status: 'locked', lockedBy: req.user._id, lockExpires: expires });
  if (r.modifiedCount !== seats.length) {
    await Seat.updateMany({ show: showId, label: { $in: seats }, lockedBy: req.user._id, status: 'locked' }, free);
    return res.status(409).json({ message: 'Some seats were just taken. Pick different seats.' });
  }
  push(req, showId, seats, 'locked');
  const b = await Booking.create({ user: req.user._id, show: showId, seats, amount: seats.length * show.price });
  res.status(201).json({ booking: b, lockExpires: expires });
});
exports.pay = wrap(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!b || b.status !== 'pending') return res.status(400).json({ message: 'Booking cannot be paid' });
  const held = await Seat.countDocuments({ show: b.show, label: { $in: b.seats }, lockedBy: req.user._id, status: 'locked', lockExpires: { $gt: new Date() } });
  if (held !== b.seats.length) { b.status = 'cancelled'; await b.save(); await release(req, b); return res.status(410).json({ message: 'Seat hold expired. Please start again.' }); }
  // ---- Payment gateway (simulated). Replace with Razorpay/Stripe order + signature verification. ----
  const ok = req.body.method !== 'fail';
  const p = await Payment.create({ booking: b._id, amount: b.amount, method: req.body.method || 'card', status: ok ? 'success' : 'failed', transactionId: 'TXN' + Date.now() });
  // ------------------------------------------------------------------------------------------------
  if (!ok) return res.status(402).json({ message: 'Payment failed. Try again or use another method.' });
  await Seat.updateMany({ show: b.show, label: { $in: b.seats } }, { status: 'booked', $unset: { lockExpires: 1 } });
  b.status = 'confirmed'; await b.save();
  push(req, b.show, b.seats, 'booked');
  await Notification.create({ user: req.user._id, message: `Booking confirmed: seats ${b.seats.join(', ')}. Ref ${p.transactionId}` });
  res.json({ booking: b, payment: p });
});
exports.mine = wrap(async (req, res) => res.json(await Booking.find({ user: req.user._id }).populate({ path: 'show', populate: { path: 'movie theatre' } }).sort('-createdAt')));
exports.cancel = wrap(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('show');
  if (!b || b.status === 'cancelled') return res.status(400).json({ message: 'Nothing to cancel' });
  if (b.show.startsAt < new Date()) return res.status(400).json({ message: 'Show already started' });
  const wasPaid = b.status === 'confirmed';
  b.status = 'cancelled'; await b.save();
  await Seat.updateMany({ show: b.show._id, label: { $in: b.seats } }, free);
  push(req, b.show._id, b.seats, 'available');
  res.json({ booking: b, refund: wasPaid ? b.amount : 0 });
});
exports.all = wrap(async (req, res) => res.json(await Booking.find().populate('user', 'name email').populate({ path: 'show', populate: [{ path: 'movie' }, { path: 'theatre' }] }).sort('-createdAt').limit(200)));
exports.stats = wrap(async (req, res) => {
  const [users, bookings, rev] = await Promise.all([User.countDocuments(), Booking.countDocuments({ status: 'confirmed' }), Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])]);
  res.json({ users, bookings, revenue: rev[0]?.total || 0 });
});

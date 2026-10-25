const { Theatre, Show, Seat } = require('../models'), { wrap } = require('../middleware/auth');
exports.theatres = wrap(async (req, res) => res.json(await Theatre.find(req.query.city ? { city: req.query.city } : {})));
exports.createTheatre = wrap(async (req, res) => res.status(201).json(await Theatre.create(req.body)));
exports.forMovie = wrap(async (req, res) => {
  const f = { movie: req.params.movieId, startsAt: { $gte: new Date() } };
  if (req.query.date) { const d = new Date(req.query.date); f.startsAt = { $gte: d, $lt: new Date(+d + 864e5) }; }
  let shows = await Show.find(f).populate('theatre').sort('startsAt');
  if (req.query.city) shows = shows.filter((s) => s.theatre.city === req.query.city);
  res.json(shows);
});
exports.create = wrap(async (req, res) => {
  const show = await Show.create(req.body);
  const seats = 'ABCDEFGH'.split('').flatMap((r) => Array.from({ length: 10 }, (_, i) => ({ show: show._id, label: `${r}${i + 1}` })));
  await Seat.insertMany(seats);
  res.status(201).json(show);
});
exports.remove = wrap(async (req, res) => { await Promise.all([Show.findByIdAndDelete(req.params.id), Seat.deleteMany({ show: req.params.id })]); res.json({ ok: true }); });
exports.seats = wrap(async (req, res) => {
  const [show, seats] = await Promise.all([Show.findById(req.params.id).populate('movie theatre'), Seat.find({ show: req.params.id }).sort('label')]);
  if (!show) return res.status(404).json({ message: 'Show not found' });
  const now = new Date(), me = String(req.user._id);
  res.json({ show, seats: seats.map((s) => { const live = s.status === 'locked' && s.lockExpires > now; return { label: s.label, status: s.status === 'locked' && !live ? 'available' : s.status, mine: live && String(s.lockedBy) === me }; }) });
});

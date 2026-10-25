const { Movie, Favorite, Show, Theatre } = require('../models'), { wrap } = require('../middleware/auth');
exports.list = wrap(async (req, res) => {
  const { q, genre, language, ageRating, city, page = 1, limit = 12 } = req.query, f = {};
  if (ageRating) f.ageRating = ageRating;
  if (city) { const ids = await Theatre.find({ city }).distinct('_id'); f._id = { $in: await Show.find({ theatre: { $in: ids }, startsAt: { $gte: new Date() } }).distinct('movie') }; }
  if (q) f.title = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (genre) f.genre = genre;
  if (language) f.language = language;
  const [items, total] = await Promise.all([Movie.find(f).sort('-releaseDate').skip((page - 1) * limit).limit(+limit), Movie.countDocuments(f)]);
  res.json({ items, total, pages: Math.ceil(total / limit) });
});
exports.get = wrap(async (req, res) => { const m = await Movie.findById(req.params.id); m ? res.json(m) : res.status(404).json({ message: 'Movie not found' }); });
exports.create = wrap(async (req, res) => res.status(201).json(await Movie.create(req.body)));
exports.update = wrap(async (req, res) => res.json(await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
exports.remove = wrap(async (req, res) => { await Movie.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
exports.favorites = wrap(async (req, res) => res.json((await Favorite.find({ user: req.user._id }).populate('movie')).map((f) => f.movie)));
exports.toggleFavorite = wrap(async (req, res) => {
  const k = { user: req.user._id, movie: req.params.id };
  const had = await Favorite.findOneAndDelete(k);
  if (!had) await Favorite.create(k);
  res.json({ favorite: !had });
});

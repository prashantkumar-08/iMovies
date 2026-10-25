import { AgeBadge } from '../common/Icons.jsx';

export function Hero({ movie, children }) {
  return (
    <div
      className="hero"
      style={movie.cover ? { backgroundImage: `url("${movie.cover}")` } : {}}
    >
      <div className="heroin">
        <div
          className="thumb"
          style={movie.poster ? { backgroundImage: `url("${movie.poster}")` } : {}}
        >
          {!movie.poster && movie.title}
        </div>

        <div>
          <h1>{movie.title}</h1>
          <p>
            <AgeBadge r={movie.ageRating} /> {movie.genre?.join(', ')} · {movie.language} ·{' '}
            {movie.duration} min · IMDb {movie.imdbRating ?? movie.rating ?? '—'}/10
          </p>

          {movie.ageRating === 'A' && (
            <p>
              <b>Adults only (18+). ID may be checked at the venue.</b>
            </p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

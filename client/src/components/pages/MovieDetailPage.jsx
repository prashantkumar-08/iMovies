import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, err } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';
import { AgeBadge } from '../common/Icons.jsx';
import { Hero } from '../layout/Hero.jsx';

function formatShowTime(value) {
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MovieDetailPage() {
  const { id } = useParams();
  const { user, city, notify } = useApp();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    api.get('/movies/' + id).then((response) => setMovie(response.data));
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    api.get(`/movies/${id}/shows`, { params: { city } }).then((response) => setShows(response.data));
  }, [city, id]);

  useEffect(() => {
    if (!user || !id) {
      return;
    }

    api.get('/favorites').then((response) => {
      setIsFavorite(response.data.some((favoriteItem) => favoriteItem._id === id));
    });
  }, [id, user]);

  if (!movie) {
    return <p>Loading…</p>;
  }

  const byTheatre = shows.reduce((accumulator, show) => {
    const theatreKey = `${show.theatre.name} (${show.theatre.city})`;
    if (!accumulator[theatreKey]) {
      accumulator[theatreKey] = [];
    }

    accumulator[theatreKey].push(show);
    return accumulator;
  }, {});

  const toggleFavorite = async () => {
    try {
      const response = await api.post('/favorites/' + id);
      setIsFavorite(response.data.favorite);
    } catch (error) {
      notify(err(error), true);
    }
  };

  return (
    <>
      <Hero movie={movie}>
        {user && (
          <button className="ghost" style={{ color: '#fff' }} onClick={toggleFavorite}>
            {isFavorite ? 'Remove from watchlist' : 'Add to watchlist'}
          </button>
        )}
      </Hero>

      <h2 style={{ marginTop: 28 }}>About the movie</h2>
      <p style={{ maxWidth: '70ch' }}>{movie.description || 'No description yet.'}</p>

      {movie.cast?.length > 0 && (
        <>
          <h2>Cast</h2>
          <div className="chips">
            {movie.cast.map((actor) => (
              <span key={actor}>{actor}</span>
            ))}
          </div>
        </>
      )}

      {(movie.director || movie.crew?.length > 0) && (
        <>
          <h2 style={{ marginTop: 20 }}>Crew</h2>
          <div className="chips">
            {movie.director && <span>{movie.director} <small>Director</small></span>}
            {movie.crew?.map((person) => (
              <span key={person.name + person.role}>
                {person.name} <small>{person.role}</small>
              </span>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: 28 }}>Pick a show</h2>

      {!shows.length && (
        <p>
          No upcoming shows{city ? ` in ${city}` : ''}. Try another location from the menu at the
          top.
        </p>
      )}

      {Object.entries(byTheatre).map(([theatreName, theatreShows]) => (
        <div className="panel" key={theatreName}>
          <h3>{theatreName}</h3>
          <div className="shows">
            {theatreShows.map((show) => (
              <Link key={show._id} className="btn" to={'/shows/' + show._id}>
                {formatShowTime(show.startsAt)} · ₹{show.price}
              </Link>
            ))}
          </div>
        </div>
      ))}

    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';
import { AgeBadge, SearchIcon } from '../common/Icons.jsx';

const AGES = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A'];

export function HomePage() {
  const { city, user, notify } = useApp();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [adminTab, setAdminTab] = useState('listings');

  const [filters, setFilters] = useState({
    q: '',
    genre: '',
    language: '',
    ageRating: '',
    page: 1,
  });
  const [moviesData, setMoviesData] = useState({ items: [], pages: 1 });

  useEffect(() => {
    if (location.search.includes('search')) {
      searchInputRef.current?.focus();
    }
  }, [location.key, location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {
        ...filters,
        limit: isAdmin && adminTab === 'listings' ? 100 : 12,
      };

      if (city && !(isAdmin && adminTab === 'listings')) {
        params.city = city;
      }

      api
        .get('/movies', { params })
        .then((response) => setMoviesData(response.data));
    }, 250);

    return () => clearTimeout(timer);
  }, [adminTab, city, filters, isAdmin]);

  const updateFilter = (key) => (event) => {
    setFilters((previous) => ({
      ...previous,
      [key]: event.target.value,
      page: 1,
    }));
  };

  const deleteListing = async (movie) => {
    if (!window.confirm(`Delete the listing for "${movie.title}"?`)) return;

    try {
      await api.delete('/movies/' + movie._id);
      setMoviesData((previous) => ({
        ...previous,
        items: previous.items.filter((item) => item._id !== movie._id),
        total: Math.max(0, previous.total - 1),
      }));
      notify('Movie listing deleted');
    } catch (error) {
      notify(error.response?.data?.message || error.message, true);
    }
  };

  const showAdminListings = isAdmin && adminTab === 'listings';

  return (
    <>
      {isAdmin && (
        <div className="admin-home-tabs" role="group" aria-label="Movie listings view">
          <button
            type="button"
            aria-pressed={adminTab === 'listings'}
            className={adminTab === 'listings' ? 'is-active' : 'ghost'}
            onClick={() => {
              setAdminTab('listings');
              setFilters((previous) => ({ ...previous, page: 1 }));
            }}
          >
            All listings
          </button>
          <button
            type="button"
            aria-pressed={adminTab === 'showing'}
            className={adminTab === 'showing' ? 'is-active' : 'ghost'}
            onClick={() => {
              setAdminTab('showing');
              setFilters((previous) => ({ ...previous, page: 1 }));
            }}
          >
            Now showing
          </button>
        </div>
      )}

      <h1 style={{ marginTop: 28 }}>
        {showAdminListings ? 'All movie listings' : `Now showing${city ? ` in ${city}` : ''}`}
      </h1>

      <div className="row">
        <div className="search" style={{ flex: 2 }}>
          <SearchIcon />
          <input
            ref={searchInputRef}
            placeholder="Search movies by title"
            aria-label="Search movies"
            value={filters.q}
            onChange={updateFilter('q')}
          />
        </div>

        <select aria-label="Genre" value={filters.genre} onChange={updateFilter('genre')}>
          <option value="">All genres</option>
          {['Thriller', 'Drama', 'Romance', 'Comedy', 'Family', 'Action', 'Sci-Fi'].map(
            (genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ),
          )}
        </select>

        <select
          aria-label="Language"
          value={filters.language}
          onChange={updateFilter('language')}
        >
          <option value="">All languages</option>
          {['English', 'Hindi', 'Tamil', 'Telugu'].map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>

        <select
          aria-label="Age rating"
          value={filters.ageRating}
          onChange={updateFilter('ageRating')}
        >
          <option value="">All ages</option>
          {AGES.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
      </div>

      {!moviesData.items.length && (
        <p>
          {showAdminListings
            ? 'No movie listings match. Clear a filter to see more movies.'
            : 'No movies match. Clear a filter or pick another location.'}
        </p>
      )}

      {showAdminListings ? (
        <div className="admin-listings-grid">
          {moviesData.items.map((movie) => (
            <article className="admin-listing" key={movie._id}>
              {movie.poster ? (
                <img className="admin-listing__poster" src={movie.poster} alt={`${movie.title} poster`} />
              ) : (
                <div className="admin-listing__poster admin-listing__poster--empty">No poster</div>
              )}
              <div className="admin-listing__details">
                <div className="admin-listing__heading">
                  <h2>{movie.title}</h2>
                  <AgeBadge r={movie.ageRating} />
                </div>
                <p className="admin-listing__meta">
                  {movie.genre?.join(', ') || 'Genre not set'} · {movie.language || 'Language not set'} ·{' '}
                  {movie.duration ? `${movie.duration} min` : 'Duration not set'} · IMDb{' '}
                  {movie.imdbRating ?? movie.rating ?? '—'}/10
                </p>
                <p className="admin-listing__description">
                  {movie.description || 'No description added yet.'}
                </p>
                <p className="admin-listing__credits">
                  <strong>Director:</strong> {movie.director || 'Not listed'}
                  {movie.cast?.length > 0 && <> · <strong>Cast:</strong> {movie.cast.join(', ')}</>}
                </p>
                <div className="admin-listing__actions">
                  <Link to={`/movie/${movie._id}`}>View movie</Link>
                  <Link className="btn" to={`/admin/movies/${movie._id}/edit`}>Edit listing</Link>
                  <Link className="btn admin-add-show-link" to={`/admin/movies/${movie._id}/shows/new`}>
                    Add show
                  </Link>
                  <button
                    type="button"
                    className="danger admin-delete-listing"
                    onClick={() => deleteListing(movie)}
                  >
                    Delete listing
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid">
          {moviesData.items.map((movie) => (
            <Link key={movie._id} to={'/movie/' + movie._id} className="poster">
              <div
                className="art"
                style={movie.poster ? { backgroundImage: `url("${movie.poster}")` } : {}}
              >
                {!movie.poster && movie.title}
              </div>

              <div className="meta">
                <b>{movie.title}</b>
                <AgeBadge r={movie.ageRating} /> {movie.genre?.join(', ')} · {movie.language} · IMDb{' '}
                {movie.imdbRating ?? movie.rating ?? '—'}/10
              </div>
            </Link>
          ))}
        </div>
      )}

      {moviesData.pages > 1 && (
        <div className="row">
          <button
            className="ghost"
            disabled={filters.page <= 1}
            onClick={() => setFilters((previous) => ({ ...previous, page: previous.page - 1 }))}
          >
            Previous
          </button>

          <button
            className="ghost"
            disabled={filters.page >= moviesData.pages}
            onClick={() => setFilters((previous) => ({ ...previous, page: previous.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

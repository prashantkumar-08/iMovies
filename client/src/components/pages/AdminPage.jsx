import { useEffect, useState } from 'react';
import { api, err } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';

const AGES = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A'];
const EMPTY_MOVIE_FORM = {
  title: '',
  genre: '',
  language: 'English',
  duration: 120,
  imdbRating: '',
  description: '',
  poster: '',
  cover: '',
  director: '',
  cast: '',
  crew: '',
  ageRating: 'U/A 13+',
  releaseDate: '',
};

const toMoviePayload = (form) => ({
  ...form,
  imdbRating: form.imdbRating === '' ? null : Number(form.imdbRating),
  releaseDate: form.releaseDate || null,
  genre: form.genre.split(',').map((item) => item.trim()).filter(Boolean),
  cast: form.cast.split(',').map((item) => item.trim()).filter(Boolean),
  crew: form.crew
    .split(',')
    .map((entry) => {
      const [name, role] = entry.split('-').map((part) => part.trim());
      return { name, role };
    })
    .filter((person) => person.name),
});

export function AdminPage() {
  const { notify } = useApp();

  const [stats, setStats] = useState({});
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [movieForm, setMovieForm] = useState(EMPTY_MOVIE_FORM);

  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: '',
    location: '',
  });

  const [showForm, setShowForm] = useState({
    movie: '',
    theatre: '',
    screen: 1,
    startsAt: '',
    price: 200,
  });

  const loadDashboard = () => {
    api.get('/admin/stats').then((response) => setStats(response.data));
    api.get('/movies', { params: { limit: 100 } }).then((response) => setMovies(response.data.items));
    api.get('/theatres').then((response) => setTheatres(response.data));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const submitForm = (url, payload, successMessage) => async (event) => {
    event.preventDefault();

    try {
      await api.post(url, payload);
      notify(successMessage);
      loadDashboard();
    } catch (error) {
      notify(err(error), true);
    }
  };

  const renderInput = (label, value, onChange, type = 'text', required = false) => (
    <input
      type={type}
      placeholder={label}
      aria-label={label}
      required={required}
      value={value}
      onChange={onChange}
    />
  );

  return (
    <>
      <h1 style={{ marginTop: 28 }}>Dashboard</h1>

      <div className="row">
        {[
          ['Users', stats.users],
          ['Confirmed bookings', stats.bookings],
          ['Revenue', '₹' + (stats.revenue || 0)],
        ].map(([label, value]) => (
          <div className="panel" key={label}>
            <small>{label}</small>
            <h2>{value}</h2>
          </div>
        ))}
      </div>

      <form
        className="panel"
        onSubmit={submitForm('/movies', toMoviePayload(movieForm), 'Movie added')}
      >
        <h3>Add movie</h3>

        <div className="row">
          {renderInput('Title', movieForm.title, (event) =>
            setMovieForm((previous) => ({ ...previous, title: event.target.value })), 'text', true)}
          {renderInput('Genres, comma separated', movieForm.genre, (event) =>
            setMovieForm((previous) => ({ ...previous, genre: event.target.value })))}
          {renderInput('Language', movieForm.language, (event) =>
            setMovieForm((previous) => ({ ...previous, language: event.target.value })))}
          {renderInput('Duration (min)', movieForm.duration, (event) =>
            setMovieForm((previous) => ({ ...previous, duration: Number(event.target.value) })), 'number')}
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder="IMDb rating (0-10)"
            aria-label="IMDb rating (0-10)"
            value={movieForm.imdbRating}
            onChange={(event) => setMovieForm((previous) => ({
              ...previous,
              imdbRating: event.target.value === '' ? '' : Number(event.target.value),
            }))}
          />
        </div>

        <div className="row">
          <select
            aria-label="Age rating"
            value={movieForm.ageRating}
            onChange={(event) => setMovieForm((previous) => ({ ...previous, ageRating: event.target.value }))}
          >
            {AGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>

          <input
            placeholder="Director"
            aria-label="Director"
            value={movieForm.director}
            onChange={(event) =>
              setMovieForm((previous) => ({ ...previous, director: event.target.value }))
            }
          />

          <input
            placeholder="Cast, comma separated"
            aria-label="Cast, comma separated"
            value={movieForm.cast}
            onChange={(event) => setMovieForm((previous) => ({ ...previous, cast: event.target.value }))}
          />

          <input
            placeholder="Crew: Name - Role, Name - Role"
            aria-label="Crew: Name - Role, Name - Role"
            value={movieForm.crew}
            onChange={(event) => setMovieForm((previous) => ({ ...previous, crew: event.target.value }))}
          />
        </div>

        <div className="row">
          <input
            placeholder="Poster image URL"
            aria-label="Poster image URL"
            value={movieForm.poster}
            onChange={(event) => setMovieForm((previous) => ({ ...previous, poster: event.target.value }))}
          />

          <input
            placeholder="Cover image URL (wide)"
            aria-label="Cover image URL (wide)"
            value={movieForm.cover}
            onChange={(event) => setMovieForm((previous) => ({ ...previous, cover: event.target.value }))}
          />

          <input
            placeholder="Description"
            aria-label="Description"
            value={movieForm.description}
            onChange={(event) =>
              setMovieForm((previous) => ({ ...previous, description: event.target.value }))
            }
          />

          <button type="submit">Add movie</button>
        </div>
      </form>

      <form className="panel" onSubmit={submitForm('/theatres', theatreForm, 'Theatre added')}>
        <h3>Add theatre</h3>

        <div className="row">
          {renderInput('Theatre name', theatreForm.name, (event) =>
            setTheatreForm((previous) => ({ ...previous, name: event.target.value })), 'text', true)}
          {renderInput('City', theatreForm.city, (event) =>
            setTheatreForm((previous) => ({ ...previous, city: event.target.value })), 'text', true)}
          {renderInput('Area', theatreForm.location, (event) =>
            setTheatreForm((previous) => ({ ...previous, location: event.target.value })), 'text', true)}
          <button type="submit">Add theatre</button>
        </div>
      </form>

      <form className="panel" onSubmit={submitForm('/shows', showForm, 'Show scheduled with 80 seats')}>
        <h3>Schedule show</h3>

        <div className="row">
          <select
            required
            aria-label="Movie"
            value={showForm.movie}
            onChange={(event) => setShowForm((previous) => ({ ...previous, movie: event.target.value }))}
          >
            <option value="">Movie</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>

          <select
            required
            aria-label="Theatre"
            value={showForm.theatre}
            onChange={(event) => setShowForm((previous) => ({ ...previous, theatre: event.target.value }))}
          >
            <option value="">Theatre</option>
            {theatres.map((theatre) => (
              <option key={theatre._id} value={theatre._id}>
                {theatre.name}
              </option>
            ))}
          </select>

          {renderInput('Screen', showForm.screen, (event) =>
            setShowForm((previous) => ({ ...previous, screen: Number(event.target.value) })), 'number')}
          {renderInput('Start time', showForm.startsAt, (event) =>
            setShowForm((previous) => ({ ...previous, startsAt: event.target.value })), 'datetime-local')}
          {renderInput('Price (₹)', showForm.price, (event) =>
            setShowForm((previous) => ({ ...previous, price: Number(event.target.value) })), 'number')}
          <button type="submit">Schedule</button>
        </div>
      </form>

    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, err } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';

const localDateTime = (date) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
};

export function AddShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    theatre: '',
    screen: 1,
    startsAt: '',
    price: 200,
  });

  useEffect(() => {
    let active = true;

    Promise.all([api.get('/movies/' + id), api.get('/theatres')])
      .then(([movieResponse, theatreResponse]) => {
        if (!active) return;
        setMovie(movieResponse.data);
        setTheatres(theatreResponse.data);
      })
      .catch((requestError) => {
        if (active) setError(err(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const update = (field, numeric = false) => (event) => {
    const value = numeric ? Number(event.target.value) : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const scheduleShow = async (event) => {
    event.preventDefault();

    if (new Date(form.startsAt) <= new Date()) {
      setError('Choose a future showtime.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await api.post('/shows', {
        movie: id,
        theatre: form.theatre,
        screen: form.screen,
        startsAt: new Date(form.startsAt).toISOString(),
        price: form.price,
      });
      notify('Show scheduled with 80 seats');
      navigate('/admin');
    } catch (requestError) {
      setError(err(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-show-page">
      <Link className="admin-back-link" to="/">← All listings</Link>
      <h1>Add a show</h1>
      {error && <div className="panel" role="alert">{error}</div>}
      {isLoading && <p className="admin-page-message">Loading movie and theatres...</p>}
      {!isLoading && !movie && !error && <p className="admin-page-message">Movie not found.</p>}
      {movie && (
        <form className="panel admin-show-form" onSubmit={scheduleShow}>
          <div className="admin-show-movie">
            {movie.poster && <img src={movie.poster} alt={`${movie.title} poster`} />}
            <div>
              <small>Scheduling for</small>
              <h2>{movie.title}</h2>
            </div>
          </div>

          <label>
            Theatre
            <select required value={form.theatre} onChange={update('theatre')}>
              <option value="">Choose a theatre</option>
              {theatres.map((theatre) => (
                <option key={theatre._id} value={theatre._id}>
                  {theatre.name} · {theatre.city}
                </option>
              ))}
            </select>
          </label>
          {theatres.length === 0 && <p>No theatres are available. Add a theatre from the dashboard first.</p>}

          <div className="row">
            <label>
              Screen
              <input type="number" min="1" required value={form.screen} onChange={update('screen', true)} />
            </label>
            <label>
              Start time
              <input
                type="datetime-local"
                min={localDateTime(new Date())}
                required
                value={form.startsAt}
                onChange={update('startsAt')}
              />
            </label>
            <label>
              Ticket price (₹)
              <input type="number" min="1" required value={form.price} onChange={update('price', true)} />
            </label>
          </div>

          <div className="admin-show-actions">
            <button type="submit" disabled={!theatres.length || isSaving}>
              {isSaving ? 'Scheduling...' : 'Schedule show'}
            </button>
            <Link to="/">Cancel</Link>
          </div>
        </form>
      )}
    </section>
  );
}
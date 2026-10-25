import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, err } from '../../api.js';
import { MovieListingForm } from '../admin/MovieListingForm.jsx';
import { useApp } from '../../context/AppContext.jsx';

export function EditMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const [movie, setMovie] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/movies/' + id)
      .then((response) => {
        if (active) setMovie(response.data);
      })
      .catch((error) => {
        if (active) setLoadError(err(error));
      });

    return () => {
      active = false;
    };
  }, [id]);

  const saveMovie = async (payload) => {
    try {
      await api.put('/movies/' + id, payload);
      notify('Movie listing updated');
      navigate('/admin');
    } catch (error) {
      notify(err(error), true);
    }
  };

  return (
    <section className="admin-edit-page">
      <Link className="admin-back-link" to="/admin">← Admin dashboard</Link>
      <h1>Edit movie listing</h1>
      {movie && (
        <MovieListingForm
          key={movie._id}
          movie={movie}
          onSave={saveMovie}
          onCancel={() => navigate('/admin')}
        />
      )}
      {!movie && !loadError && <p>Loading movie listing...</p>}
      {loadError && (
        <div className="panel">
          <p>{loadError}</p>
          <Link to="/admin">Return to dashboard</Link>
        </div>
      )}
    </section>
  );
}
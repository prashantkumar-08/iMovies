import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, err } from '../../api.js';

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Show time unavailable';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      try {
        const response = await api.get('/admin/bookings');
        if (active) {
          setBookings(Array.isArray(response.data) ? response.data : []);
          setError('');
          setLastUpdated(new Date());
        }
      } catch (requestError) {
        if (active) setError(err(requestError));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadBookings();
    const refreshInterval = window.setInterval(loadBookings, 15000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [refreshKey]);

  return (
    <section className="admin-bookings-page">
      <Link className="admin-back-link" to="/admin">← Dashboard</Link>
      <div className="admin-bookings-heading">
        <div>
          <h1>Recent bookings</h1>
          <p>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading booking activity'}</p>
        </div>
        <button type="button" className="ghost" onClick={() => setRefreshKey((key) => key + 1)}>
          Refresh
        </button>
      </div>
      {error && <div className="panel admin-bookings-message" role="alert">{error}</div>}
      {isLoading && <div className="panel admin-bookings-message">Loading recent bookings...</div>}
      {!isLoading && !error && bookings.length === 0 && (
        <div className="panel admin-bookings-message">No bookings have been made yet.</div>
      )}
      {!isLoading && bookings.length > 0 && (
        <div className="panel admin-bookings-table">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Showtime</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Booked on</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <strong>{booking.user?.name || 'Unknown customer'}</strong>
                    {booking.user?.email && <small>{booking.user.email}</small>}
                  </td>
                  <td>{booking.show?.movie?.title || 'Movie unavailable'}</td>
                  <td>{booking.show?.theatre?.name || 'Theatre unavailable'}</td>
                  <td>{formatDate(booking.show?.startsAt)}</td>
                  <td>{booking.seats?.join(', ') || '—'}</td>
                  <td>₹{booking.amount}</td>
                  <td><span className={`booking-status booking-status--${booking.status}`}>{booking.status}</span></td>
                  <td>{formatDate(booking.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
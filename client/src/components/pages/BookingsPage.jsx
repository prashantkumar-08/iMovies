import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, err } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';

function formatShowTime(value) {
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BookingCard({ booking, showCancelAction }) {
  const isUpcoming =
    booking.show && new Date(booking.show.startsAt) >= new Date() && booking.status !== 'cancelled';

  return (
    <div className="ticket">
      <div>
        <b>{booking.show?.movie?.title}</b>
        <br />
        <small>
          {booking.show?.theatre?.name} · {booking.show && formatShowTime(booking.show.startsAt)}
        </small>
        <br />
        Seats {booking.seats.join(', ')} · ₹{booking.amount}
      </div>

      <div>
        <span className={'tag ' + booking.status}>{booking.status}</span>
        {isUpcoming && (
          <button className="danger" onClick={() => showCancelAction(booking._id)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function BookingsPage() {
  const { notify } = useApp();
  const [bookings, setBookings] = useState([]);

  const loadBookings = () => {
    api.get('/bookings/mine').then((response) => setBookings(response.data));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) {
      return;
    }

    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      notify(
        response.data.refund ? `Cancelled. ₹${response.data.refund} will be refunded.` : 'Cancelled',
      );
      loadBookings();
    } catch (error) {
      notify(err(error), true);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (booking) => booking.show && new Date(booking.show.startsAt) >= now && booking.status !== 'cancelled',
  );
  const pastBookings = bookings.filter((booking) => !upcomingBookings.includes(booking));

  return (
    <>
      <h1 style={{ marginTop: 28 }}>Upcoming</h1>

      {!upcomingBookings.length && (
        <p>
          No upcoming shows. <Link to="/">Find a movie</Link>
        </p>
      )}

      {upcomingBookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} showCancelAction={cancelBooking} />
      ))}

      <h2 style={{ marginTop: 28 }}>Past and cancelled</h2>

      {pastBookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} showCancelAction={cancelBooking} />
      ))}
    </>
  );
}

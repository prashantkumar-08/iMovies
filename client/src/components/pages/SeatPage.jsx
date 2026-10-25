import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, err, socket } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';
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

export function SeatPage() {
  const { id } = useParams();
  const { notify } = useApp();
  const navigate = useNavigate();

  const [showDetails, setShowDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [heldBooking, setHeldBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!id) {
      return;
    }

    api
      .get(`/shows/${id}/seats`)
      .then((response) => setShowDetails(response.data))
      .catch((error) => notify(err(error), true));

    socket.emit('join', id);

    const handleSeatUpdate = ({ labels, status }) => {
      setShowDetails((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          seats: previous.seats.map((seat) =>
            labels.includes(seat.label)
              ? { ...seat, status, mine: seat.mine && status === 'locked' }
              : seat,
          ),
        };
      });
    };

    socket.on('seats', handleSeatUpdate);

    return () => {
      socket.emit('leave', id);
      socket.off('seats', handleSeatUpdate);
    };
  }, [id, notify]);

  useEffect(() => {
    if (!heldBooking) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.round((new Date(heldBooking.lockExpires) - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [heldBooking]);

  if (!showDetails) {
    return <p>Loading seats…</p>;
  }

  const seatPrice = showDetails.show.price;

  const toggleSeat = (seat) => {
    if (heldBooking || seat.status !== 'available') {
      return;
    }

    setSelectedSeats((previous) => {
      if (previous.includes(seat.label)) {
        return previous.filter((label) => label !== seat.label);
      }

      return [...previous, seat.label];
    });
  };

  const reserveSeats = async () => {
    try {
      const response = await api.post('/bookings', {
        showId: id,
        seats: selectedSeats,
      });

      setHeldBooking({ ...response.data.booking, lockExpires: response.data.lockExpires });
    } catch (error) {
      notify(err(error), true);
      setSelectedSeats([]);
    }
  };

  const confirmPayment = async () => {
    try {
      await api.post(`/bookings/${heldBooking._id}/pay`, { method: paymentMethod });
      notify('Booking confirmed. Your tickets are in My bookings.');
      navigate('/bookings');
    } catch (error) {
      notify(err(error), true);

      if (error.response?.status === 410) {
        setHeldBooking(null);
        setSelectedSeats([]);
      }
    }
  };

  const releaseSeats = async () => {
    await api.post(`/bookings/${heldBooking._id}/cancel`);
    setHeldBooking(null);
    setSelectedSeats([]);
  };

  return (
    <>
      <div className="show-header">
        <div className="show-header__content">
          <p className="show-header__eyebrow">Now showing</p>
          <h1>{showDetails.show.movie.title}</h1>
          <p className="show-header__meta">
            {formatShowTime(showDetails.show.startsAt)}
          </p>
          <p className="show-header__address">
            {showDetails.show.theatre.name}, {showDetails.show.theatre.city} · Screen{' '}
            {showDetails.show.screen}
          </p>
        </div>
      </div>

      <div className="screen" aria-hidden="true" />
      <p style={{ textAlign: 'center' }}>Screen this way</p>

      <div className="seats">
        {showDetails.seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.label) || (heldBooking && seat.mine);

          return (
            <button
              key={seat.label}
              aria-label={`Seat ${seat.label} ${seat.status}`}
              className={'seat ' + (isSelected ? 'sel' : seat.status)}
              disabled={seat.status !== 'available' && !isSelected}
              onClick={() => toggleSeat(seat)}
            >
              {seat.label}
            </button>
          );
        })}
      </div>

      <div className="panel">
        {!heldBooking ? (
          <>
            <b>
              {selectedSeats.length
                ? `${selectedSeats.join(', ')} · ₹${selectedSeats.length * seatPrice}`
                : 'Select up to 8 seats'}
            </b>
            <button
              disabled={!selectedSeats.length || selectedSeats.length > 8}
              onClick={reserveSeats}
              style={{ marginLeft: 12 }}
            >
              Hold seats
            </button>
          </>
        ) : (
          <>
            <b>
              Seats held for {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </b>{' '}
            · Total ₹{heldBooking.amount}
            <div className="row">
              <select
                aria-label="Payment method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net banking</option>
                <option value="fail">Simulate failed payment</option>
              </select>

              <button onClick={confirmPayment}>Pay ₹{heldBooking.amount}</button>
              <button className="ghost" onClick={releaseSeats}>
                Release seats
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

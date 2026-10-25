import { useEffect, useMemo, useState } from 'react';
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

export function ProfilePage() {
  const { user, logout, notify } = useApp();

  const [bookings, setBookings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(2450);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });

    api
      .get('/bookings/mine')
      .then((response) => setBookings(response.data.slice(0, 3)))
      .catch((error) => notify(err(error), true));
  }, [notify, user]);

  const initials = useMemo(() => {
    if (!profile.name) {
      return 'U';
    }

    return profile.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  const saveProfile = () => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      ...profile,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    notify('Profile updated');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="panel profile-empty">
        <h2>Your profile</h2>
        <p>Please log in to view your account details.</p>
        <Link to="/login" className="btn">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-hero panel">
        <div className="profile-avatar" aria-label="Profile photo">
          {initials}
        </div>

        <div className="profile-user">
          <p className="profile-label">My profile</p>
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
        </div>

        <div className="profile-actions">
          <button type="button" className="ghost" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? 'Cancel' : 'Edit profile'}
          </button>
          <button type="button" className="danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="panel profile-form">
          <h3>Update profile</h3>

          <div className="form-grid">
            <label>
              Name
              <input
                value={profile.name}
                onChange={(event) => setProfile((previous) => ({ ...previous, name: event.target.value }))}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((previous) => ({ ...previous, email: event.target.value }))}
              />
            </label>

            <label>
              Phone
              <input
                value={profile.phone}
                onChange={(event) => setProfile((previous) => ({ ...previous, phone: event.target.value }))}
              />
            </label>
          </div>

          <div className="profile-actions form-actions">
            <button type="button" onClick={saveProfile}>Save changes</button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="panel stat-card wallet-card">
          <p className="muted-label">Wallet</p>
          <h2>₹{walletBalance.toLocaleString('en-IN')}</h2>
          <small>Available balance</small>
        </div>

        <div className="panel stat-card">
          <p className="muted-label">Bookings</p>
          <h2>{bookings.length}</h2>
          <small>Recent bookings</small>
        </div>
      </div>

      <div className="panel profile-bookings">
        <div className="section-header">
          <h3>Recent bookings</h3>
          <Link to="/bookings" className="link-button">
            View all
          </Link>
        </div>

        {bookings.length ? (
          bookings.map((booking) => (
            <div className="mini-booking" key={booking._id}>
              <div>
                <strong>{booking.show?.movie?.title || 'Movie'}</strong>
                <p>{booking.show?.theatre?.name}</p>
              </div>

              <div>
                <span className={'tag ' + booking.status}>{booking.status}</span>
                <p>{booking.show && formatShowTime(booking.show.startsAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No bookings yet.</p>
        )}
      </div>
    </div>
  );
}

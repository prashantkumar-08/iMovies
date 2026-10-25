import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { INDIAN_CITIES } from '../../data/indianCities.js';
import { SearchIcon } from '../common/Icons.jsx';

export function AppHeader() {
  const { user, city, cities, theme, setCity, setTheme, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const profileMenuRef = useRef(null);
  const locationPickerRef = useRef(null);
  const availableCities = [...new Set([...INDIAN_CITIES, ...cities])].sort((first, second) =>
    first.localeCompare(second),
  );
  const matchingCities = availableCities.filter((currentCity) =>
    currentCity.toLowerCase().includes(citySearch.trim().toLowerCase()),
  );

  const profileInitials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (locationPickerRef.current && !locationPickerRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav>
      <Link className="logo" to="/">
        <span className="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img" aria-label="iMovies logo">
            <defs>
              <linearGradient id="logoGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff6d6" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#logoGlow)" opacity="0.12" />
            <rect x="12" y="18" width="40" height="28" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" />
            <circle cx="21" cy="32" r="2.5" fill="#fff" />
            <circle cx="32" cy="32" r="2.5" fill="#fff" />
            <circle cx="43" cy="32" r="2.5" fill="#fff" />
            <path d="M27 23L42 32L27 41V23Z" fill="#fff" />
          </svg>
        </span>
        <span className="logo-text">iMovies</span>
      </Link>

      <div className="location-picker" ref={locationPickerRef}>
        <button
          className="location-trigger"
          type="button"
          aria-label={`Location: ${city || 'All cities'}`}
          aria-haspopup="listbox"
          aria-expanded={locationOpen}
          onClick={() => {
            setCitySearch('');
            setLocationOpen((open) => !open);
          }}
        >
          <span className="location-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span className="location-copy">
            <span className="location-label">Your location</span>
            <strong>{city || 'All cities'}</strong>
          </span>
          <svg className="location-chevron" viewBox="0 0 16 16" aria-hidden="true">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </button>

        {locationOpen && (
          <div className="location-options" role="group" aria-label="Choose a city">
            <span className="location-options__title">Browse by city</span>
            <input
              className="location-search"
              type="search"
              aria-label="Search cities"
              placeholder="Search a city"
              value={citySearch}
              onChange={(event) => setCitySearch(event.target.value)}
            />
            <button
              type="button"
              aria-pressed={!city}
              className={'location-option' + (!city ? ' is-selected' : '')}
              onClick={() => {
                setCity('');
                setCitySearch('');
                setLocationOpen(false);
              }}
            >
              <span>All cities</span>
              {!city && <span className="location-check" aria-hidden="true">✓</span>}
            </button>
            {matchingCities.map((currentCity) => (
              <button
                key={currentCity}
                type="button"
                aria-pressed={city === currentCity}
                className={'location-option' + (city === currentCity ? ' is-selected' : '')}
                onClick={() => {
                  setCity(currentCity);
                  setCitySearch('');
                  setLocationOpen(false);
                }}
              >
                <span>{currentCity}</span>
                {city === currentCity && <span className="location-check" aria-hidden="true">✓</span>}
              </button>
            ))}
            {matchingCities.length === 0 && (
              <p className="location-empty">No cities match “{citySearch}”.</p>
            )}
          </div>
        )}
      </div>

      <span style={{ marginLeft: 'auto' }} />

      <Link to="/?search=1" className="icon" aria-label="Search movies">
        <SearchIcon />
      </Link>

      <Link to="/">Movies</Link>
      {user?.role === 'admin' && (
        <>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/bookings">Recent bookings</Link>
        </>
      )}

      <button
        className="ghost icon"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>

      {user ? (
        <div className="profile-menu" ref={profileMenuRef}>
          <button
            className="profile-trigger"
            type="button"
            aria-label="Profile menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {profileInitials}
          </button>

          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown__header">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>

              <Link to="/bookings" onClick={() => setMenuOpen(false)}>
                My bookings
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <button
                type="button"
                className="ghost profile-logout"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link className="btn" to="/login">
          Log in
        </Link>
      )}
    </nav>
  );
}

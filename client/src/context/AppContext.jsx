import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState(null);
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const [city, setCityState] = useState(() => localStorage.getItem('city') || '');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    api
      .get('/theatres')
      .then((response) => {
        const list = [...new Set(response.data.map((theatre) => theatre.city).filter(Boolean))];
        setCities(list);
      })
      .catch(() => {
        setCities([]);
      });
  }, []);

  const setCity = useCallback((value) => {
    localStorage.setItem('city', value);
    setCityState(value);
  }, []);

  const setTheme = useCallback((value) => {
    setThemeState(value);
  }, []);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  }, [navigate]);

  const guard = useCallback(
    (element, requiresAdmin = false) => {
      if (!user) {
        return <Navigate to="/login" replace />;
      }

      if (requiresAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
      }

      return element;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      city,
      cities,
      theme,
      toast,
      setCity,
      setTheme,
      login,
      logout,
      notify,
      guard,
    }),
    [user, city, cities, theme, toast, setCity, setTheme, login, logout, notify, guard],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className={'toast' + (toast.isError ? ' bad' : '')} role="status">
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

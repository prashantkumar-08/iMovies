import { Route, Routes } from 'react-router-dom';
import { AppHeader } from './components/layout/AppHeader.jsx';
import { AdminPage } from './components/pages/AdminPage.jsx';
import { AdminBookingsPage } from './components/pages/AdminBookingsPage.jsx';
import { AddShowPage } from './components/pages/AddShowPage.jsx';
import { AuthPage } from './components/pages/AuthPage.jsx';
import { BookingsPage } from './components/pages/BookingsPage.jsx';
import { EditMoviePage } from './components/pages/EditMoviePage.jsx';
import { HomePage } from './components/pages/HomePage.jsx';
import { MovieDetailPage } from './components/pages/MovieDetailPage.jsx';
import { ProfilePage } from './components/pages/ProfilePage.jsx';
import { SeatPage } from './components/pages/SeatPage.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';

function AppShell() {
  const { guard } = useApp();

  return (
    <>
      <AppHeader />

      <main className="wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/shows/:id" element={guard(<SeatPage />)} />
          <Route path="/bookings" element={guard(<BookingsPage />)} />
          <Route path="/profile" element={guard(<ProfilePage />)} />
          <Route path="/admin" element={guard(<AdminPage />, true)} />
          <Route path="/admin/bookings" element={guard(<AdminBookingsPage />, true)} />
          <Route path="/admin/movies/:id/edit" element={guard(<EditMoviePage />, true)} />
          <Route path="/admin/movies/:id/shows/new" element={guard(<AddShowPage />, true)} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

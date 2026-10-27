import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Home from './pages/Home.jsx';
import Movie from './pages/Movie.jsx';
import Book from './pages/Book.jsx';
import { Login, Register } from './pages/Auth.jsx';
import { Bookings, Ticket } from './pages/Bookings.jsx';
import Admin from './pages/Admin.jsx';

function Guard({ admin, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="text-center p-5">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  return (<>
    <nav className="navbar navbar-expand navbar-dark px-3"><Link to="/" className="brand">I<b>Movies</b></Link>
      <div className="ms-auto d-flex gap-3 align-items-center">
        <NavLink to="/" className="text-decoration-none">Movies</NavLink>
        {user && <NavLink to="/bookings" className="text-decoration-none">My bookings</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className="text-decoration-none">Admin</NavLink>}
        {user ? <button className="btn btn-sm btn-outline-light" onClick={() => { logout(); nav('/'); }}>Log out ({user.name.split(' ')[0]})</button>
          : <Link to="/login" className="btn btn-sm btn-red">Log in</Link>}
      </div></nav>
    <main className="container py-4">
      <Routes>
        <Route path="/" element={<Home />} /><Route path="/movies/:id" element={<Movie />} />
        <Route path="/book/:showId" element={<Guard><Book /></Guard>} />
        <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
        <Route path="/bookings" element={<Guard><Bookings /></Guard>} /><Route path="/ticket/:ref" element={<Guard><Ticket /></Guard>} />
        <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
        <Route path="*" element={<div className="text-center p-5"><h1>404</h1><p className="muted">That page does not exist.</p><Link className="btn btn-red" to="/">Back to movies</Link></div>} />
      </Routes></main>
    <footer className="text-center muted py-4 small">IMovies - college project. Bookings are demo only; no real payments.</footer>
  </>);
}

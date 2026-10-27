import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Admin() {
  const [stats, setStats] = useState({}); const [movies, setMovies] = useState([]); const [bookings, setBookings] = useState([]); const [err, setErr] = useState('');
  const [f, setF] = useState({ title: '', genre: '', language: 'English', duration: 120, status: 'nowShowing' });
  const load = useCallback(() => Promise.all([api.get('/admin/stats'), api.get('/movies'), api.get('/admin/bookings')])
    .then(([a, b, c]) => { setStats(a.data.data); setMovies(b.data.data); setBookings(c.data.data); }).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const act = async (fn) => { try { setErr(''); await fn(); await load(); } catch (e) { setErr(errMsg(e)); } };
  const add = (e) => { e.preventDefault(); act(() => api.post('/admin/movies', { ...f, genre: f.genre.split(',').map((s) => s.trim()).filter(Boolean), duration: +f.duration }).then(() => setF({ ...f, title: '' }))); };
  return (<><h2>Admin dashboard</h2>{err && <div className="alert alert-danger">{err}</div>}
    <div className="row g-3 mb-4">{['users', 'movies', 'shows', 'bookings'].map((k) => <div className="col-6 col-md-3" key={k}><div className="panel p-3"><div className="muted text-capitalize">{k}</div><div className="fs-2 fw-bold">{stats[k] ?? '-'}</div></div></div>)}</div>
    <h4>Add movie</h4><form className="row g-2 mb-4" onSubmit={add}>
      <div className="col-md-3"><input className="form-control" required placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="col-md-3"><input className="form-control" placeholder="Genres (comma separated)" value={f.genre} onChange={(e) => setF({ ...f, genre: e.target.value })} /></div>
      <div className="col-md-2"><input className="form-control" placeholder="Language" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })} /></div>
      <div className="col-md-1"><input className="form-control" type="number" min="1" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} /></div>
      <div className="col-md-2"><select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="nowShowing">Now showing</option><option value="comingSoon">Coming soon</option></select></div>
      <div className="col-md-1"><button className="btn btn-red w-100">Add</button></div></form>
    <h4>Movies</h4><div className="table-responsive mb-4"><table className="table table-dark table-sm align-middle"><tbody>{movies.map((m) => <tr key={m._id}><td>{m.title}</td><td>{m.language}</td><td>{m.status}</td>
      <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Delete ' + m.title + '?') && act(() => api.delete('/admin/movies/' + m._id))}>Delete</button></td></tr>)}</tbody></table></div>
    <h4>Recent bookings</h4><div className="table-responsive"><table className="table table-dark table-sm"><tbody>{bookings.map((b) => <tr key={b._id}><td>{b.bookingReference}</td><td>{b.userId?.email}</td><td>{b.showId?.movieId?.title}</td><td>{b.selectedSeats.join(', ')}</td><td>Rs {b.totalAmount}</td><td>{b.status}</td></tr>)}</tbody></table></div></>);
}

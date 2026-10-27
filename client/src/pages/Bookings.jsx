import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';

export function Bookings() {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/bookings/mine').then((r) => setList(r.data.data)).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const cancel = async (ref) => { if (!window.confirm('Cancel this booking?')) return; try { await api.post(`/bookings/${ref}/cancel`); setErr(''); load(); } catch (e) { setErr(errMsg(e)); } };
  if (!list) return err ? <div className="alert alert-danger">{err}</div> : <div className="text-center p-5">Loading...</div>;
  const now = Date.now();
  return (<><h2>My bookings</h2>{err && <div className="alert alert-danger">{err}</div>}
    {list.length === 0 && <p className="muted">No bookings yet. <Link to="/">Find a movie</Link></p>}
    {list.map((b) => { const up = new Date(b.showId.showDate) > now && b.status === 'confirmed';
      return <div key={b._id} className="panel p-3 mb-3 d-flex flex-wrap justify-content-between gap-2"><div>
        <div className="fw-bold">{b.showId.movieId.title} <span className="badge bg-secondary">{b.status === 'cancelled' ? 'cancelled' : up ? 'upcoming' : 'past'}</span></div>
        <div className="muted small">{b.showId.cinemaId.name} - {new Date(b.showId.showDate).toLocaleString()} - Seats {b.selectedSeats.join(', ')} - Rs {b.totalAmount} - Ref {b.bookingReference}</div></div>
        <div className="d-flex gap-2 align-items-start"><Link className="btn btn-sm btn-outline-light" to={'/ticket/' + b.bookingReference}>View ticket</Link>
          {up && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(b.bookingReference)}>Cancel</button>}</div></div>; })}</>);
}
export function Ticket() {
  const { ref } = useParams(); const [b, setB] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/bookings/' + ref).then((r) => setB(r.data.data)).catch((e) => setErr(errMsg(e))); }, [ref]);
  if (err) return <div className="alert alert-danger">{err}</div>; if (!b) return <div className="text-center p-5">Loading...</div>;
  return (<div className="panel p-4 mx-auto" style={{ maxWidth: 520 }}><div className="muted small">Booking reference</div><h2 className="mb-3">{b.bookingReference}</h2>
    <h4>{b.showId.movieId.title}</h4><div>{b.showId.cinemaId.name}, {b.showId.cinemaId.location} - {b.showId.screenName}</div><div>{new Date(b.showId.showDate).toLocaleString()}</div>
    <div className="mt-2">Seats: <b>{b.selectedSeats.join(', ')}</b> ({b.selectedSeats.length} tickets)</div><div>Total: Rs {b.totalAmount} (incl. fee Rs {b.fee})</div><div>Status: {b.status}</div>
    <p className="small muted mt-3">Demo ticket - no real payment was processed.</p>
    <button className="btn btn-red no-print" onClick={() => window.print()}>Print ticket</button></div>);
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';

export default function Book() {
  const { showId } = useParams(); const nav = useNavigate();
  const [show, setShow] = useState(null); const [sel, setSel] = useState([]); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.get('/shows/' + showId).then((r) => { setShow(r.data.data); setSel((s) => s.filter((x) => !r.data.data.bookedSeats.includes(x))); }).catch((e) => setErr(errMsg(e))), [showId]);
  useEffect(() => { load(); }, [load]);
  if (!show) return err ? <div className="alert alert-danger">{err}</div> : <div className="text-center p-5">Loading seats...</div>;
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 8 ? (setErr('You can book up to 8 seats at once.'), s) : [...s, id]));
  const fee = sel.length * 20, total = sel.length * show.ticketPrice + fee;
  const confirm = async () => {
    setBusy(true); setErr('');
    try { const r = await api.post('/bookings', { showId, seats: sel }); nav('/ticket/' + r.data.data.bookingReference); }
    catch (e) { setErr(errMsg(e)); await load(); } finally { setBusy(false); }
  };
  return (<div className="row g-4"><div className="col-lg-8"><div className="panel p-3 p-md-4">
    <h2>{show.movieId.title}</h2><p className="muted">{show.cinemaId.name}, {show.cinemaId.location} - {show.screenName} - {new Date(show.showDate).toLocaleString()}</p>
    <div className="screen" /><div className="text-center muted small mb-3">Screen this way</div>
    <div className="overflow-auto text-center">{Array.from({ length: show.rows }, (_, r) => { const L = String.fromCharCode(65 + r);
      return <div key={L} className="d-flex justify-content-center align-items-center"><span className="muted me-2" style={{ width: 16 }}>{L}</span>
        {Array.from({ length: show.seatsPerRow }, (_, c) => { const id = L + (c + 1), bk = show.bookedSeats.includes(id), on = sel.includes(id);
          return <button key={id} disabled={bk} aria-label={`Seat ${id}${bk ? ' booked' : ''}`} aria-pressed={on} className={'seat' + (bk ? ' bk' : on ? ' sel' : '')} onClick={() => toggle(id)}>{c + 1}</button>; })}</div>; })}</div>
    <div className="d-flex gap-3 justify-content-center small muted mt-3"><span>Available</span><span style={{ color: '#e50914' }}>Selected</span><span>Booked (dashed)</span></div>
  </div></div>
  <div className="col-lg-4"><div className="panel p-3"><h4>Checkout</h4>
    <div className="small muted mb-2">Demo booking: no real payment is processed.</div>
    <div>Seats: {sel.length ? sel.join(', ') : 'none selected'}</div><div>Tickets: {sel.length} x Rs {show.ticketPrice}</div><div>Convenience fee: Rs {fee}</div>
    <h3 className="my-2">Total Rs {total}</h3>
    {err && <div className="alert alert-danger py-2">{err}</div>}
    <button className="btn btn-red w-100" disabled={!sel.length || busy} onClick={confirm}>{busy ? 'Booking...' : 'Confirm demo booking'}</button></div></div></div>);
}

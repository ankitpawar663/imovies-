import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { Poster } from './Home.jsx';

export default function Movie() {
  const { id } = useParams(); const [m, setM] = useState(null); const [shows, setShows] = useState([]); const [err, setErr] = useState(''); const [date, setDate] = useState('');
  useEffect(() => { Promise.all([api.get('/movies/' + id), api.get('/shows', { params: { movieId: id } })]).then(([a, b]) => { setM(a.data.data); setShows(b.data.data); }).catch((e) => setErr(errMsg(e))); }, [id]);
  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!m) return <div className="text-center p-5">Loading...</div>;
  const day = (s) => new Date(s.showDate).toLocaleDateString('en-CA');
  const days = [...new Set(shows.map(day))]; const sel = date || days[0];
  const byCinema = {}; shows.filter((s) => day(s) === sel).forEach((s) => (byCinema[s.cinemaId.name] ||= []).push(s));
  return (<div className="row g-4">
    <div className="col-md-3"><div className="card-dark overflow-hidden"><Poster m={m} /></div></div>
    <div className="col-md-9"><h1>{m.title}</h1>
      <p className="muted">{m.genre.join(', ')} | {m.language} | {m.duration} min | Rated {m.rating} | Released {m.releaseDate && new Date(m.releaseDate).toLocaleDateString()}</p>
      <p>{m.description}</p><p className="small muted">Director: {m.director || 'n/a'} - Cast: {m.cast?.join(', ') || 'n/a'}</p>
      {m.trailerUrl && <a href={m.trailerUrl} target="_blank" rel="noreferrer" className="btn btn-outline-light btn-sm mb-3">Watch trailer</a>}
      <h4 className="mt-3">Showtimes</h4>
      {days.length === 0 ? <p className="muted">No upcoming shows for this movie yet.</p> : <>
        <div className="d-flex gap-2 flex-wrap mb-3">{days.map((d) => <button key={d} className={'btn btn-sm ' + (d === sel ? 'btn-red' : 'btn-outline-light')} onClick={() => setDate(d)}>{new Date(d + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</button>)}</div>
        {Object.entries(byCinema).map(([c, list]) => <div className="panel p-3 mb-3" key={c}><div className="fw-semibold mb-2">{c} <span className="muted small">- {list[0].cinemaId.location}</span></div>
          <div className="d-flex gap-2 flex-wrap">{list.map((s) => <Link key={s._id} to={`/book/${s._id}`} className={'btn btn-outline-light' + (s.availableSeats === 0 ? ' disabled' : '')}>
            {new Date(s.showDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<div className="small muted">{s.screenName} - Rs {s.ticketPrice} - {s.availableSeats === 0 ? 'Sold out' : s.availableSeats + ' left'}</div></Link>)}</div></div>)}</>}
    </div></div>);
}

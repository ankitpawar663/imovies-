import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';

export const Poster = ({ m }) => {
  const h = [...m.title].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <div className="poster" style={{ '--c1': `hsl(${h} 60% 28%)`, '--c2': `hsl(${(h + 60) % 360} 50% 10%)`, ...(m.posterUrl ? { backgroundImage: `url(${m.posterUrl})` } : {}) }}>{!m.posterUrl && m.title}</div>;
};
export default function Home() {
  const [movies, setMovies] = useState(null); const [err, setErr] = useState('');
  const [f, setF] = useState({ q: '', genre: '', language: '', status: '', sort: 'rating' });
  useEffect(() => { const t = setTimeout(() => api.get('/movies', { params: f }).then((r) => { setMovies(r.data.data); setErr(''); }).catch((e) => setErr(errMsg(e))), 250); return () => clearTimeout(t); }, [f]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const top = movies?.[0];
  return (<>
    <section className="hero mb-4"><h1 className="display-5 fw-bold">{top ? top.title : 'Tonight, the big screen.'}</h1>
      <p className="muted col-md-6">{top ? top.description : 'Pick a film, choose your seats, done.'}</p>
      {top && <Link to={`/movies/${top._id}`} className="btn btn-red btn-lg">Book tickets</Link>}</section>
    <div className="row g-2 mb-4">
      <div className="col-md-4"><input className="form-control" placeholder="Search by title" value={f.q} onChange={set('q')} aria-label="Search" /></div>
      <div className="col-6 col-md-2"><select className="form-select" value={f.genre} onChange={set('genre')}><option value="">All genres</option>{['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure', 'Family'].map((g) => <option key={g}>{g}</option>)}</select></div>
      <div className="col-6 col-md-2"><select className="form-select" value={f.language} onChange={set('language')}><option value="">All languages</option>{['English', 'Hindi', 'Tamil', 'Telugu'].map((g) => <option key={g}>{g}</option>)}</select></div>
      <div className="col-6 col-md-2"><select className="form-select" value={f.status} onChange={set('status')}><option value="">Now and soon</option><option value="nowShowing">Now showing</option><option value="comingSoon">Coming soon</option></select></div>
      <div className="col-6 col-md-2"><select className="form-select" value={f.sort} onChange={set('sort')}><option value="rating">Top rated</option><option value="newest">Newest</option><option value="title">Title A-Z</option></select></div>
    </div>
    {err && <div className="alert alert-danger">{err}</div>}
    {!movies && !err && <div className="text-center p-5">Loading movies...</div>}
    {movies?.length === 0 && <p className="muted text-center p-5">No movies match your filters. Try clearing the search.</p>}
    <div className="row g-3">{movies?.map((m) => (
      <div className="col-6 col-md-3 col-lg-2" key={m._id}><Link to={`/movies/${m._id}`} className="card-dark mcard d-block overflow-hidden"><Poster m={m} />
        <div className="p-2"><div className="fw-semibold text-truncate">{m.title}</div><div className="small muted">{m.genre.join(', ')}</div>
          <div className="small">{m.status === 'comingSoon' ? 'Coming soon' : `Rated ${m.rating}`}</div></div></Link></div>))}</div>
  </>);
}

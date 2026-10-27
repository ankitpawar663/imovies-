import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { errMsg } from '../api';

function Form({ mode }) {
  const { login } = useAuth(); const nav = useNavigate(); const reg = mode === 'register';
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '' }); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (reg && v.password !== v.confirm) return setErr('Passwords do not match');
    if (reg && v.password.length < 8) return setErr('Password must be at least 8 characters');
    try { await login(mode, v); nav('/'); } catch (x) { setErr(errMsg(x)); }
  };
  return (<div className="panel p-4 mx-auto" style={{ maxWidth: 420 }}><h2>{reg ? 'Create your account' : 'Log in'}</h2>
    <form onSubmit={submit} className="d-grid gap-3">
      {reg && <input className="form-control" placeholder="Full name" required value={v.name} onChange={set('name')} />}
      <input className="form-control" type="email" placeholder="Email" required value={v.email} onChange={set('email')} />
      <input className="form-control" type={show ? 'text' : 'password'} placeholder="Password" required value={v.password} onChange={set('password')} />
      {reg && <input className="form-control" type={show ? 'text' : 'password'} placeholder="Confirm password" required value={v.confirm} onChange={set('confirm')} />}
      <label className="small"><input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show password</label>
      {err && <div className="alert alert-danger py-2 mb-0">{err}</div>}
      <button className="btn btn-red">{reg ? 'Sign up' : 'Log in'}</button></form>
    <p className="small muted mt-3 mb-0">{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p></div>);
}
export const Login = () => <Form mode="login" />;
export const Register = () => <Form mode="register" />;

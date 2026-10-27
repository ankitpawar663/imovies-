import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false);
  useEffect(() => { if (!localStorage.getItem('imovies_token')) return setReady(true);
    api.get('/auth/me').then((r) => setUser(r.data.data)).catch(() => localStorage.removeItem('imovies_token')).finally(() => setReady(true)); }, []);
  const login = async (path, body) => { const { data } = await api.post('/auth/' + path, body); localStorage.setItem('imovies_token', data.data.token); setUser(data.data.user); };
  const logout = () => { localStorage.removeItem('imovies_token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}

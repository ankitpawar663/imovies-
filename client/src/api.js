import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('imovies_token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Check that the API is running.' : 'Something went wrong');
export default api;

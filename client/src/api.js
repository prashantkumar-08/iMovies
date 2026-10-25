import axios from 'axios';
import { io } from 'socket.io-client';
export const BASE = import.meta.env.VITE_API || 'http://localhost:5000';
export const api = axios.create({ baseURL: BASE + '/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
export const socket = io(BASE, { autoConnect: true });
export const err = (e) => e.response?.data?.message || e.message;

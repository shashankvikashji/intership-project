import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('lumen_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      // only auto-logout when the token was rejected on a protected call
      const url = err.config?.url || '';
      if (url.includes('/auth/me') || url.includes('/interactions') || url.includes('/users')) {
        localStorage.removeItem('lumen_token');
      }
    }
    return Promise.reject(err);
  }
);

export function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function readingTime(article) {
  if (article?.readingMinutes) return `${article.readingMinutes} min read`;
  const words = `${article?.title || ''} ${article?.description || ''} ${article?.content || ''}`.split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default api;

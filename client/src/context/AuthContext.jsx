import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // interaction markers for the signed-in user
  const [liked, setLiked] = useState(new Set());
  const [saved, setSaved] = useState(new Set());
  const [skipped, setSkipped] = useState(new Set());

  const token = () => localStorage.getItem('lumen_token');

  const refreshMarkers = useCallback(async () => {
    if (!token()) return;
    try {
      const { data } = await api.get('/interactions/mystate');
      setLiked(new Set(data.liked || []));
      setSaved(new Set(data.saved || []));
      setSkipped(new Set(data.skipped || []));
    } catch { /* anonymous or offline */ }
  }, []);

  const fetchMe = useCallback(async () => {
    if (!token()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      await refreshMarkers();
      return data.user;
    } catch {
      localStorage.removeItem('lumen_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshMarkers]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('lumen_token', data.token);
    setUser(data.user);
    await refreshMarkers();
    return data.user;
  }, [refreshMarkers]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('lumen_token', data.token);
    setUser(data.user);
    await refreshMarkers();
    return data.user;
  }, [refreshMarkers]);

  const logout = useCallback(() => {
    localStorage.removeItem('lumen_token');
    setUser(null);
    setLiked(new Set());
    setSaved(new Set());
    setSkipped(new Set());
  }, []);

  // Demo mode: one-click sign in with the seeded account.
  const demoLogin = useCallback(async () => {
    return login('demo@lumen.news', 'demo1234');
  }, [login]);

  const interact = useCallback(async (articleId, type) => {
    const id = String(articleId);
    // optimistic update
    const apply = (set, fn) => set(prev => { const n = new Set(prev); fn(n, id); return n; });
    if (type === 'LIKE') setLiked(p => new Set(p).add(id));
    if (type === 'UNLIKE') apply(setLiked, (n, x) => n.delete(x));
    if (type === 'SAVE') setSaved(p => new Set(p).add(id));
    if (type === 'UNSAVE') apply(setSaved, (n, x) => n.delete(x));
    if (type === 'SKIP') setSkipped(p => new Set(p).add(id));
    if (type === 'UNSKIP') apply(setSkipped, (n, x) => n.delete(x));
    try {
      await api.post('/interactions', { articleId: id, type });
    } catch {
      refreshMarkers(); // revert on failure
    }
  }, [refreshMarkers]);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, demoLogin, liked, saved, skipped, interact, refreshMarkers, isAuthed: !!user }),
    [user, loading, login, register, logout, demoLogin, liked, saved, skipped, interact, refreshMarkers]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

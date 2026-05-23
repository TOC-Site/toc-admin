import { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Setup from './pages/Setup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductForm from './pages/ProductForm.jsx';
import { api } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [token,      setToken]      = useState(() => localStorage.getItem('toc_admin_token'));
  const [user,       setUser]       = useState(null);
  const [needsSetup, setNeedsSetup] = useState(null); // null = loading

  useEffect(() => {
    api.needsSetup().then(d => setNeedsSetup(d.needsSetup)).catch(() => setNeedsSetup(false));
  }, []);

  useEffect(() => {
    if (token && !user) {
      api.me().then(setUser).catch(() => { setToken(null); localStorage.removeItem('toc_admin_token'); });
    }
  }, [token]);

  const login = (t, u) => {
    localStorage.setItem('toc_admin_token', t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('toc_admin_token');
    setToken(null);
    setUser(null);
  };

  if (needsSetup === null) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #154913', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ token, user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/setup" element={needsSetup ? <Setup onDone={() => setNeedsSetup(false)} /> : <Navigate to="/login" />} />
          <Route path="/login" element={
            needsSetup ? <Navigate to="/setup" /> : token ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/products/new" element={token ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="/products/:id/edit" element={token ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthCtx.Provider>
  );
}

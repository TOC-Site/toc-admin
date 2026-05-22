import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      login(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f2ee', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: '#154913', marginBottom: 16 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a5d490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0e0e0e', letterSpacing: '-0.02em' }}>The Organic Cosmos</h1>
          <p style={{ fontSize: 14, color: '#7a7a68', marginTop: 4 }}>Admin Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e4dc', padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1a1a14', marginBottom: 24 }}>Sign in to your account</h2>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="admin@theorganiccosmos.com" autoFocus />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, height: 48, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                background: loading ? '#6aa358' : '#154913', color: '#fff', fontSize: 15, fontWeight: 600,
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#a8a498', marginTop: 24 }}>
          © {new Date().getFullYear()} The Organic Cosmos. Admin access only.
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a3a', marginBottom: 7 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${focused ? '#154913' : '#ddd9d0'}`,
          padding: '0 14px', fontSize: 14, color: '#1a1a14', background: '#faf9f7', outline: 'none',
          transition: 'border-color 0.15s',
        }}
      />
    </div>
  );
}

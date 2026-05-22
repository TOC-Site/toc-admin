import { useState } from 'react';
import { api } from '../api.js';

export default function Setup({ onDone }) {
  const [form,    setForm]    = useState({ email: '', password: '', name: '' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setError('');
    setLoading(true);
    try {
      await api.setup(form.email, form.password, form.name);
      setSuccess(true);
      setTimeout(onDone, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f2ee', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: '#154913', marginBottom: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5d490" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0e0e0e' }}>Create Admin Account</h1>
          <p style={{ fontSize: 14, color: '#7a7a68', marginTop: 4 }}>One-time setup for The Organic Cosmos admin</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e4dc', padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#154913' }}>Admin account created!</p>
              <p style={{ fontSize: 13, color: '#7a7a68', marginTop: 6 }}>Redirecting to login…</p>
            </div>
          ) : (
            <>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'name',     label: 'Your Name',         type: 'text',     placeholder: 'Admin' },
                  { key: 'email',    label: 'Email address',     type: 'email',    placeholder: 'admin@theorganiccosmos.com' },
                  { key: 'password', label: 'Password (min 8 chars)', type: 'password', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a3a', marginBottom: 7 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required
                      style={{ width: '100%', height: 44, borderRadius: 10, border: '1.5px solid #ddd9d0', padding: '0 14px', fontSize: 14, background: '#faf9f7', outline: 'none' }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading} style={{ marginTop: 6, height: 48, borderRadius: 12, border: 'none', cursor: 'pointer', background: '#154913', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}>
                  {loading ? 'Creating…' : 'Create Admin Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { api } from '../api.js';

const BADGE_COLORS = {
  'Bestseller': { bg: '#dcfce7', color: '#166534' },
  'Top Rated':  { bg: '#dbeafe', color: '#1e40af' },
  'New':        { bg: '#fef9c3', color: '#854d0e' },
  'Sale':       { bg: '#fee2e2', color: '#991b1b' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [products,   setProducts]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);
  const [toast,      setToast]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, s, cats] = await Promise.all([
        api.getProducts({ search, category: category === 'All' ? '' : category }),
        api.getStats(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setStats(s);
      setCategories(cats);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.deleteProduct(id);
      showToast(`"${name}" deleted`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleStock = async (product) => {
    try {
      await api.updateProduct(product.id, { ...product, inStock: !product.inStock });
      showToast(`${product.name} marked as ${!product.inStock ? 'In Stock' : 'Out of Stock'}`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f2ee' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0e0e0e', letterSpacing: '-0.02em' }}>Products</h1>
            <p style={{ fontSize: 13, color: '#7a7a68', marginTop: 2 }}>Manage your product catalogue</p>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, paddingLeft: 18, paddingRight: 18, borderRadius: 11, border: 'none', background: '#154913', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Products', value: stats.total,      icon: '📦', color: '#154913' },
              { label: 'In Stock',       value: stats.inStock,    icon: '✅', color: '#059669' },
              { label: 'Categories',     value: stats.categories, icon: '🗂️', color: '#7c3aed' },
              { label: 'Added This Week',value: stats.recent,     icon: '🆕', color: '#d97706' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eae6de', padding: '18px 20px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', fontFamily: 'DM Mono, monospace' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#9a9a88', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eae6de', padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a498' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', height: 38, borderRadius: 9, border: '1.5px solid #e8e4dc', paddingLeft: 36, paddingRight: 12, fontSize: 13, outline: 'none', background: '#faf9f7', fontFamily: 'inherit' }}
            />
          </div>
          {/* Category filter */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ height: 38, borderRadius: 9, border: '1.5px solid #e8e4dc', padding: '0 12px', fontSize: 13, background: '#faf9f7', color: '#4a4a3a', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div style={{ fontSize: 13, color: '#9a9a88', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, color: '#1a1a14' }}>{products.length}</span> products
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eae6de', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0ece4' }}>
                  {['Product', 'Category', 'SKU', 'Price', 'Stock', 'Badge', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9a9a88', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#9a9a88', fontSize: 14 }}>Loading products…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#9a9a88', fontSize: 14 }}>No products found. <button onClick={() => navigate('/products/new')} style={{ color: '#154913', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Add the first one →</button></td></tr>
                ) : (
                  products.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f7f5f2' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Product */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: p.imgBg || '#f0ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {p.img ? (
                              <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => e.currentTarget.style.display = 'none'} />
                            ) : (
                              <span style={{ fontSize: 18 }}>📦</span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a14', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#9a9a88', marginTop: 1 }}>{p.sub} · {p.weight}</div>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color: '#4a4a3a', background: '#f0ece4', borderRadius: 6, padding: '3px 8px' }}>{p.category}</span>
                      </td>
                      {/* SKU */}
                      <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#9a9a88', whiteSpace: 'nowrap' }}>{p.sku || '—'}</td>
                      {/* Price */}
                      <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, color: '#154913', whiteSpace: 'nowrap' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      {/* Stock */}
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => toggleStock(p)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, background: p.inStock ? '#dcfce7' : '#fee2e2', color: p.inStock ? '#166534' : '#991b1b' }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.inStock ? '#16a34a' : '#dc2626', flexShrink: 0 }} />
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      {/* Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        {p.badge ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, ...(BADGE_COLORS[p.badge] || { bg: '#f0ece4', color: '#4a4a3a' }), background: (BADGE_COLORS[p.badge] || {}).bg || '#f0ece4' }}>{p.badge}</span>
                        ) : <span style={{ color: '#c0bdb5', fontSize: 12 }}>—</span>}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <ActionBtn
                            onClick={() => navigate(`/products/${p.id}/edit`)}
                            title="Edit"
                            color="#154913"
                            hoverBg="#f0f7ee"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete"
                            color="#dc2626"
                            hoverBg="#fef2f2"
                            loading={deleting === p.id}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: toast.type === 'error' ? '#1a0a0a' : '#0e1f0b',
          color: toast.type === 'error' ? '#fca5a5' : '#a5d490',
          padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

function ActionBtn({ children, onClick, color, hoverBg, loading, title }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: `1px solid ${color}22`, background: 'transparent', color, fontSize: 12, fontWeight: 500, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );
}

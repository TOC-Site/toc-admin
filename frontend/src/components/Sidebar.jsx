import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App.jsx';

const NAV = [
  { icon: GridIcon,    label: 'Dashboard',  path: '/' },
  { icon: BoxIcon,     label: 'Products',   path: '/products-list' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#0e1f0b', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#154913', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8db87a" strokeWidth="2.2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e8f5e0', letterSpacing: '0.02em', lineHeight: 1.2 }}>The Organic</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#6a9a5a', letterSpacing: '0.04em' }}>COSMOS ADMIN</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon={<GridIcon />}  label="Dashboard"   path="/"                onClick={() => navigate('/')}               active={pathname === '/'} />
        <NavItem icon={<BoxIcon />}   label="Products"    path="/"                onClick={() => navigate('/')}               active={pathname.startsWith('/products')} />
        <NavItem icon={<PlusIcon />}  label="Add Product" path="/products/new"    onClick={() => navigate('/products/new')}   active={pathname === '/products/new'} />

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '10px 6px' }} />

        <a href="https://toc-site.github.io/The-OrganicCosmos-Claude/" target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, color: '#6a9a5a', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ExternalIcon />
          View Live Site
        </a>
      </nav>

      {/* User */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#154913', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#8db87a', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#d8f0c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 11, color: '#5a8a4a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 9, border: 'none', background: 'transparent', color: '#6a8a5a', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#c0d8b0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6a8a5a'; }}
        >
          <LogoutIcon /> Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
        background: active ? 'rgba(141,184,122,0.12)' : 'transparent',
        color: active ? '#8db87a' : '#6a9a5a',
        fontSize: 13, fontWeight: active ? 600 : 500,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#a0c890'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6a9a5a'; } }}
    >
      <span style={{ color: active ? '#8db87a' : '#5a7a4a', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}

function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function BoxIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function ExternalIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }

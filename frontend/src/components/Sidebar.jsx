import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    to: '/seller/returns',
    label: 'Devoluciones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/seller/catalog',
    label: 'Catalogo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="7" height="7" rx="1"/>
        <rect x="15" y="3" width="7" height="7" rx="1"/>
        <rect x="2" y="14" width="7" height="7" rx="1"/>
        <rect x="15" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/seller/alerts',
    label: 'Alertas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/seller/login');
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="rgba(0,212,170,0.15)"/>
          <path d="M7 9C7 6.8 8.8 5 11 5L16 5C18.2 5 20 6.8 20 9L20 13C20 15.2 18.2 17 16 17L14.2 17L11 22L11 17C8.8 17 7 15.2 7 13Z" fill="#00D4AA"/>
          <path d="M10.5 9.5L16.5 9.5M10.5 12.5L14.5 12.5" stroke="#1A1A2E" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <span className="sidebar-logo-text">Return<span>IQ</span></span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Portal vendedor</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ padding: '4px 4px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            {user.name}
          </div>
        )}
        <button
          className="sidebar-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={handleLogout}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

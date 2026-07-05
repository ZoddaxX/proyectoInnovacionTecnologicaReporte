import React from 'react';
import { Link } from 'react-router-dom';

export default function BuyerLayout({ children }) {
  return (
    <div className="buyer-layout">
      <div className="page-header">
        <Link to="/buyer" style={{ textDecoration: 'none' }}>
          <span className="header-logo">Return<span>IQ</span></span>
        </Link>
        <span style={{
          flex: 1,
          textAlign: 'right',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-h)',
        }}>
          Comprador
        </span>
      </div>
      <div className="buyer-content">
        {children}
      </div>
    </div>
  );
}

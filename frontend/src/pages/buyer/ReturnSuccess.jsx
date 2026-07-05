import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';

export default function ReturnSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state    = location.state;
  const [copied, setCopied] = useState(false);

  if (!state?.returnCode) return <Navigate to="/buyer" replace />;

  const { returnCode, productName, emojiIcon } = state;

  function copyCode() {
    navigator.clipboard.writeText(returnCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: '400px', textAlign: 'center' }}>

        <div className="success-icon" style={{ background: 'var(--accent-soft)', marginBottom: '20px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="var(--accent)" />
            <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ fontFamily: 'var(--font-h)', fontSize: '22px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
          ¡Solicitud enviada!
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px', lineHeight: '1.5' }}>
          {emojiIcon && `${emojiIcon} `}{productName && `${productName} — `}
          tu devolución fue registrada correctamente.
        </div>

        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Código de seguimiento
        </div>

        <div className="buyer-code-display">{returnCode}</div>

        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '12px' }}
          onClick={copyCode}
        >
          {copied ? '¡Copiado!' : 'Copiar código'}
        </button>

        <button
          className="btn btn-primary"
          style={{ marginBottom: '16px' }}
          onClick={() => navigate(`/buyer/track/${returnCode}`)}
        >
          Rastrear mi devolución
        </button>

        <Link
          to="/buyer"
          style={{ fontSize: '12px', color: 'var(--text3)', textDecoration: 'none', display: 'block' }}
        >
          Volver al inicio
        </Link>

      </div>
    </div>
  );
}

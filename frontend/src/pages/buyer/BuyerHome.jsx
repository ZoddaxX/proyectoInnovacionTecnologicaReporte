import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';

export default function BuyerHome() {
  const navigate  = useNavigate();
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const val = input.trim().toUpperCase();
    if (!val) return;
    setLoading(true);
    setError('');

    if (val.startsWith('ORD-')) {
      const res = await api(`/api/buyer/order/${encodeURIComponent(val)}`);
      setLoading(false);
      if (res.success) {
        navigate(`/buyer/order/${encodeURIComponent(val)}`);
      } else {
        setError(res.error || 'Pedido no encontrado');
      }
    } else {
      const res = await api(`/api/buyer/returns/${encodeURIComponent(val)}`);
      setLoading(false);
      if (res.success) {
        navigate(`/buyer/track/${encodeURIComponent(val)}`);
      } else {
        setError('Código o número de pedido no encontrado');
      }
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: '400px' }}>

        <div className="login-logo-wrap">
          <div className="login-logo">Return<span>IQ</span></div>
          <div className="login-tagline">Portal del comprador</div>
        </div>

        {error && <div className="err-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Número de pedido o código de devolución</label>
            <input
              className={`form-input${error ? ' error' : ''}`}
              placeholder="ORD-2025-00001 o RET-4729"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              autoFocus
              autoComplete="off"
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '5px', lineHeight: '1.5' }}>
              Ingresa tu número de pedido para iniciar una devolución,
              o tu código <strong>RET-</strong> para rastrear una existente.
            </div>
          </div>
          <button className="btn btn-primary" disabled={loading || !input.trim()}>
            {loading ? 'Buscando...' : 'Continuar'}
          </button>
        </form>

        <div className="login-demo-box" style={{ marginTop: '20px' }}>
          <strong>Demo &mdash; pedidos sin devolución:</strong><br />
          ORD-2025-00001 &middot; ORD-2025-00002<br />
          <span style={{ fontSize: '11px' }}>Rastrear existente: RET-4729 &middot; RET-4732</span>
        </div>

      </div>
    </div>
  );
}

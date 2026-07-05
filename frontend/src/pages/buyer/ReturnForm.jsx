import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import BuyerLayout from '../../components/BuyerLayout';

const REASON_OPTIONS = [
  { value: 'wrong_size',       label: 'Talla incorrecta',        desc: 'El producto no me quedó bien' },
  { value: 'defective',        label: 'Producto defectuoso',      desc: 'Llegó con fallas o daños' },
  { value: 'not_as_described', label: 'No cumplió lo esperado',   desc: 'Diferente a la descripción o fotos' },
  { value: 'other',            label: 'Otro motivo',              desc: 'Especifica en el comentario' },
];

export default function ReturnForm() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const state     = location.state;

  const [reason, setReason]   = useState('');
  const [comment, setComment] = useState('');
  const [name, setName]       = useState(state?.buyerName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!state?.item) return <Navigate to="/buyer" replace />;

  const { item, orderNumber } = state;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) { setError('Selecciona un motivo de devolución'); return; }
    if (!name.trim()) { setError('Ingresa tu nombre'); return; }

    setLoading(true);
    setError('');

    const res = await api('/api/buyer/returns', {
      method: 'POST',
      body: JSON.stringify({
        order_item_id: item.id,
        reason,
        comment: comment.trim() || undefined,
        buyer_name: name.trim(),
      }),
    });

    setLoading(false);

    if (res.success) {
      navigate('/buyer/confirm', {
        state: {
          returnCode:   res.data.return_code,
          productName:  item.product_name,
          emojiIcon:    item.emoji_icon,
        },
      });
    } else {
      setError(res.error || 'No se pudo enviar la solicitud');
    }
  }

  return (
    <BuyerLayout>
      <div style={{ background: 'var(--brand)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="header-back" onClick={() => navigate(`/buyer/order/${encodeURIComponent(orderNumber)}`)}>
          &larr; Volver
        </button>
        <span className="header-title" style={{ fontSize: '13px' }}>Solicitar devolución</span>
      </div>

      <div className="buyer-content">
        <div className="content-inner">
          <div className="p-16">

            <div className="detail-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div className="product-thumb">{item.emoji_icon}</div>
              <div>
                <div className="product-name">{item.product_name}</div>
                <div className="product-sub">Talla {item.size}{item.color ? ` · ${item.color}` : ''}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {error && <div className="err-box">{error}</div>}

              <span className="section-label" style={{ display: 'block', marginBottom: '10px' }}>
                Motivo de devolución <span style={{ color: '#E24B4A' }}>*</span>
              </span>

              {REASON_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  className={`policy-option${reason === opt.value ? ' selected' : ''}`}
                  onClick={() => setReason(opt.value)}
                >
                  <div className="policy-radio">
                    {reason === opt.value && <div className="policy-radio-dot" />}
                  </div>
                  <div>
                    <div className="policy-days" style={{ fontSize: '13px' }}>{opt.label}</div>
                    <div className="policy-desc">{opt.desc}</div>
                  </div>
                </div>
              ))}

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Comentario adicional (opcional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  maxLength={500}
                  placeholder="Cuéntanos más detalles sobre el problema..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {comment.length}/500
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tu nombre <span style={{ color: '#E24B4A' }}>*</span></label>
                <input
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading || !reason || !name.trim()}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>

            </form>

          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}

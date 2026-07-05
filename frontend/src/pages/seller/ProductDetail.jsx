import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api(`/api/products/${id}`, {}, token).then(res => {
      if (res.success) {
        setProduct(res.data);
        setVariants(res.data.variants.map(v => ({ ...v })));
      }
    });
  }, [id, token]);

  function updateStock(variantId, value) {
    setVariants(prev =>
      prev.map(v => v.id === variantId ? { ...v, stock: parseInt(value) || 0 } : v)
    );
  }

  async function saveStock() {
    setSaving(true);
    for (const v of variants) {
      await api(`/api/products/${id}/variants/${v.id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: v.stock }),
      }, token);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!product) return (
    <AppLayout>
      <div className="loading">Cargando producto...</div>
    </AppLayout>
  );

  const maxStock = Math.max(...variants.map(v => v.stock), 1);

  return (
    <AppLayout>
      <div className="page-header">
        <button className="header-back" onClick={() => navigate(-1)}>&larr; Volver</button>
        <span className="header-title" style={{ textAlign: 'right' }}>{product.name}</span>
      </div>

      <div className="page-content">
        <div className="content-inner">
          <div className="p-16">
            <div style={{
              background: 'var(--surface3)',
              borderRadius: '14px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '40px',
            }}>
              {product.emoji_icon}
            </div>

            <div style={{ fontFamily: 'var(--font-h)', fontSize: '20px', fontWeight: '700', marginBottom: '2px' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '22px' }}>
              SKU: {product.sku} &middot; {product.is_active ? 'Activo' : 'Inactivo'}
            </div>

            <span className="section-label">Stock por talla</span>

            <div style={{ marginTop: '8px' }}>
              {variants.map(v => {
                const isLow = v.stock <= 5;
                const pct   = Math.round((v.stock / maxStock) * 100);
                return (
                  <div key={v.id} className={`stock-bar-row${isLow ? ' low' : ''}`}>
                    <span className="size-label">{v.size}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%`, background: isLow ? 'var(--gold-dark)' : 'var(--accent)' }}
                      />
                    </div>
                    <input
                      className={`stock-input${isLow ? ' low' : ''}`}
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={e => updateStock(v.id, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-seller"
              style={{ marginTop: '20px' }}
              disabled={saving}
              onClick={saveStock}
            >
              {saving ? 'Guardando...' : saved ? 'Stock guardado' : 'Guardar stock'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

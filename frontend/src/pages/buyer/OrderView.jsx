import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import BuyerLayout from '../../components/BuyerLayout';
import Badge from '../../components/Badge';

const STATUS_LABELS = {
  pending:   'Pendiente',
  reviewing: 'En revisión',
  approved:  'Aprobada',
  rejected:  'Rechazada',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OrderView() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api(`/api/buyer/order/${encodeURIComponent(orderNumber)}`).then(res => {
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.error || 'Pedido no encontrado');
      }
      setLoading(false);
    });
  }, [orderNumber]);

  function handleReturn(item) {
    navigate('/buyer/return/new', {
      state: {
        item: {
          id:           item.id,
          product_name: item.product_name,
          emoji_icon:   item.emoji_icon,
          size:         item.size,
          color:        item.color,
        },
        orderNumber,
        buyerName: order.buyer_name,
      },
    });
  }

  if (loading) {
    return (
      <BuyerLayout>
        <div className="loading">Cargando pedido...</div>
      </BuyerLayout>
    );
  }

  if (error) {
    return (
      <BuyerLayout>
        <div className="content-inner" style={{ padding: '28px 16px' }}>
          <div className="err-box">{error}</div>
          <Link to="/buyer" className="btn btn-outline" style={{ display: 'flex', maxWidth: '300px' }}>
            &larr; Volver al inicio
          </Link>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div style={{ background: 'var(--brand)', padding: '14px 16px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="header-back" onClick={() => navigate('/buyer')}>
          &larr; Inicio
        </button>
        <span className="header-title" style={{ fontSize: '13px' }}>
          Pedido {order.order_number}
        </span>
      </div>

      <div className="buyer-content">
        <div className="content-inner">
          <div className="p-16">

            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-key">Comprador</span>
                <span className="detail-val">{order.buyer_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Tienda</span>
                <span className="detail-val">{order.store_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Fecha del pedido</span>
                <span className="detail-val">{formatDate(order.created_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Política de devolución</span>
                <span className="detail-val">{order.return_policy_days} días</span>
              </div>
            </div>

            <span className="section-label" style={{ marginBottom: '12px' }}>Artículos del pedido</span>

            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {order.items.map((item, i) => {
                const hasReturn  = !!item.return_id;
                const isResolved = item.return_status === 'approved' || item.return_status === 'rejected';
                return (
                  <div
                    key={item.id}
                    className="buyer-item-row"
                    style={{ borderBottom: i < order.items.length - 1 ? '0.5px solid var(--border)' : 'none' }}
                  >
                    <div className="product-thumb" style={{ flexShrink: 0 }}>
                      {item.emoji_icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="product-name">{item.product_name}</div>
                      <div className="product-sub">
                        Talla {item.size}{item.color ? ` · ${item.color}` : ''}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {hasReturn ? (
                        <Link
                          to={`/buyer/track/${item.return_code}`}
                          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}
                        >
                          <Badge status={item.return_status} />
                          <span style={{ fontSize: '10px', color: 'var(--accent2)', fontWeight: '500' }}>Ver estado &rarr;</span>
                        </Link>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ width: 'auto', padding: '0 14px' }}
                          onClick={() => handleReturn(item)}
                        >
                          Devolver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="info-box" style={{ marginTop: '16px' }}>
              Puedes solicitar una devolución dentro de los <strong>{order.return_policy_days} días</strong> posteriores a la compra.
            </div>

          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}

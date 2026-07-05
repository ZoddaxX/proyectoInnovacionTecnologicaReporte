import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

const REASON_LABELS = {
  wrong_size:       'Talla incorrecta',
  defective:        'Producto defectuoso',
  not_as_described: 'No cumplio expectativas',
  other:            'Otro motivo',
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins   = Math.floor(diffMs / 60000);
  if (mins < 60)  return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Ayer';
  return `Hace ${days}d`;
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ReturnRow({ ret, isAlert }) {
  const navigate = useNavigate();

  return (
    <div
      className={`return-row${isAlert ? ' alert' : ''}`}
      onClick={() => navigate(`/seller/returns/${ret.id}`)}
    >
      <div className={`avatar${isAlert ? ' alert' : ''}`}>{initials(ret.buyer_name)}</div>
      <div className="return-info">
        <div className="return-name">{ret.buyer_name}</div>
        <div className="return-sub">
          {ret.emoji_icon} {ret.product_name} &middot; {REASON_LABELS[ret.reason]}
        </div>
      </div>
      <div className="return-meta">
        {isAlert
          ? <span className="badge badge-alert">Alerta</span>
          : <Badge status={ret.status} />
        }
        <span className="return-time">{timeAgo(ret.created_at)}</span>
      </div>
    </div>
  );
}

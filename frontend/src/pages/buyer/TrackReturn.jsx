import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import BuyerLayout from '../../components/BuyerLayout';

const REASON_LABELS = {
  wrong_size:       'Talla incorrecta',
  defective:        'Producto defectuoso',
  not_as_described: 'No cumplió lo esperado',
  other:            'Otro motivo',
};

const STATUS_LABELS = {
  pending:   'Solicitud recibida',
  reviewing: 'En revisión',
  approved:  'Aprobada',
  rejected:  'Rechazada',
};

const STATUS_DESC = {
  pending:   'Tu solicitud fue recibida y está esperando revisión por la tienda.',
  reviewing: 'La tienda está revisando tu solicitud de devolución.',
  approved:  'Tu devolución fue aprobada. La tienda se pondrá en contacto contigo.',
  rejected:  'La tienda rechazó esta solicitud de devolución.',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function BuyerTimeline({ status, createdAt, events }) {
  const statusOrder = ['pending', 'reviewing', 'approved', 'rejected'];

  const reviewingEvent = events.find(e =>
    e.description.toLowerCase().includes('revisión') || e.description.toLowerCase().includes('revision')
  );
  const decisionEvent = events.find(e =>
    e.description.toLowerCase().includes('aprobad') || e.description.toLowerCase().includes('rechazad')
  );

  const step1Done = true;
  const step2Done = status === 'reviewing' || status === 'approved' || status === 'rejected';
  const step2Current = status === 'pending';
  const step3Done = status === 'approved' || status === 'rejected';
  const step3Current = status === 'reviewing';

  const steps = [
    {
      label:   'Solicitud recibida',
      state:   step1Done ? 'done' : 'pending',
      time:    formatDate(createdAt),
    },
    {
      label:   'En revisión por la tienda',
      state:   step2Done ? 'done' : step2Current ? 'current' : 'pending',
      time:    step2Done && reviewingEvent
        ? formatDate(reviewingEvent.created_at)
        : step2Done ? 'Completado' : step2Current ? 'Próximamente' : 'Pendiente',
    },
    {
      label:   status === 'approved' ? 'Devolución aprobada'
             : status === 'rejected' ? 'Solicitud rechazada'
             : 'Decisión de la tienda',
      state:   step3Done ? 'done' : step3Current ? 'current' : 'pending',
      time:    step3Done && decisionEvent
        ? formatDate(decisionEvent.created_at)
        : step3Done ? 'Completado' : step3Current ? 'En proceso' : 'Pendiente',
    },
  ];

  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div className="tl-item" key={step.label}>
          <div className="tl-col">
            <div className={`tl-dot ${step.state}`} />
            {i < steps.length - 1 && <div className="tl-line" />}
          </div>
          <div className="tl-content">
            <div className={`tl-label${step.state === 'pending' ? ' pending' : ''}`}>{step.label}</div>
            <div className="tl-time">{step.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrackReturn() {
  const { returnCode } = useParams();
  const navigate = useNavigate();
  const [ret, setRet]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api(`/api/buyer/returns/${encodeURIComponent(returnCode)}`).then(res => {
      if (res.success) {
        setRet(res.data);
      } else {
        setError(res.error || 'Código no encontrado');
      }
      setLoading(false);
    });
  }, [returnCode]);

  if (loading) {
    return (
      <BuyerLayout>
        <div className="loading">Cargando devolución...</div>
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
      <div style={{ background: 'var(--brand)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="header-back" onClick={() => navigate('/buyer')}>
          &larr; Inicio
        </button>
        <span className="header-title" style={{ fontSize: '13px', flex: 1 }}>{ret.return_code}</span>
        <span className={`badge badge-${ret.status}`}>{STATUS_LABELS[ret.status]}</span>
      </div>

      <div className="buyer-content">
        <div className="content-inner">
          <div className="p-16">

            <div className="detail-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div className="product-thumb">{ret.emoji_icon}</div>
              <div style={{ flex: 1 }}>
                <div className="product-name">{ret.product_name}</div>
                <div className="product-sub">
                  Talla {ret.size}{ret.color ? ` · ${ret.color}` : ''} &middot; {ret.store_name}
                </div>
              </div>
            </div>

            <div className={`buyer-status-banner status-${ret.status}`}>
              <div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>
                  {STATUS_LABELS[ret.status]}
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                  {STATUS_DESC[ret.status]}
                </div>
              </div>
            </div>

            <span className="section-label" style={{ display: 'block', marginBottom: '12px' }}>Seguimiento</span>
            <BuyerTimeline
              status={ret.status}
              createdAt={ret.created_at}
              events={ret.events || []}
            />

            <hr className="divider" />

            <span className="section-label" style={{ display: 'block', marginBottom: '8px' }}>Detalles de la solicitud</span>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-key">Motivo</span>
                <span className="detail-val">{REASON_LABELS[ret.reason]}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Solicitante</span>
                <span className="detail-val">{ret.buyer_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Fecha de solicitud</span>
                <span className="detail-val">{formatDate(ret.created_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Política de devolución</span>
                <span className="detail-val">{ret.return_policy_days} días</span>
              </div>
            </div>

            {ret.comment && (
              <>
                <span className="section-label" style={{ display: 'block', marginBottom: '8px' }}>Comentario</span>
                <div className="comment-box">&ldquo;{ret.comment}&rdquo;</div>
              </>
            )}

          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}

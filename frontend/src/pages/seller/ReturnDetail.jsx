import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import Badge from '../../components/Badge';
import Timeline from '../../components/Timeline';

const REASON_LABELS = {
  wrong_size:       'Talla incorrecta',
  defective:        'Producto defectuoso',
  not_as_described: 'No cumplio expectativas',
  other:            'Otro motivo',
};

export default function ReturnDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [tab, setTab] = useState('info');
  const [action, setAction] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api(`/api/returns/${id}`, {}, token).then(res => {
      if (res.success) setRet(res.data);
    });
  }, [id, token]);

  async function handleAction(status) {
    setLoading(true);
    const res = await api(`/api/returns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    }, token);
    if (res.success) {
      setAction(null);
      setComment('');
      const updated = await api(`/api/returns/${id}`, {}, token);
      if (updated.success) setRet(updated.data);
    }
    setLoading(false);
  }

  if (!ret) return (
    <AppLayout>
      <div className="loading">Cargando...</div>
    </AppLayout>
  );

  const canAct = ret.status !== 'approved' && ret.status !== 'rejected';

  return (
    <AppLayout>
      <div className="page-header gold">
        <button className="header-back" onClick={() => navigate(-1)}>&larr; Volver</button>
        <span className="header-title" style={{ textAlign: 'right' }}>#{ret.return_code}</span>
        <Badge status={ret.status} />
      </div>

      <div className="page-content">
        <div className="content-inner">
          <div className="tabs-bar" style={{ justifyContent: 'center' }}>
            <div className={`tab-item${tab === 'info' ? ' active' : ''}`} onClick={() => setTab('info')}>
              Informacion
            </div>
            <div className={`tab-item${tab === 'timeline' ? ' active' : ''}`} onClick={() => setTab('timeline')}>
              Seguimiento
            </div>
          </div>

          <div className="p-16">
            {tab === 'info' && (
              <>
                <div className="detail-card">
                  <div className="detail-row">
                    <span className="detail-key">Comprador</span>
                    <span className="detail-val">{ret.buyer_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Producto</span>
                    <span className="detail-val">{ret.emoji_icon} {ret.product_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Talla</span>
                    <span className="detail-val">{ret.size}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Orden</span>
                    <span className="detail-val" style={{ color: 'var(--gold-dark)' }}>#{ret.order_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Motivo</span>
                    <span className="detail-val">{REASON_LABELS[ret.reason]}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Fecha</span>
                    <span className="detail-val">{new Date(ret.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Estado</span>
                    <span className="detail-val"><Badge status={ret.status} /></span>
                  </div>
                </div>

                {ret.comment && (
                  <>
                    <span className="section-label">Comentario del comprador</span>
                    <div className="comment-box">"{ret.comment}"</div>
                  </>
                )}

                {canAct && !action && (
                  <>
                    <div className="btn-row">
                      <button className="btn btn-approve" onClick={() => setAction('approved')}>Aprobar</button>
                      <button className="btn btn-reject"  onClick={() => setAction('rejected')}>Rechazar</button>
                    </div>
                    <button className="btn btn-outline" onClick={() => setAction('reviewing')}>
                      Solicitar mas informacion
                    </button>
                  </>
                )}

                {action && (
                  <div style={{ marginTop: '6px' }}>
                    <div className={action === 'rejected' ? 'err-box' : 'info-box'}>
                      {action === 'approved'  && 'Se notificara al comprador que su devolucion fue aprobada.'}
                      {action === 'rejected'  && 'La devolucion sera rechazada. Puedes agregar un motivo.'}
                      {action === 'reviewing' && 'Se solicitara informacion adicional al comprador.'}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comentario (opcional)</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Mensaje para el comprador..."
                      />
                    </div>
                    <div className="btn-row">
                      <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setAction(null)}>
                        Cancelar
                      </button>
                      <button
                        className={`btn btn-sm ${action === 'rejected' ? 'btn-reject' : 'btn-approve'}`}
                        style={{ flex: 2 }}
                        disabled={loading}
                        onClick={() => handleAction(action)}
                      >
                        {loading ? 'Guardando...' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                )}

                {!canAct && (
                  <div className="info-box">
                    Esta devolucion ya fue {ret.status === 'approved' ? 'aprobada' : 'rechazada'}.
                  </div>
                )}
              </>
            )}

            {tab === 'timeline' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '15px', fontWeight: '700' }}>
                      #{ret.return_code}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                      {ret.buyer_name} &middot; {ret.product_name}
                    </div>
                  </div>
                  <Badge status={ret.status} />
                </div>
                <Timeline events={ret.events || []} status={ret.status} />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

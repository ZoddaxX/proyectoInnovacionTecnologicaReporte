import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const REASON_KEYS   = ['wrong_size', 'defective', 'not_as_described', 'other'];
const REASON_LABELS = {
  wrong_size:       'Talla incorrecta',
  defective:        'Producto defectuoso',
  not_as_described: 'No cumplio expectativas',
  other:            'Otro',
};
const REASON_COLORS = {
  wrong_size:       '#E24B4A',
  defective:        'var(--gold)',
  not_as_described: '#74C0FC',
  other:            'var(--text3)',
};

export default function Alerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReports, setAiReports] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const analyzeWithIA = async (alert) => {
    setAiLoading(prev => ({ ...prev, [alert.id]: true }));
    try {
      const res = await api('/api/ia/analyze-alert', {
        method: 'POST',
        body: JSON.stringify({ product: alert })
      }, token);
      if (res.success) {
        setAiReports(prev => ({ ...prev, [alert.id]: res.data }));
        await api(`/api/products/${alert.id}/ai-report`, {
          method: 'PUT',
          body: JSON.stringify(res.data)
        }, token);
      }
    } catch (err) {
      console.error('Error analyzing with IA:', err);
    }
    setAiLoading(prev => ({ ...prev, [alert.id]: false }));
  };

  useEffect(() => {
    api('/api/returns/alerts', {}, token).then(res => {
      if (res.success) {
        setAlerts(res.data);
        const initialReports = {};
        res.data.forEach(a => {
          if (a.ai_report) initialReports[a.id] = a.ai_report;
        });
        setAiReports(initialReports);
      }
      setLoading(false);
    });
  }, [token]);

  return (
    <AppLayout>
      <div className="page-header">
        <span className="header-title">Alertas de producto</span>
        {alerts.length > 0 && (
          <span className="badge badge-alert">{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>
        )}
      </div>

      <div className="page-content">
        <div className="content-inner">
          <div className="p-16">
            {loading && <div className="loading">Cargando...</div>}

            {!loading && alerts.length === 0 && (
              <div className="info-box">
                Sin alertas activas. Ningun producto supera 5 devoluciones en los ultimos 30 dias.
              </div>
            )}

            {alerts.map(alert => {
              const total = parseInt(alert.total_returns);
              return (
                <div key={alert.id}>
                  <div className="alert-box">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <circle cx="8" cy="8" r="7" fill="#E24B4A"/>
                      <path d="M8 4v4M8 10.5v1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div style={{ fontSize: '13px' }}>
                      <strong>{alert.emoji_icon} {alert.name}</strong> acumula{' '}
                      <strong>{total} devoluciones</strong> en los ultimos 30 dias.
                      Se recomienda revisar la descripcion o la guia de tallas.
                    </div>
                  </div>

                  <div className="alert-product-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '16px', fontWeight: '700' }}>
                        {alert.emoji_icon} {alert.name}
                      </div>
                      <span className="badge badge-alert">{total} devoluciones</span>
                    </div>

                    <span className="section-label">Motivos principales</span>

                    <div style={{ marginTop: '8px' }}>
                      {REASON_KEYS.map(key => {
                        const count = parseInt(alert[key]) || 0;
                        if (!count) return null;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={key} className="reason-bar-row">
                            <div className="reason-label-row">
                              <span>{REASON_LABELS[key]}</span>
                              <span className="reason-pct">{pct}%</span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--surface3)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: REASON_COLORS[key],
                                borderRadius: '3px',
                                transition: 'width 0.4s',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      {!aiReports[alert.id] && !aiLoading[alert.id] && (
                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onClick={() => analyzeWithIA(alert)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          Generar Análisis de IA
                        </button>
                      )}

                      {aiLoading[alert.id] && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div className="spinner" style={{ width: '24px', height: '24px', border: '2px solid var(--surface3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                          Analizando patrones con IA...
                        </div>
                      )}

                      {!aiLoading[alert.id] && aiReports[alert.id] && (
                        <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '16px', border: '1px solid var(--accent)', boxShadow: '0 0 10px rgba(183, 150, 255, 0.1)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Análisis de IA
                          </div>
                          
                          <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                            {aiReports[alert.id].resumen}
                          </div>

                          <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Causas Probables</div>
                          <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text2)' }}>
                            {aiReports[alert.id].causas.map((c, i) => (
                              <li key={i} style={{ marginBottom: '6px' }}>
                                <strong style={{ color: 'var(--text1)' }}>{c.titulo}:</strong> {c.descripcion}
                              </li>
                            ))}
                          </ul>

                          <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recomendaciones</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            {aiReports[alert.id].recomendaciones.map((r, i) => {
                              const badgeColor = r.prioridad.toLowerCase() === 'alta' ? '#E24B4A' : r.prioridad.toLowerCase() === 'media' ? 'var(--gold)' : '#74C0FC';
                              return (
                                <div key={i} style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '6px', borderLeft: `3px solid ${badgeColor}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{r.accion}</span>
                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', background: badgeColor, color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                      {r.prioridad}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{r.detalle}</div>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text3)', textAlign: 'center', marginBottom: '16px' }}>
                            "{aiReports[alert.id].conclusion}"
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-seller"
                              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                              onClick={() => analyzeWithIA(alert)}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                              Regenerar Análisis
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

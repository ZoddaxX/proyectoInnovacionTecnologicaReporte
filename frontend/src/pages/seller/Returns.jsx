import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';
import ReturnRow from '../../components/ReturnRow';

const TABS = [
  { key: 'all',      label: 'Todas' },
  { key: 'pending',  label: 'Pendientes' },
  { key: 'resolved', label: 'Resueltas' },
];

export default function Returns() {
  const { token } = useAuth();
  const [returns, setReturns] = useState([]);
  const [hotProductIds, setHotProductIds] = useState(new Set());
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/returns', {}, token),
      api('/api/returns/alerts', {}, token),
    ]).then(([returnsRes, alertsRes]) => {
      if (returnsRes.success) setReturns(returnsRes.data);
      if (alertsRes.success) {
        setHotProductIds(new Set(alertsRes.data.map(a => String(a.id))));
      }
      setLoading(false);
    });
  }, [token]);

  function isAlert(ret) {
    return ret.status === 'pending' && hotProductIds.has(String(ret.product_id));
  }

  const all      = returns;
  const pending  = returns.filter(r => r.status === 'pending' || r.status === 'reviewing');
  const resolved = returns.filter(r => r.status === 'approved' || r.status === 'rejected');
  const alertCount = returns.filter(isAlert).length;

  const visible = tab === 'all' ? all : tab === 'pending' ? pending : resolved;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="header-logo">Return<span>IQ</span></div>
        <span className="badge badge-seller">Vendedor</span>
      </div>

      <div className="page-content">
        <div className="content-inner">
          <div className="stat-grid">
            <StatCard number={all.length}      label="Total" />
            <StatCard number={pending.length}  label="Pendientes" color="var(--gold-dark)" />
            <StatCard number={resolved.length} label="Resueltas"  color="var(--accent2)" />
            <StatCard number={alertCount}      label="Alertas"    color="#E24B4A" />
          </div>

          <div className="tabs-bar">
            {TABS.map(t => (
              <div
                key={t.key}
                className={`tab-item${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </div>
            ))}
          </div>

          {loading && <div className="loading">Cargando devoluciones...</div>}

          {!loading && visible.length === 0 && (
            <div className="loading">Sin devoluciones en esta categoria.</div>
          )}

          {!loading && visible.map(r => (
            <ReturnRow key={r.id} ret={r} isAlert={isAlert(r)} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

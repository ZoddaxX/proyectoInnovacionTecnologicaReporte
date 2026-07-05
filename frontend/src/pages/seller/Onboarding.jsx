import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';

const POLICIES = [
  { days: 7,  desc: 'Ideal para productos digitales o consumibles' },
  { days: 15, desc: 'Politica estandar corta' },
  { days: 30, desc: 'Recomendado para e-commerce general' },
  { days: 60, desc: 'Politica premium para fidelizacion' },
];

export default function Onboarding() {
  const { token, markHasStore } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [policyDays, setPolicyDays] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState(null);

  function handleNameChange(val) {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  async function handleCreate() {
    setError('');
    setLoading(true);
    try {
      const res = await api('/api/stores', {
        method: 'POST',
        body: JSON.stringify({ name, slug, return_policy_days: policyDays }),
      }, token);
      if (!res.success) { setError(res.error); return; }
      setStoreData(res.data);
      markHasStore();
      setStep(3);
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  }

  const stepDots = [1, 2, 3].map(s => (
    <div key={s} className={`step-dot${s < step ? ' done' : s === step ? ' active' : ''}`} />
  ));

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div className="onboarding-card-header">
          <span style={{ fontFamily: 'var(--font-h)', fontSize: '17px', fontWeight: '700', color: '#fff' }}>
            Return<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
          <span className="badge badge-seller">Vendedor</span>
        </div>

        <div className="onboarding-card-body">
          <div className="stepper-dots">{stepDots}</div>

          {step === 1 && (
            <>
              <div className="onboarding-section-title">Crea tu tienda</div>
              <div className="onboarding-section-sub">
                Ingresa los datos basicos de tu tienda. Podras cambiarlos despues.
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '33%' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la tienda</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ej: Nike Store Chile"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de tu tienda</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', fontSize: '12px',
                    color: 'var(--text3)', pointerEvents: 'none',
                  }}>
                    returniq.com/
                  </span>
                  <input
                    className="form-input"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="mi-tienda"
                    style={{ paddingLeft: '120px' }}
                  />
                </div>
              </div>

              {error && <div className="err-box">{error}</div>}

              <button className="btn btn-seller" disabled={!name || !slug} onClick={() => setStep(2)}>
                Siguiente &rarr;
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="onboarding-section-title">Politica de devoluciones</div>
              <div className="onboarding-section-sub">
                Dias que tienen los compradores para solicitar una devolucion desde que reciben su pedido.
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '66%' }} />
              </div>

              {POLICIES.map(p => (
                <div
                  key={p.days}
                  className={`policy-option${policyDays === p.days ? ' selected' : ''}`}
                  onClick={() => setPolicyDays(p.days)}
                >
                  <div className="policy-radio">
                    {policyDays === p.days && <div className="policy-radio-dot" />}
                  </div>
                  <div>
                    <div className="policy-days">{p.days} dias</div>
                    <div className="policy-desc">{p.desc}</div>
                  </div>
                </div>
              ))}

              {error && <div className="err-box">{error}</div>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  &larr; Volver
                </button>
                <button className="btn btn-seller" style={{ flex: 2 }} disabled={loading} onClick={handleCreate}>
                  {loading ? 'Creando...' : 'Crear tienda'}
                </button>
              </div>
            </>
          )}

          {step === 3 && storeData && (
            <div className="text-center">
              <div style={{ margin: '12px 0 20px' }}>
                <div className="success-icon" style={{ background: 'var(--gold-soft)', border: '2px solid var(--gold-dark)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 8" stroke="#B7791F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>
                  Tienda creada
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
                  {storeData.name} ya esta activa en ReturnIQ
                </div>
              </div>

              <div className="detail-card" style={{ textAlign: 'left' }}>
                <div className="detail-row">
                  <span className="detail-key">Tienda</span>
                  <span className="detail-val">{storeData.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">URL</span>
                  <span className="detail-val" style={{ color: 'var(--gold-dark)' }}>{storeData.slug}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Politica</span>
                  <span className="detail-val">{storeData.return_policy_days} dias</span>
                </div>
              </div>

              <button
                className="btn btn-seller"
                onClick={() => navigate('/seller/returns', { replace: true })}
              >
                Ir al dashboard &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

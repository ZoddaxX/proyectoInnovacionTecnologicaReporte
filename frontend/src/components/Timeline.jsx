import React from 'react';

const STEPS = [
  'Solicitud recibida',
  'Revisión iniciada',
  'En espera de decisión',
  'Aprobación / Rechazo',
  'Devolución coordinada',
];

function getStepState(stepLabel, events, status) {
  const found = events.find(e =>
    e.description.toLowerCase().includes(stepLabel.toLowerCase().split(' ')[0].toLowerCase())
  );
  if (found) return { state: 'done', time: new Date(found.created_at).toLocaleString('es-CL') };

  if (stepLabel === 'En espera de decisión' && status === 'reviewing') {
    return { state: 'current', time: 'En curso' };
  }
  if (stepLabel === 'Aprobación / Rechazo' && (status === 'approved' || status === 'rejected')) {
    return { state: 'done', time: '' };
  }
  return { state: 'pending', time: 'Pendiente' };
}

export default function Timeline({ events = [], status }) {
  return (
    <div className="timeline">
      {STEPS.map((step, i) => {
        const { state, time } = getStepState(step, events, status);
        const isLast = i === STEPS.length - 1;
        return (
          <div className="tl-item" key={step}>
            <div className="tl-col">
              <div className={`tl-dot ${state}`} />
              {!isLast && <div className="tl-line" />}
            </div>
            <div className="tl-content">
              <div className={`tl-label${state === 'pending' ? ' pending' : ''}`}>{step}</div>
              {time && <div className="tl-time">{time}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

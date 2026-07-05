import React from 'react';

const STATUS_MAP = {
  pending:   { cls: 'badge-pending',   label: 'Pendiente' },
  reviewing: { cls: 'badge-reviewing', label: 'En revisión' },
  approved:  { cls: 'badge-approved',  label: 'Aprobada' },
  rejected:  { cls: 'badge-rejected',  label: 'Rechazada' },
};

export default function Badge({ status }) {
  const { cls, label } = STATUS_MAP[status] || { cls: 'badge-reviewing', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

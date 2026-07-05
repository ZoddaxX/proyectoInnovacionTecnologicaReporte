import React from 'react';

export default function StatCard({ number, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-number" style={color ? { color } : {}}>{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

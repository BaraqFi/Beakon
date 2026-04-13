import React from 'react';

const COLORS = {
  campaign:  { bg: 'rgba(139, 92, 246, 0.2)',  text: '#c4b5fd' },
  sales:     { bg: 'rgba(6, 182, 212, 0.2)',    text: '#67e8f9' },
  event:     { bg: 'rgba(16, 185, 129, 0.2)',   text: '#6ee7b7' },
  content:   { bg: 'rgba(245, 158, 11, 0.2)',   text: '#fcd34d' },
  growth:    { bg: 'rgba(236, 72, 153, 0.2)',   text: '#f9a8d4' },
  marketing: { bg: 'rgba(99, 102, 241, 0.2)',   text: '#a5b4fc' },
  social:    { bg: 'rgba(244, 63, 94, 0.2)',    text: '#fda4af' },
  docs:      { bg: 'rgba(148, 163, 184, 0.2)',  text: '#cbd5e1' },
  product:   { bg: 'rgba(168, 85, 247, 0.2)',   text: '#d8b4fe' },
  active:    { bg: 'rgba(16, 185, 129, 0.2)',   text: '#34d399' },
  paused:    { bg: 'rgba(245, 158, 11, 0.2)',   text: '#fbbf24' },
};

const DEFAULT_COLOR = { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };

const Badge = ({ label, type }) => {
  const color = COLORS[type?.toLowerCase()] || DEFAULT_COLOR;
  return (
    <span
      className="badge"
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: color.bg,
        color: color.text,
        lineHeight: '1.6',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};

export default Badge;

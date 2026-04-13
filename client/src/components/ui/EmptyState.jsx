import React from 'react';

const EmptyState = ({ icon = 'fas fa-inbox', title = 'No data yet', description, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        color: '#6B7280',
      }}
    >
      <i
        className={icon}
        style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}
      />
      <div style={{ fontSize: '18px', fontWeight: 600, color: '#D1D5DB', marginBottom: '8px' }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: '14px', maxWidth: '360px', lineHeight: '1.5' }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;

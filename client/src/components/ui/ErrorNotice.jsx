import React from 'react';

const ErrorNotice = ({ message, onRetry }) => {
    if (!message) return null;

    return (
        <div style={{
            marginBottom: '16px',
            padding: '12px 14px',
            border: '1px solid #DC2626',
            borderRadius: '8px',
            background: '#2A1417',
            color: '#FCA5A5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
        }}>
            <span>{message}</span>
            {onRetry && (
                <button className="btn-ghost" onClick={onRetry}>
                    Retry
                </button>
            )}
        </div>
    );
};

export default ErrorNotice;

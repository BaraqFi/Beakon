import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0F1117',
        }}>
            <div style={{
                background: '#1A2235',
                border: '1px solid #252836',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                maxWidth: '440px',
            }}>
                <div style={{
                    fontSize: '64px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '16px',
                }}>
                    404
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#F8FAFC', marginBottom: '8px' }}>
                    Page not found
                </h1>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button 
                    className="btn-primary"
                    onClick={() => navigate('/')}
                    style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                        color: '#F8FAFC',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;

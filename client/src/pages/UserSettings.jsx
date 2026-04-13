import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const UserSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [apiKey, setApiKey] = useState('sk_live_abc123def456ghi789jkl012mno345pqr678stu');
    const [name, setName] = useState(user?.name || 'Alex Morgan');
    const [email, setEmail] = useState(user?.email || 'alex.morgan@example.com');
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Delete account flow
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    const handleSave = () => {
        setSaveLoading(true);
        setTimeout(() => {
            setSaveLoading(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const handleRegenerate = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let newKey = 'sk_live_';
        for (let i = 0; i < 40; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
        setApiKey(newKey);
        setIsApiKeyVisible(true);
    };

    const handleDeleteAccount = () => {
        if (deleteInput === 'DELETE') {
            logout();
            navigate('/');
        }
    };

    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Settings</h1>
            </header>

            {/* Save success toast */}
            {saveSuccess && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', background: '#1A2235',
                    border: '1px solid #10B981', borderRadius: '8px', padding: '12px 20px',
                    color: '#10B981', fontSize: '13px', fontWeight: '600', zIndex: 1000,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                    <i className="fas fa-check-circle"></i>
                    Profile updated
                </div>
            )}

            <div className="settings-container">
                {/* Profile Section */}
                <div className="settings-card">
                    <h2 className="card-title">Profile</h2>
                    <div className="profile-row">
                        <div className="profile-avatar">{user?.initials || 'AM'}</div>
                        <div className="profile-inputs">
                            <div className="input-group">
                                <label className="input-label">Name</label>
                                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading} style={saveLoading ? { opacity: 0.7 } : {}}>
                        <i className="fas fa-check"></i>
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Short Domain Section */}
                <div className="settings-card">
                    <h2 className="card-title">Short Domain</h2>
                    <div className="input-group">
                        <label className="input-label">Your short domain</label>
                        <div className="input-wrapper">
                            <input type="text" className="input-field monospace" defaultValue="bkn.so" disabled />
                            <i className="fas fa-lock input-icon"></i>
                        </div>
                        <div className="domain-info">
                            Custom domains available on the Business plan. <a href="#" className="upgrade-link">Upgrade</a>
                        </div>
                    </div>
                </div>

                {/* API Access Section */}
                <div className="settings-card">
                    <h2 className="card-title">API Access</h2>
                    <div className="input-group">
                        <label className="input-label">API Key</label>
                        <input 
                            type={isApiKeyVisible ? "text" : "password"} 
                            className="input-field monospace" 
                            value={apiKey}
                            readOnly
                        />
                        <div className="api-controls">
                            <button className="btn btn-ghost" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}>
                                <i className={`fas ${isApiKeyVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                <span>{isApiKeyVisible ? 'Hide' : 'Reveal'}</span>
                            </button>
                            <button className="btn btn-ghost" onClick={handleRegenerate}>
                                <i className="fas fa-rotate"></i>
                                Regenerate
                            </button>
                        </div>
                        <div className="api-helper">
                            Keep your API key secret. Do not share it publicly.
                        </div>
                    </div>
                </div>

                {/* Danger Zone Section */}
                <div className="settings-card danger">
                    <h2 className="card-title danger">Danger Zone</h2>
                    <p className="warning-text">
                        Permanently deletes your account, all links, and analytics data. This action cannot be undone.
                    </p>
                    {!showDeleteConfirm ? (
                        <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                            <i className="fas fa-trash"></i>
                            Delete Account
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '13px', color: '#6B7280' }}>
                                Type <strong style={{ color: '#DC2626' }}>DELETE</strong> to confirm:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder="DELETE"
                                    style={{ flex: 1, maxWidth: '200px' }}
                                    autoFocus
                                />
                                <button 
                                    className="btn btn-danger" 
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== 'DELETE'}
                                    style={deleteInput !== 'DELETE' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                >
                                    Confirm
                                </button>
                                <button className="btn btn-ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserSettings;

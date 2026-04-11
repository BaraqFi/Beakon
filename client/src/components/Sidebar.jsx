import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const [showPopover, setShowPopover] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <Link to="/links" className="logo" style={{ textDecoration: 'none' }}>
                <div className="logo-icon">
                    <i className="fas fa-tower-broadcast"></i>
                </div>
                <div className="logo-text">Beakon</div>
            </Link>

            <nav className="nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-chart-line"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/links" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-link"></i>
                    <span>Links</span>
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-chart-bar"></i>
                    <span>Analytics</span>
                </NavLink>
                <NavLink to="/audiences" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-users"></i>
                    <span>Audiences</span>
                </NavLink>

                <div className="nav-divider"></div>

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                </NavLink>
                <a href="#" className="nav-item">
                    <i className="fas fa-book"></i>
                    <span>Docs</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="fas fa-file-lines"></i>
                    <span>Changelog</span>
                </a>
            </nav>

            <div className="sidebar-user" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowPopover(!showPopover)}>
                <div className="user-avatar">{user?.initials || 'AM'}</div>
                <div className="user-info">
                    <div className="user-name">{user?.name || 'Alex Morgan'}</div>
                    <span className="user-plan">{user?.plan || 'Pro'} Plan</span>
                </div>

                {showPopover && (
                    <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '0',
                        right: '0',
                        marginBottom: '8px',
                        background: '#1A2235',
                        border: '1px solid #252836',
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 50,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowPopover(false); navigate('/settings'); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                width: '100%', padding: '10px 12px', background: 'none',
                                border: 'none', color: '#D1D5DB', fontSize: '13px',
                                cursor: 'pointer', borderRadius: '6px', textAlign: 'left',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#252836'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <i className="fas fa-user" style={{ width: '16px', color: '#6B7280' }}></i>
                            Profile
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                width: '100%', padding: '10px 12px', background: 'none',
                                border: 'none', color: '#DC2626', fontSize: '13px',
                                cursor: 'pointer', borderRadius: '6px', textAlign: 'left',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#252836'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <i className="fas fa-sign-out-alt" style={{ width: '16px' }}></i>
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;

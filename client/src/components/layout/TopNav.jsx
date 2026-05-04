import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const TopNav = () => {
    const { isLoggedIn } = useAuth();
    return (
        <nav className="top-nav">
            <Link to="/" className="top-nav-logo">
                <div className="logo-icon">
                    <img src="/transparentLogo.png" alt="Beakon Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="logo-text">Beakon</div>
            </Link>
            <div className="nav-actions">
                {isLoggedIn ? (
                    <Link to="/dashboard" className="btn-primary nav-auth-btn">Dashboard</Link>
                ) : (
                    <>
                        <Link to="/login" className="btn-ghost nav-auth-btn">Log in</Link>
                        <Link to="/signup" className="btn-primary nav-auth-btn">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default TopNav;

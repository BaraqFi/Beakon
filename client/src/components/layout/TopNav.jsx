import React from 'react';
import { Link } from 'react-router-dom';

const TopNav = () => {
    return (
        <nav className="top-nav">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                <div className="logo-icon">
                    <i className="fas fa-tower-broadcast"></i>
                </div>
                <div className="logo-text">Beakon</div>
            </Link>
            <div className="nav-actions">
                <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Log in</Link>
                <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Get Started</Link>
            </div>
        </nav>
    );
};

export default TopNav;

import React from 'react';
import { Link } from 'react-router-dom';

const TopNav = () => {
    return (
        <nav className="top-nav">
            <Link to="/" className="top-nav-logo">
                <div className="logo-icon">
                    <i className="fas fa-tower-broadcast"></i>
                </div>
                <div className="logo-text">Beakon</div>
            </Link>
            <div className="nav-actions">
                <Link to="/login" className="btn-ghost nav-auth-btn">Log in</Link>
                <Link to="/signup" className="btn-primary nav-auth-btn">Get Started</Link>
            </div>
        </nav>
    );
};

export default TopNav;

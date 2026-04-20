import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <Link to="/" className="footer-logo" style={{ textDecoration: 'none' }}>
                    <div className="logo-icon">
                        <img src="/transparentLogo.png" alt="Beakon Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="logo-text">Beakon</div>
                </Link>
                <div className="footer-links">
                    <a href="#" className="footer-link">Features</a>
                    <a href="#" className="footer-link">Pricing</a>
                    <a href="#" className="footer-link">Docs</a>
                    <Link to="/login" className="footer-link">Log in</Link>
                    <Link to="/signup" className="footer-link">Sign up</Link>
                </div>
                <div className="footer-copy">
                    © 2024 Beakon Analytics
                </div>
            </div>
        </footer>
    );
};

export default Footer;

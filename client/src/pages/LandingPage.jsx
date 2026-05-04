import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/layout/TopNav';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import useClipboard from '../hooks/useClipboard';
import useAuth from '../hooks/useAuth';
import { buildShortUrl } from '../utils/shortUrl';

const LandingPage = () => {
    const { isLoggedIn } = useAuth();
    const [urlInput, setUrlInput] = useState('');
    const [shake, setShake] = useState(false);
    const [createdGuestLink, setCreatedGuestLink] = useState(null);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();
    const { copied, copy } = useClipboard();

    const handleShorten = async () => {
        if (!urlInput.trim()) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        setCreating(true);
        try {
            const { data } = await api.post('/api/links/guest', {
                originalUrl: urlInput.trim()
            });

            const raw = data.link;
            const guestLink = {
                id: raw._id,
                shortCode: raw.shortCode,
                shortUrl: buildShortUrl(raw.shortCode),
                destinationUrl: raw.originalUrl,
                createdAt: raw.createdAt
            };
            setCreatedGuestLink(guestLink);

            const existing = JSON.parse(localStorage.getItem('beakon_guest_links') || '[]');
            localStorage.setItem('beakon_guest_links', JSON.stringify([guestLink, ...existing]));
        } catch (error) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <TopNav />
            
            <section className="hero-stage">
                <img src="/hero.PNG" alt="" className="hero-bg-image" aria-hidden="true" />

                <section className="hero-section">
                    <h1 className="hero-headline">Know if your link is actually being clicked.</h1>
                    <p className="hero-subtitle">Share a link, then see if they actually opened it — perfect for pitches, demos, and follow-ups where you need to know who engaged.</p>
                    
                    <div className="input-container">
                        <div 
                            className="input-bar" 
                            style={shake ? { animation: 'shake 0.5s ease-in-out', borderColor: '#DC2626' } : {}}
                        >
                            <input 
                                type="text" 
                                className="url-input" 
                                placeholder="Paste your destination URL…" 
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                            />
                            <button className="btn-shorten" onClick={handleShorten} disabled={creating}>
                                {creating ? 'Creating...' : 'Shorten & Track'}
                            </button>
                        </div>
                        {createdGuestLink ? (
                            <div className="guest-link-result-panel">
                                <div className="guest-link-result-header">
                                    <span className="guest-link-result-badge">
                                        <i className="fas fa-check-circle" aria-hidden="true"></i>
                                        Link created
                                    </span>
                                </div>
                                <div className="guest-link-result-url-row">
                                    <span className="guest-link-result-url" title={createdGuestLink.shortUrl}>{createdGuestLink.shortUrl}</span>
                                    <button className="btn-ghost guest-link-action-btn" onClick={() => copy(createdGuestLink.shortUrl)}>
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="guest-link-result-actions">
                                    <button className="btn-ghost guest-link-action-btn" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}>
                                        {isLoggedIn ? 'Go to Dashboard' : 'Sign up to view analytics'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="helper-text">Free to start. No credit card required.</p>
                        )}
                    </div>
                </section>

                <section className="feature-strip hero-feature-strip">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-mouse-pointer"></i>
                        </div>
                        <h3 className="feature-title">Track Any URL</h3>
                        <p className="feature-description">Wrap any link in seconds and start collecting click data immediately.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-bar"></i>
                        </div>
                        <h3 className="feature-title">Real-Time Analytics</h3>
                        <p className="feature-description">Watch clicks roll in live. Clicks, sessions, and engagement updated instantly.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-globe"></i>
                        </div>
                        <h3 className="feature-title">Geo + Device Breakdown</h3>
                        <p className="feature-description">See where your audience is coming from — country, city, browser, and device type.</p>
                    </div>
                </section>

                <div className="hero-social-proof">
                    <div className="hero-stat-item">
                        <div className="hero-stat-value">1.2M+</div>
                        <div className="hero-stat-label">Clicks Tracked</div>
                    </div>
                    <div className="hero-stat-item">
                        <div className="hero-stat-value">15K+</div>
                        <div className="hero-stat-label">Active Links</div>
                    </div>
                    <div className="hero-stat-item">
                        <div className="hero-stat-value">2.4K+</div>
                        <div className="hero-stat-label">Happy Users</div>
                    </div>
                </div>
            </section>

            <section className="preview-section">
                <div className="preview-header">
                    <h2 className="preview-title">Analytics that actually matter</h2>
                    <p className="preview-subtitle">Beautiful dashboards with the metrics you care about</p>
                </div>
                
                <div className="dashboard-preview">
                    <div className="preview-metrics">
                        <div className="preview-metric-card">
                            <div className="preview-metric-label">Total Clicks</div>
                            <div className="preview-metric-value">48,234</div>
                            <div className="preview-metric-delta">
                                <i className="fas fa-arrow-up"></i>
                                12.4%
                            </div>
                        </div>
                        <div className="preview-metric-card">
                            <div className="preview-metric-label">Unique Visitors</div>
                            <div className="preview-metric-value">32,451</div>
                            <div className="preview-metric-delta">
                                <i className="fas fa-arrow-up"></i>
                                8.2%
                            </div>
                        </div>
                        <div className="preview-metric-card">
                            <div className="preview-metric-label">Avg CTR</div>
                            <div className="preview-metric-value">6.2%</div>
                            <div className="preview-metric-delta">
                                <i className="fas fa-arrow-up"></i>
                                2.1%
                            </div>
                        </div>
                        <div className="preview-metric-card">
                            <div className="preview-metric-label">Active Links</div>
                            <div className="preview-metric-value">342</div>
                            <div className="preview-metric-delta" style={{color: '#10B981'}}>
                                <i className="fas fa-arrow-up"></i>
                                18
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Start tracking your links today</h2>
                    <p className="cta-description">Join thousands of marketers, creators, and businesses using Beakon to understand their audience.</p>
                    <button className="btn-cta-large" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}>
                        <span>{isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import mockLinks from '../data/mockLinks';

const LinkAnalytics = () => {
  const { shortCode } = useParams();
  const link = mockLinks.find((l) => l.shortCode === shortCode);

  if (!link) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 24px', color: '#6B7280',
      }}>
        <i className="fas fa-link-slash" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }} />
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#D1D5DB', marginBottom: '8px' }}>
          Link not found
        </div>
        <div style={{ fontSize: '14px', marginBottom: '20px' }}>
          No link exists with short code <strong style={{ color: '#F8FAFC' }}>{shortCode}</strong>
        </div>
        <Link to="/links" className="btn-primary" style={{ textDecoration: 'none' }}>
          ← Back to Links
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/links" style={{ color: '#6B7280', textDecoration: 'none' }}>Links</Link>
        <i className="fas fa-chevron-right breadcrumb-arrow" />
        <span>bkn.so/{link.shortCode}</span>
      </div>

      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{link.title}</h1>
          <div className="short-link-pill">
            <span>bkn.so/{link.shortCode}</span>
            <i className="fas fa-copy copy-icon" />
          </div>
          <span className={`status-badge ${link.status}`}>
            {link.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
        <div className="date-range-selector">
          <i className="fas fa-calendar" />
          <span>Last 30 days</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '10px' }} />
        </div>
      </header>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">Total Clicks</div>
          <div className="stat-value-large violet">{link.totalClicks.toLocaleString()}</div>
          <div className="stat-trend">
            <i className="fas fa-arrow-up" />
            <span>+{link.ctr}% vs last period</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Unique Visitors</div>
          <div className="stat-value-large emerald">{link.uniqueVisitors.toLocaleString()}</div>
          <div className="stat-secondary">
            {((link.uniqueVisitors / link.totalClicks) * 100).toFixed(1)}% of total clicks
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Click-Through Rate</div>
          <div className="stat-value-large violet">{link.ctr}%</div>
          <div className="stat-secondary">Last 30 days</div>
        </div>
      </div>

      <div style={{
        background: '#1A2235', border: '1px solid #252836', borderRadius: '12px',
        padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: '14px',
      }}>
        <i className="fas fa-chart-area" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4, display: 'block' }} />
        Detailed charts for <strong style={{ color: '#F8FAFC' }}>bkn.so/{link.shortCode}</strong> will be rendered here.
      </div>
    </>
  );
};

export default LinkAnalytics;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import useClipboard from '../hooks/useClipboard';
import ErrorNotice from '../components/ui/ErrorNotice';

const LinkAnalytics = () => {
  const { shortCode } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [link, setLink] = useState(null);
  const [error, setError] = useState('');
  const { copied, copy } = useClipboard();

  useEffect(() => {
    let isMounted = true;

    const fetchLinkAnalytics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data: linksData } = await api.get('/api/links');
        const links = Array.isArray(linksData) ? linksData : [];
        const selectedLink = links.find((item) => item.shortCode === shortCode);

        if (!selectedLink) {
          if (isMounted) setLink(null);
          return;
        }

        const linkId = selectedLink.id || selectedLink._id;
        const { data: analyticsData } = await api.get(`/api/analytics/${linkId}`);
        const stats = analyticsData.stats || {};

        if (isMounted) {
          setLink({
            ...selectedLink,
            totalClicks: stats.totalClicks || 0,
            uniqueVisitors: stats.uniqueVisitors || 0,
            ctr: stats.totalClicks > 0 ? Number(((stats.uniqueVisitors / stats.totalClicks) * 100).toFixed(1)) : 0
          });
        }
      } catch (error) {
        console.error('Failed to load link analytics', error);
        if (isMounted) setError(error?.response?.data?.error || 'Failed to load link analytics');
        if (isMounted) setLink(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLinkAnalytics();
    return () => {
      isMounted = false;
    };
  }, [shortCode]);

  if (isLoading) {
    return (
      <>
        <div className="breadcrumb">
          <Skeleton width="200px" height="16px" />
        </div>
        <header className="page-header">
          <Skeleton width="300px" height="28px" />
        </header>
        <div className="metrics-grid">
          <MetricCard isLoading={true} label="Total Clicks" />
          <MetricCard isLoading={true} label="Unique Visitors" />
          <MetricCard isLoading={true} label="CTR" />
        </div>
        <div style={{ height: '300px', padding: '24px' }}>
          <Skeleton height="100%" borderRadius="8px" />
        </div>
      </>
    );
  }

  if (!link) {
    return (
      <EmptyState
        icon="fas fa-chart-line"
        title="No analytics data"
        description={`Analytics for link "${shortCode}" will appear here once data is available.`}
        action={
          <Link to="/links" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            ← Back to Links
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ErrorNotice message={error} onRetry={() => window.location.reload()} />
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/links" style={{ color: '#6B7280', textDecoration: 'none' }}>Links</Link>
        <i className="fas fa-chevron-right breadcrumb-arrow" />
        <span>{link.shortUrl}</span>
      </div>

      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{link.title}</h1>
          <div className="short-link-pill">
            <span>{link.shortUrl}</span>
            <button
              type="button"
              onClick={() => copy(link.shortUrl)}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} copy-icon`} />
            </button>
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
      <div className="metrics-grid">
        <MetricCard
          iconClass="fas fa-mouse-pointer"
          label="Total Clicks"
          value={link.totalClicks?.toLocaleString() || '0'}
          delta={link.clicksDelta}
          deltaPositive={link.clicksDeltaPositive}
        />
        <MetricCard
          iconClass="fas fa-users"
          label="Unique Visitors"
          value={link.uniqueVisitors?.toLocaleString() || '0'}
          secondaryText={link.totalClicks ? `${((link.uniqueVisitors / link.totalClicks) * 100).toFixed(1)}% of total clicks` : undefined}
        />
        <MetricCard
          iconClass="fas fa-percentage"
          label="Click-Through Rate"
          value={`${link.ctr || 0}%`}
          secondaryText="Last 30 days"
        />
      </div>

      <div style={{
        background: '#1A2235', border: '1px solid #252836', borderRadius: '12px',
        padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: '14px',
      }}>
        <i className="fas fa-chart-area" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4, display: 'block' }} />
        Detailed click charts for <strong style={{ color: '#F8FAFC' }}>{link.shortUrl}</strong> will be populated by the API.
      </div>
    </>
  );
};

export default LinkAnalytics;

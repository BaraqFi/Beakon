import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorNotice from '../components/ui/ErrorNotice';
import CreateLinkModal from '../components/modals/CreateLinkModal';
import CreateLinkSuccessModal from '../components/modals/CreateLinkSuccessModal';

const Dashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [createdLink, setCreatedLink] = useState(null);
    const [error, setError] = useState('');

    const [stats, setStats] = useState(null);
    const [recentLinks, setRecentLinks] = useState([]);

    const fetchDashboardData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await api.get('/api/analytics/overview');
                setStats(data.stats || null);
                setRecentLinks(data.recentLinks || []);
            } catch (error) {
                console.error("Dashboard overview pipeline failed:", error);
                setError(error?.response?.data?.error || 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCreateLink = async (payload) => {
        try {
            setError('');
            const { data } = await api.post('/api/links', payload);
            const created = data.link
                ? {
                    id: data.link._id,
                    shortCode: data.link.shortCode,
                    shortUrl: `${window.location.origin.replace(/\/$/, '')}/${data.link.shortCode}`,
                    destinationUrl: data.link.originalUrl,
                    title: data.link.title || data.link.originalUrl,
                    tags: data.link.tags || [],
                    status: data.link.isActive ? 'active' : 'paused'
                }
                : null;
            setCreatedLink(created);
            setIsCreateModalOpen(false);
            setIsSuccessModalOpen(true);
            await fetchDashboardData();
            return created;
        } catch (createError) {
            setError(createError?.response?.data?.error || 'Failed to create link');
            throw createError;
        }
    };

    return (
        <>
            <ErrorNotice message={error} onRetry={fetchDashboardData} />
            <header className="page-header">
                <div className="page-title-section">
                    <h1>Dashboard</h1>
                    <div className="page-subtitle">Welcome back. Here's what's happening.</div>
                </div>
                <div className="header-actions">
                    <div className="date-range-selector">
                        <i className="fas fa-calendar"></i>
                        <span>Last 30 days</span>
                        <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
                    </div>
                    <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <i className="fas fa-plus"></i>
                        <span>Create Link</span>
                    </button>
                </div>
            </header>

            <div className="metrics-grid">
                <MetricCard 
                    iconClass="fas fa-mouse-pointer"
                    label="Total Clicks"
                    value={stats?.totalClicks?.toLocaleString() || '0'}
                    delta={stats?.clicksDelta}
                    deltaPositive={stats?.clicksDeltaPositive}
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-link"
                    label="Active Links"
                    value={stats?.activeLinks?.toString() || '0'}
                    secondaryText={stats?.activeLinksChange}
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-plus-circle"
                    label="Links Created This Month"
                    value={stats?.createdThisMonth?.toString() || '0'}
                    secondaryText={stats?.createdChange}
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-trophy"
                    label="Top Performer"
                    highlightText={stats?.topPerformer || '—'}
                    secondaryText={stats?.topPerformerClicks}
                    isLoading={isLoading}
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Link</th>
                            <th>Tags</th>
                            <th>Total Clicks</th>
                            <th>Unique Visitors</th>
                            <th>CTR</th>
                            <th>30-Day Trend</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td><Skeleton width="180px" height="16px" /><Skeleton width="220px" height="12px" style={{ marginTop: '8px' }} /></td>
                                    <td><div className="tags"><Skeleton width="60px" height="24px" borderRadius="9999px" /></div></td>
                                    <td><Skeleton width="60px" height="16px" /></td>
                                    <td><Skeleton width="60px" height="16px" /></td>
                                    <td><Skeleton width="100px" height="8px" borderRadius="4px" /></td>
                                    <td><div style={{ width: '80px', height: '32px' }}><Skeleton height="32px" /></div></td>
                                    <td><Skeleton width="60px" height="24px" borderRadius="9999px" /></td>
                                    <td><Skeleton width="24px" height="24px" borderRadius="4px" /></td>
                                </tr>
                            ))
                        ) : recentLinks.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ padding: 0, border: 'none' }}>
                                    <EmptyState
                                        icon="fas fa-link"
                                        title="No links yet"
                                        description="Create your first short link to start tracking clicks and engagement."
                                        action={
                                            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                                                <i className="fas fa-plus"></i>
                                                <span>Create Link</span>
                                            </button>
                                        }
                                    />
                                </td>
                            </tr>
                        ) : (
                            recentLinks.map((link) => (
                                <tr key={link.id}>
                                    <td>
                                        <div className="link-cell">
                                            <Link to={`/analytics/${link.shortCode}`} className="short-link">{link.shortUrl}</Link>
                                            <span className="destination">{link.destinationUrl}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tags">
                                            {link.tags?.map(tag => (
                                                <span key={tag} className={`tag ${tag.toLowerCase()}`}>{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{link.totalClicks?.toLocaleString()}</td>
                                    <td>{link.uniqueVisitors?.toLocaleString()}</td>
                                    <td>
                                        <div className="ctr-bar-wrapper">
                                            <span className="ctr-value">{link.ctr}%</span>
                                            <div className="ctr-bar-bg">
                                                <div className="ctr-bar-fill" style={{ width: `${Math.min(link.ctr * 10, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <svg className="sparkline" id={`spark-${link.id}`}></svg>
                                    </td>
                                    <td><span className={`status-badge ${link.status}`}>{link.status === 'active' ? 'Active' : 'Paused'}</span></td>
                                    <td>
                                        <button className="actions-btn">
                                            <i className="fas fa-ellipsis-h"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {recentLinks.length > 0 && (
                    <div className="view-all-footer">
                        <Link to="/links" className="view-all-link">View all links →</Link>
                    </div>
                )}
            </div>

            <CreateLinkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateLink}
            />
            <CreateLinkSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                link={createdLink}
            />
        </>
    );
};

export default Dashboard;

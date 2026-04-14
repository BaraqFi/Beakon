import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CreateLinkModal from '../components/modals/CreateLinkModal';
import CreateLinkSuccessModal from '../components/modals/CreateLinkSuccessModal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorNotice from '../components/ui/ErrorNotice';
import useLinks from '../hooks/useLinks';

const Links = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [createdLink, setCreatedLink] = useState(null);
    const [error, setError] = useState('');

    const { links, loading, addLink, deleteLink, toggleStatus } = useLinks();

    const handleCreateLink = async (payload) => {
        try {
            setError('');
            const created = await addLink(payload);
            setCreatedLink(created);
            setIsCreateModalOpen(false);
            setIsSuccessModalOpen(true);
            return created;
        } catch (createError) {
            setError(createError?.response?.data?.error || 'Failed to create link');
            throw createError;
        }
    };

    const filteredLinks = useMemo(() => links.filter((link) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            link.shortUrl?.toLowerCase().includes(q) ||
            link.destinationUrl?.toLowerCase().includes(q) ||
            link.title?.toLowerCase().includes(q) ||
            link.tags?.some((t) => t.toLowerCase().includes(q))
        );
    }), [links, searchQuery]);

    return (
        <>
            <ErrorNotice message={error} />
            <header className="page-header">
                <div className="page-title-section">
                    <h1>Links</h1>
                    <div className="page-subtitle">Manage and track all your short links.</div>
                </div>
                <div className="header-actions">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search links…" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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

            {/* Links Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Link</th>
                            <th>Tags</th>
                            <th>Total Clicks</th>
                            <th>Unique Visitors</th>
                            <th>CTR</th>
                            <th>30-Day Trend</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i}>
                                    <td><Skeleton width="16px" height="16px" borderRadius="4px" /></td>
                                    <td><Skeleton width="180px" height="16px" /><Skeleton width="220px" height="12px" style={{ marginTop: '8px' }} /></td>
                                    <td><div className="tags"><Skeleton width="60px" height="24px" borderRadius="9999px" /></div></td>
                                    <td><Skeleton width="60px" height="16px" /></td>
                                    <td><Skeleton width="60px" height="16px" /></td>
                                    <td><Skeleton width="100px" height="8px" borderRadius="4px" /></td>
                                    <td><div style={{ width: '80px', height: '32px' }}><Skeleton height="32px" /></div></td>
                                    <td><Skeleton width="80px" height="16px" /></td>
                                    <td><Skeleton width="60px" height="24px" borderRadius="9999px" /></td>
                                    <td><Skeleton width="24px" height="24px" borderRadius="4px" /></td>
                                </tr>
                            ))
                        ) : filteredLinks.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ padding: 0, border: 'none' }}>
                                    <EmptyState
                                        icon={searchQuery ? 'fas fa-search' : 'fas fa-link'}
                                        title={searchQuery ? 'No links match your search' : 'No links yet'}
                                        description={searchQuery 
                                            ? `No links found for "${searchQuery}". Try a different search term.`
                                            : 'Create your first short link to start tracking clicks and engagement.'
                                        }
                                        action={!searchQuery && (
                                            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                                                <i className="fas fa-plus"></i>
                                                <span>Create Link</span>
                                            </button>
                                        )}
                                    />
                                </td>
                            </tr>
                        ) : (
                            filteredLinks.map((link) => (
                                <tr key={link.id}>
                                    <td><input type="checkbox" className="custom-checkbox" /></td>
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
                                    <td style={{ fontSize: '13px', color: '#6B7280' }}>{link.createdAt}</td>
                                    <td>
                                        <button
                                            className={`status-badge ${link.status}`}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                            onClick={() => toggleStatus(link.id || link._id)}
                                        >
                                            {link.status === 'active' ? 'Active' : 'Paused'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="actions-btn"
                                            onClick={async () => {
                                                try {
                                                    setError('');
                                                    await deleteLink(link.id || link._id);
                                                } catch (deleteError) {
                                                    setError(deleteError?.response?.data?.error || 'Failed to delete link');
                                                }
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

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

export default Links;

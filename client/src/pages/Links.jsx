import React, { useEffect, useState } from 'react';
import CreateLinkModal from '../components/modals/CreateLinkModal';
import CreateLinkSuccessModal from '../components/modals/CreateLinkSuccessModal';
import Skeleton from '../components/ui/Skeleton';
import * as d3 from 'd3';

const Links = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleCreateLink = () => {
        setIsCreateModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return;
        // Generate sparklines using D3
        const sparklineData = [
            [20, 25, 30, 28, 35, 40, 45, 48, 52, 50, 55, 60, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98, 100, 102],
            [30, 32, 35, 33, 38, 42, 45, 43, 47, 50, 48, 52, 55, 53, 57, 60, 62, 65, 63, 67, 70, 68, 72, 75, 73, 77, 80, 78, 82, 85],
            [15, 18, 22, 25, 28, 30, 33, 36, 40, 38, 42, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83, 85, 88, 90],
            [25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 60, 63, 67, 70, 73, 77, 80, 83, 87, 90, 93, 97, 100, 103, 107, 110, 113, 117, 120],
            [10, 12, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83],
            [18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 98, 102, 105, 108, 112, 115],
            [35, 33, 30, 28, 25, 23, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3],
            [12, 14, 16, 15, 17, 19, 18, 20, 22, 21, 23, 25, 24, 26, 28, 27, 29, 31, 30, 32, 34, 33, 35, 37, 36, 38, 40, 39, 41, 43]
        ];

        sparklineData.forEach((data, index) => {
            const svg = d3.select(`#spark${index + 1}`);
            svg.selectAll("*").remove();
            const width = 80;
            const height = 32;

            const x = d3.scaleLinear()
                .domain([0, data.length - 1])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([d3.min(data), d3.max(data)])
                .range([height - 2, 2]);

            const line = d3.line()
                .x((d, i) => x(i))
                .y(d => y(d))
                .curve(d3.curveMonotoneX);

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#06B6D4')
                .attr('stroke-width', 2)
                .attr('d', line);
        });
    }, [isLoading]);

    return (
        <>
            <header className="page-header">
                <div className="page-title-section">
                    <h1>Links</h1>
                    <div className="page-subtitle">Manage and track all your short links.</div>
                </div>
                <div className="header-actions">
                    <input type="text" className="search-input" placeholder="Search links…" />
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
                        ) : (
                            <>
                        <tr>
                            <td><input type="checkbox" className="custom-checkbox" /></td>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/launch</span>
                                    <span className="destination">https://example.com/product-launch-2024</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag campaign">Campaign</span>
                                    <span className="tag product">Product</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>48,234</td>
                            <td>32,451</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">6.2%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '62%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark1"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/pricing</span>
                                    <span className="destination">https://example.com/pricing-plans</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag sales">Sales</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>35,892</td>
                            <td>28,103</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">5.8%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '58%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark2"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/webinar</span>
                                    <span className="destination">https://example.com/webinar-registration</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag event">Event</span>
                                    <span className="tag marketing">Marketing</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>29,451</td>
                            <td>21,834</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">4.3%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '43%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark3"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/demo</span>
                                    <span className="destination">https://example.com/request-demo</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag sales">Sales</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>24,187</td>
                            <td>19,234</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">7.1%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '71%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark4"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/blog-ai</span>
                                    <span className="destination">https://example.com/blog/ai-trends-2024</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag content">Content</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>18,923</td>
                            <td>15,102</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">3.9%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '39%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark5"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/signup</span>
                                    <span className="destination">https://example.com/create-account</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag growth">Growth</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>14,502</td>
                            <td>11,847</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">5.2%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '52%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark6"></svg>
                            </td>
                            <td><span className="status-badge active">Active</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/docs-v2</span>
                                    <span className="destination">https://example.com/documentation/v2</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag docs">Docs</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>9,312</td>
                            <td>7,891</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">2.8%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '28%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark7"></svg>
                            </td>
                            <td><span className="status-badge paused">Paused</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/twitter</span>
                                    <span className="destination">https://twitter.com/beakonanalytics</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag social">Social</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>6,744</td>
                            <td>5,203</td>
                            <td>
                                <div className="ctr-bar-wrapper">
                                    <span className="ctr-value">3.1%</span>
                                    <div className="ctr-bar-bg">
                                        <div className="ctr-bar-fill" style={{ width: '31%' }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <svg className="sparkline" id="spark8"></svg>
                            </td>
                            <td><span className="status-badge paused">Paused</span></td>
                            <td>
                                <button className="actions-btn">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            </td>
                        </tr>
                            </>
                        )}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <div className="pagination-info">Showing 1–8 of 47 links</div>
                    <div className="pagination-controls">
                        <button className="pagination-btn" disabled>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button className="pagination-btn active">1</button>
                        <button className="pagination-btn">2</button>
                        <button className="pagination-btn">3</button>
                        <button className="pagination-btn">4</button>
                        <button className="pagination-btn">5</button>
                        <button className="pagination-btn">
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <CreateLinkModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateLink}
            />
            <CreateLinkSuccessModal 
                isOpen={isSuccessModalOpen} 
                onClose={() => setIsSuccessModalOpen(false)} 
            />
        </>
    );
};

export default Links;

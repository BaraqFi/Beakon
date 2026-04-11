import React, { useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MetricCard from '../components/MetricCard';
import * as d3 from 'd3';

const Dashboard = () => {
    useEffect(() => {
        // D3 Sparkline logic from Dashboard.html
        const sparklineData = [
            [20, 25, 30, 28, 35, 40, 45, 48, 52, 50, 55, 60, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98, 100, 102],
            [30, 32, 35, 33, 38, 42, 45, 43, 47, 50, 48, 52, 55, 53, 57, 60, 62, 65, 63, 67, 70, 68, 72, 75, 73, 77, 80, 78, 82, 85],
            [15, 18, 22, 25, 28, 30, 33, 36, 40, 38, 42, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83, 85, 88, 90],
            [25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 60, 63, 67, 70, 73, 77, 80, 83, 87, 90, 93, 97, 100, 103, 107, 110, 113, 117, 120],
            [10, 12, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 43, 45, 48, 50, 53, 55, 58, 60, 63, 65, 68, 70, 73, 75, 78, 80, 83]
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
    }, []);

    return (
        <DashboardLayout>
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
                    <button className="btn-primary">
                        <i className="fas fa-plus"></i>
                        <span>Create Link</span>
                    </button>
                </div>
            </header>

            <div className="metrics-grid">
                <MetricCard 
                    iconClass="fas fa-mouse-pointer"
                    label="Total Clicks"
                    value="1,247,382"
                    delta="12.4%"
                    deltaPositive={true}
                />
                <MetricCard 
                    iconClass="fas fa-link"
                    label="Active Links"
                    value="342"
                    secondaryText="+18 this week"
                />
                <MetricCard 
                    iconClass="fas fa-plus-circle"
                    label="Links Created This Month"
                    value="94"
                    secondaryText="+11 vs last month"
                />
                <MetricCard 
                    iconClass="fas fa-trophy"
                    label="Top Performer"
                    highlightText="bkn.so/launch"
                    secondaryText="48.2K clicks"
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
                        <tr>
                            <td>
                                <div className="link-cell">
                                    <span className="short-link">bkn.so/launch</span>
                                    <span className="destination">https://example.com/product-launch-2024</span>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    <span className="tag">Campaign</span>
                                    <span className="tag">Product</span>
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
                                    <span className="tag">Sales</span>
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
                                    <span className="tag">Event</span>
                                    <span className="tag">Marketing</span>
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
                                    <span className="tag">Sales</span>
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
                                    <span className="tag">Content</span>
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
                    </tbody>
                </table>
                <div className="view-all-footer">
                    <a href="#" className="view-all-link">View all links →</a>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;

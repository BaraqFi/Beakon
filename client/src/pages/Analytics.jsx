import React, { useEffect, useState } from 'react';
import api from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorNotice from '../components/ui/ErrorNotice';
import * as d3 from 'd3';

const Analytics = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [timePeriod, setTimePeriod] = useState('30D');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Will be populated by API
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [clicksLog, setClicksLog] = useState([]);
    const [error, setError] = useState('');

    const fetchAnalytics = async () => {
            setIsLoading(true);
            setError('');
            try {
                const linksRes = await api.get('/api/links');
                const links = Array.isArray(linksRes.data) ? linksRes.data : [];
                if (links.length === 0) return;

                const linkId = links[0]._id || links[0].id;
                const { data } = await api.get(`/api/analytics/${linkId}`);
                const analytics = data.stats;

                setStats({
                    totalClicks: analytics.totalClicks || 0,
                    uniqueVisitors: analytics.uniqueVisitors || 0
                });

                setChartData((analytics.clicksByDate || []).map((entry) => ({
                    date: entry._id,
                    value: entry.count
                })));

                setLocations((analytics.byCountry || []).map((entry) => ({
                    country: entry._id || 'Unknown',
                    count: entry.count,
                    flag: '🌍'
                })));

                const dColors = ['#8B5CF6', '#F43F5E', '#10B981', '#F59E0B'];
                setDevices((analytics.byDevice || []).map((entry, idx) => ({
                    label: entry._id || 'Unknown',
                    value: entry.count,
                    color: dColors[idx % 4]
                })));

                setBrowsers((analytics.byBrowser || []).map((entry, idx) => ({
                    label: entry._id || 'Unknown',
                    value: entry.count,
                    color: dColors[idx % 4]
                })));

                const clicksRes = await api.get(`/api/analytics/${linkId}/clicks?limit=5`);
                setClicksLog((clicksRes.data?.clicks || []).map((c) => ({
                    id: c._id,
                    time: new Date(c.clickedAt).toLocaleString(),
                    country: c.country,
                    city: c.city,
                    device: c.device,
                    browser: c.browser,
                    os: c.os,
                    referrer: c.referrer || 'Direct'
                })));
            } catch (error) {
                console.error("Analytics extraction failed:", error);
                setError(error?.response?.data?.error || 'Failed to load analytics');
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // D3 chart rendering — only runs when real data arrives
    useEffect(() => {
        if (isLoading || chartData.length === 0) return;

        const chartContainer = document.getElementById('mainChart');
        if (!chartContainer) return;

        const margin = { top: 20, right: 40, bottom: 40, left: 60 };
        d3.select('#mainChart').selectAll('*').remove();
        const containerWidth = chartContainer.parentElement.offsetWidth - 48;
        const width = containerWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select('#mainChart')
            .attr('width', containerWidth)
            .attr('height', 400)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scalePoint().domain(chartData.map(d => d.date)).range([0, width]);
        const maxVal = d3.max(chartData, d => d.value) || 100;
        const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([height, 0]);

        svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(5)).enter().append('line')
            .attr('x1', 0).attr('x2', width).attr('y1', d => y(d)).attr('y2', d => y(d))
            .attr('stroke', '#252836').attr('stroke-width', 1);

        svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
            .call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').remove())
            .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '12px').attr('y', 12));

        svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => d === 0 ? '0' : d >= 1000 ? (d / 1000) + 'k' : d))
            .call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').remove())
            .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '12px').attr('x', -10));

        const area = d3.area().x(d => x(d.date)).y0(height).y1(d => y(d.value)).curve(d3.curveMonotoneX);
        svg.append('path').datum(chartData).attr('fill', 'rgba(139, 92, 246, 0.08)').attr('d', area);

        const line = d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX);
        svg.append('path').datum(chartData).attr('fill', 'none').attr('stroke', '#8B5CF6').attr('stroke-width', 2).attr('d', line);
    }, [isLoading, chartData]);

    // Donut renderer — only runs when data exists
    useEffect(() => {
        if (isLoading || devices.length === 0) return;

        function createDonutChart(elementId, data, total) {
            const width = 160, height = 160;
            const radius = Math.min(width, height) / 2;
            const innerRadius = radius * 0.6;
            const targetSvg = d3.select(elementId);
            targetSvg.selectAll('*').remove();
            const svg = targetSvg.attr('viewBox', `0 0 ${width} ${height}`);
            const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
            const color = d3.scaleOrdinal().range(data.map(d => d.color));
            const pie = d3.pie().value(d => d.value).sort(null);
            const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
            g.selectAll('arc').data(pie(data)).enter().append('g').append('path')
                .attr('d', arc).attr('fill', d => color(d.data.label));
            g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
                .attr('font-size', '20px').attr('font-weight', '700').attr('fill', '#F8FAFC').text(total || '0');
            g.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em')
                .attr('font-size', '12px').attr('fill', '#6B7280').text('total');
        }

        createDonutChart('#devicesChart', devices, stats?.totalClicks?.toLocaleString());
        createDonutChart('#browsersChart', browsers, stats?.totalClicks?.toLocaleString());
    }, [isLoading, devices, browsers, stats, windowWidth]);

    const topLocation = locations[0];
    const maxLocationCount = topLocation?.count || 1;

    return (
        <>
            <ErrorNotice message={error} onRetry={fetchAnalytics} />
            {/* Page Header */}
            <header className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Analytics</h1>
                    <div className="page-subtitle">Aggregate analytics across all your links.</div>
                </div>
                <div className="date-range-selector">
                    <i className="fas fa-calendar"></i>
                    <span>Last 30 days</span>
                    <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="metrics-grid">
                <MetricCard 
                    iconClass="fas fa-mouse-pointer"
                    label="Total Clicks"
                    value={stats?.totalClicks?.toLocaleString() || '0'}
                    delta={stats?.clicksDelta}
                    deltaPositive={stats?.clicksDeltaPositive}
                    secondaryText={stats?.clicksSecondary}
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-users"
                    label="Unique Visitors"
                    value={stats?.uniqueVisitors?.toLocaleString() || '0'}
                    secondaryText={stats?.visitorsSecondary}
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-clock"
                    label="Last Clicked"
                    value={stats?.lastClicked || '—'}
                    secondaryText={stats?.lastClickedTime}
                    isLoading={isLoading}
                />
            </div>

            {/* Main Chart */}
            <div className="chart-card">
                <div className="chart-header">
                    <h2 className="chart-title">Clicks Over Time</h2>
                    <div className="time-toggles">
                        {['7D', '30D', '90D', '1Y'].map(p => (
                            <button key={p} className={`pill-toggle ${timePeriod === p ? 'active' : ''}`} onClick={() => setTimePeriod(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                {isLoading ? (
                    <div style={{ height: '400px', padding: '24px' }}>
                        <Skeleton height="100%" borderRadius="8px" />
                    </div>
                ) : chartData.length === 0 ? (
                    <EmptyState
                        icon="fas fa-chart-area"
                        title="No analytics data yet"
                        description="Click data will appear here once your links start receiving traffic."
                    />
                ) : (
                    <>
                        <svg id="mainChart"></svg>
                        <div className="chart-tooltip" id="chartTooltip">
                            <div className="tooltip-date" id="tooltipDate"></div>
                            <div className="tooltip-value" id="tooltipValue"></div>
                        </div>
                    </>
                )}
            </div>

            {/* Breakdown Grid */}
            <div className="breakdown-grid">
                {/* Top Locations */}
                <div className="breakdown-card">
                    <h3 className="breakdown-title">Top Locations</h3>
                    {locations.length === 0 ? (
                        <div style={{ padding: '24px 0', color: '#6B7280', fontSize: '13px', textAlign: 'center' }}>
                            No location data yet
                        </div>
                    ) : (
                        locations.slice(0, 5).map((loc) => (
                            <div className="location-row" key={loc.country}>
                                <div className="location-left">
                                    <span className="location-flag">{loc.flag}</span>
                                    <span className="location-name">{loc.country}</span>
                                </div>
                                <span className="location-count">{loc.count.toLocaleString()}</span>
                                <div className="location-bar">
                                    <div className="location-bar-fill" style={{ width: `${(loc.count / maxLocationCount) * 100}%` }}></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Devices */}
                <div className="breakdown-card">
                    <h3 className="breakdown-title">Devices</h3>
                    {devices.length === 0 ? (
                        <div style={{ padding: '24px 0', color: '#6B7280', fontSize: '13px', textAlign: 'center' }}>
                            No device data yet
                        </div>
                    ) : (
                        <div className="donut-container">
                            <svg className="donut-chart" id="devicesChart"></svg>
                            <div className="donut-legend">
                                {devices.map(d => (
                                    <div className="legend-row" key={d.label}>
                                        <div className="legend-left">
                                            <div className="legend-dot" style={{ background: d.color }}></div>
                                            <span className="legend-label">{d.label}</span>
                                        </div>
                                        <span className="legend-percent">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Browsers */}
                <div className="breakdown-card">
                    <h3 className="breakdown-title">Browsers</h3>
                    {browsers.length === 0 ? (
                        <div style={{ padding: '24px 0', color: '#6B7280', fontSize: '13px', textAlign: 'center' }}>
                            No browser data yet
                        </div>
                    ) : (
                        <div className="donut-container">
                            <svg className="donut-chart" id="browsersChart"></svg>
                            <div className="donut-legend">
                                {browsers.map(b => (
                                    <div className="legend-row" key={b.label}>
                                        <div className="legend-left">
                                            <div className="legend-dot" style={{ background: b.color }}></div>
                                            <span className="legend-label">{b.label}</span>
                                        </div>
                                        <span className="legend-percent">{b.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clicks Log Table */}
            <div className="table-card">
                <div className="table-header">
                    <h2 className="table-title">Clicks Log</h2>
                    <button className="export-btn" disabled={clicksLog.length === 0}>
                        <i className="fas fa-download"></i>
                        <span>Export</span>
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Country</th>
                            <th>City</th>
                            <th>Device</th>
                            <th>Browser</th>
                            <th>OS</th>
                            <th>Referrer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    <td><Skeleton width="70px" height="14px" /></td>
                                    <td><Skeleton width="100px" height="14px" /></td>
                                    <td><Skeleton width="80px" height="14px" /></td>
                                    <td><Skeleton width="80px" height="14px" /></td>
                                    <td><Skeleton width="60px" height="14px" /></td>
                                    <td><Skeleton width="60px" height="14px" /></td>
                                    <td><Skeleton width="90px" height="14px" /></td>
                                </tr>
                            ))
                        ) : clicksLog.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: 0, border: 'none' }}>
                                    <EmptyState
                                        icon="fas fa-stream"
                                        title="No clicks recorded"
                                        description="Individual click events will appear here in real time."
                                    />
                                </td>
                            </tr>
                        ) : (
                            clicksLog.map((click) => (
                                <tr key={click.id}>
                                    <td className="td-primary">{click.time}</td>
                                    <td className="td-secondary">{click.country}</td>
                                    <td className="td-secondary">{click.city}</td>
                                    <td className="td-secondary">{click.device}</td>
                                    <td className="td-secondary">{click.browser}</td>
                                    <td className="td-secondary">{click.os}</td>
                                    <td className="td-secondary td-truncate">{click.referrer}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Analytics;

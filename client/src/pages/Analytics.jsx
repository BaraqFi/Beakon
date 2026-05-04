import React, { useEffect, useState, useCallback } from 'react';
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

    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [clicksLog, setClicksLog] = useState([]);
    const [error, setError] = useState('');

    const periodDays = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 };

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Aggregate overview across all user links
            const { data } = await api.get('/api/analytics/overview');

            setStats({
                totalClicks: data.totalClicks || 0,
                uniqueVisitors: data.uniqueVisitors || 0,
                activeLinks: data.stats?.activeLinks || 0,
                topPerformer: data.stats?.topPerformer || '—',
                topPerformerClicks: data.stats?.topPerformerClicks
            });

            // Filter clicksByDate to the selected time period
            const days = periodDays[timePeriod] || 30;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            const filtered = (data.clicksByDate || []).filter((entry) => {
                return new Date(entry._id) >= cutoff;
            });

            setChartData(filtered.map((entry) => ({
                date: entry._id,
                value: entry.count
            })));

            const dColors = ['#8B5CF6', '#F43F5E', '#10B981', '#F59E0B'];

            setLocations((data.byCountry || []).map((entry) => ({
                country: entry._id || 'Unknown',
                count: entry.count,
                flag: '🌍'
            })));

            setDevices((data.byDevice || []).map((entry, idx) => ({
                label: entry._id || 'Unknown',
                value: entry.count,
                color: dColors[idx % 4]
            })));

            setBrowsers((data.byBrowser || []).map((entry, idx) => ({
                label: entry._id || 'Unknown',
                value: entry.count,
                color: dColors[idx % 4]
            })));
            // Load click log from the first active link if available
            if (data.recentLinks && data.recentLinks.length > 0) {
                const firstLinkId = data.recentLinks[0].id || data.recentLinks[0]._id;
                try {
                    const clicksRes = await api.get(`/api/analytics/${firstLinkId}/clicks?limit=5`);
                    setClicksLog((clicksRes.data?.clicks || []).map((c) => ({
                        id: c._id,
                        time: new Date(c.clickedAt).toLocaleString(),
                        country: c.country || '—',
                        city: c.city || '—',
                        device: c.device || '—',
                        browser: c.browser || '—',
                        os: c.os || '—',
                        referrer: c.referrer || 'Direct'
                    })));
                } catch {
                    setClicksLog([]);
                }
            }
        } catch (err) {
            console.error('Analytics fetch failed:', err);
            setError(err?.response?.data?.error || 'Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    }, [timePeriod]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

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

        const x = d3.scaleBand().domain(chartData.map(d => d.date)).range([0, width]).padding(0.2);
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

        svg.selectAll('.bar')
            .data(chartData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.date))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', '#8B5CF6')
            .attr('rx', 4);
    }, [isLoading, chartData, windowWidth]);

    // Donut charts
    useEffect(() => {
        if (isLoading) return;

        const createDonut = (elementId, data, total) => {
            const el = document.getElementById(elementId);
            if (!el || data.length === 0) return;

            const width = 140, height = 140;
            const radius = Math.min(width, height) / 2;
            const innerRadius = radius * 0.6;
            const targetSvg = d3.select(`#${elementId}`);
            targetSvg.selectAll('*').remove();
            const svg = targetSvg.attr('viewBox', `0 0 ${width} ${height}`);
            const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
            const color = d3.scaleOrdinal().range(data.map(d => d.color));
            const pie = d3.pie().value(d => d.value).sort(null);
            const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

            g.selectAll('arc').data(pie(data)).enter().append('g')
                .append('path').attr('d', arc)
                .attr('fill', d => color(d.data.label));

            g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
                .attr('font-size', '18px').attr('font-weight', '700')
                .attr('fill', '#F8FAFC').text(total || '0');
            g.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em')
                .attr('font-size', '11px').attr('fill', '#6B7280').text('clicks');
        };

        if (devices.length > 0) {
            createDonut('devicesChart', devices, stats?.totalClicks?.toLocaleString());
        }
        if (browsers.length > 0) {
            createDonut('browsersChart', browsers, stats?.totalClicks?.toLocaleString());
        }
    }, [isLoading, devices, browsers, stats]);

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
            </header>

            {/* Stat Cards */}
            <div className="metrics-grid">
                <MetricCard
                    iconClass="fas fa-mouse-pointer"
                    label="Total Clicks"
                    value={stats?.totalClicks?.toLocaleString() || '0'}
                    isLoading={isLoading}
                />
                <MetricCard
                    iconClass="fas fa-users"
                    label="Unique Visitors"
                    value={stats?.uniqueVisitors?.toLocaleString() || '0'}
                    isLoading={isLoading}
                />
                <MetricCard
                    iconClass="fas fa-star"
                    label="Top Performer"
                    value={stats?.topPerformer || '—'}
                    secondaryText={stats?.topPerformerClicks}
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
                                        <span className="legend-percent">{d.value}</span>
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
                                        <span className="legend-percent">{b.value}</span>
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

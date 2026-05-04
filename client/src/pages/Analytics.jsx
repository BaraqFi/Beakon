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
    const [linksMeta, setLinksMeta] = useState([]);
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
            // Fetch overview across all user links for the selected time period
            const days = periodDays[timePeriod] || 30;
            const { data } = await api.get(`/api/analytics/overview?days=${days}`);

            setStats({
                totalClicks: data.totalClicks || 0,
                uniqueVisitors: data.uniqueVisitors || 0,
                activeLinks: data.stats?.activeLinks || 0,
                topPerformer: data.stats?.topPerformer || '—',
                topPerformerClicks: data.stats?.topPerformerClicks
            });

            const currentLinksMeta = data.linksMeta || [];
            setLinksMeta(currentLinksMeta);

            // Bar Chart Data (Stacked)
            const linkIds = currentLinksMeta.map(l => l.id);
            const dateMap = {};
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const defaultObj = { date: dateStr, total: 0 };
                linkIds.forEach(id => defaultObj[id] = 0);
                dateMap[dateStr] = defaultObj;
            }

            (data.clicksByDate || []).forEach(entry => {
                const dateStr = entry._id?.date;
                const linkId = entry._id?.linkId;
                if (dateMap[dateStr] && linkId) {
                    dateMap[dateStr][linkId] = entry.count;
                    dateMap[dateStr].total += entry.count;
                }
            });

            setChartData(Object.values(dateMap));

            setLocations((data.byCountry || []).map((entry) => ({
                country: entry._id || 'Unknown',
                count: entry.count,
                flag: '🌍'
            })));

            const processDonut = (rawData, typeField) => {
                const groups = {};
                rawData.forEach(d => {
                    const key = d._id?.[typeField] || 'Unknown';
                    const linkId = d._id?.linkId;
                    if (!groups[key]) groups[key] = { label: key, value: 0, items: [] };
                    groups[key].value += d.count;
                    if (linkId) groups[key].items.push({ linkId, value: d.count });
                });
                return Object.values(groups).sort((a, b) => b.value - a.value);
            };

            setDevices(processDonut(data.byDevice || [], 'device'));
            setBrowsers(processDonut(data.byBrowser || [], 'browser'));
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

        let tooltip = d3.select('#d3-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('id', 'd3-tooltip')
                .style('position', 'absolute')
                .style('background', '#1E2330')
                .style('color', '#F8FAFC')
                .style('padding', '8px 12px')
                .style('border', '1px solid #252836')
                .style('border-radius', '6px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('z-index', 1000)
                .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
        }

        const margin = { top: 20, right: 40, bottom: 40, left: 60 };
        d3.select('#mainChart').selectAll('*').remove();
        const containerWidth = chartContainer.parentElement.offsetWidth - 48;
        const minChartWidth = chartData.length * 30;
        const width = Math.max(containerWidth - margin.left - margin.right, minChartWidth);
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select('#mainChart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', 400)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const linkIds = linksMeta.map(l => l.id);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(linkIds);

        const x = d3.scaleBand().domain(chartData.map(d => d.date)).range([0, width]).padding(0.2);
        const maxVal = d3.max(chartData, d => d.total) || 10;
        const y = d3.scaleLinear().domain([0, maxVal * 1.1]).nice().range([height, 0]);

        const stack = d3.stack().keys(linkIds);
        const stackedData = stack(chartData);

        svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(5)).enter().append('line')
            .attr('x1', 0).attr('x2', width).attr('y1', d => y(d)).attr('y2', d => y(d))
            .attr('stroke', '#252836').attr('stroke-width', 1);

        const xAxis = d3.axisBottom(x).tickFormat(d => {
            const date = new Date(d);
            const day = date.getDate().toString().padStart(2, '0');
            if (timePeriod === '90D' || timePeriod === '1Y') {
                const month = date.toLocaleString('default', { month: 'short' });
                return `${month} ${day}`;
            }
            return day;
        });

        if (timePeriod === '90D') {
            xAxis.tickValues(x.domain().filter((_, i) => i % 5 === 0));
        } else if (timePeriod === '1Y') {
            xAxis.tickValues(x.domain().filter((_, i) => i % 30 === 0));
        }

        svg.append('g').attr('transform', `translate(0,${height})`).call(xAxis)
            .call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').remove())
            .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '12px').attr('y', 12));

        svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => d === 0 ? '0' : d >= 1000 ? (d / 1000) + 'k' : d))
            .call(g => g.select('.domain').remove()).call(g => g.selectAll('.tick line').remove())
            .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '12px').attr('x', -10));

        svg.selectAll('.layer')
            .data(stackedData)
            .enter().append('g')
            .attr('class', 'layer')
            .attr('fill', d => colorScale(d.key))
            .selectAll('rect')
            .data(d => d)
            .enter().append('rect')
            .attr('x', d => x(d.data.date))
            .attr('y', d => y(d[1]))
            .attr('height', d => Math.max(0, y(d[0]) - y(d[1])))
            .attr('width', x.bandwidth())
            .attr('rx', 2)
            .on('mouseover', function(event, d) {
                const linkKey = d3.select(this.parentNode).datum().key;
                const linkInfo = linksMeta.find(l => l.id === linkKey);
                const title = linkInfo ? (linkInfo.title || linkInfo.shortCode) : 'Link';
                const count = d[1] - d[0];
                
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`<strong>${title}</strong><br/>${count} click${count !== 1 ? 's' : ''}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
                
                d3.select(this).style('opacity', 0.8);
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.transition().duration(500).style('opacity', 0);
                d3.select(this).style('opacity', 1);
            });
    }, [isLoading, chartData, windowWidth, linksMeta]);

    // Donut charts
    useEffect(() => {
        if (isLoading || linksMeta.length === 0) return;
        
        let tooltip = d3.select('#d3-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('id', 'd3-tooltip')
                .style('position', 'absolute')
                .style('background', '#1E2330')
                .style('color', '#F8FAFC')
                .style('padding', '8px 12px')
                .style('border', '1px solid #252836')
                .style('border-radius', '6px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('z-index', 1000)
                .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
        }

        const deviceColorScale = d3.scaleOrdinal(['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#14B8A6']);

        const createSingleDonut = (elementId, data, total) => {
            const el = document.getElementById(elementId);
            if (!el || data.length === 0) return;

            const width = 180, height = 180;
            const radius = Math.min(width, height) / 2;
            const targetSvg = d3.select(`#${elementId}`);
            targetSvg.selectAll('*').remove();
            const svg = targetSvg.attr('viewBox', `0 0 ${width} ${height}`);
            const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

            const innerRadius = radius * 0.6;
            const pie = d3.pie().value(d => d.value).sort(null);
            const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

            const totalClicksNum = data.reduce((acc, d) => acc + d.value, 0);

            const arcs = g.selectAll('arc').data(pie(data)).enter().append('g');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', (d, i) => deviceColorScale(i))
                .attr('stroke', '#0D1117')
                .attr('stroke-width', 2)
                .on('mouseover', function(event, d) {
                    tooltip.transition().duration(200).style('opacity', 1);
                    tooltip.html(`<strong>${d.data.label}</strong><br/>${d.data.value} click${d.data.value !== 1 ? 's' : ''}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                    d3.select(this).style('opacity', 0.8);
                })
                .on('mousemove', function(event) {
                    tooltip.style('left', (event.pageX + 10) + 'px')
                           .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.transition().duration(500).style('opacity', 0);
                    d3.select(this).style('opacity', 1);
                });

            arcs.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('fill', '#fff')
                .text(d => {
                    if (totalClicksNum === 0) return '';
                    const percentage = Math.round((d.value / totalClicksNum) * 100);
                    return percentage > 5 ? `${percentage}%` : '';
                });

            g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
                .attr('font-size', '16px').attr('font-weight', '700')
                .attr('fill', '#F8FAFC').text(total || '0');
            g.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em')
                .attr('font-size', '11px').attr('fill', '#6B7280').text('clicks');
        };

        if (devices.length > 0) createSingleDonut('devicesChart', devices, stats?.totalClicks?.toLocaleString());
        if (browsers.length > 0) createSingleDonut('browsersChart', browsers, stats?.totalClicks?.toLocaleString());
    }, [isLoading, devices, browsers, stats, linksMeta]);

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
                        description="Create and share short links to see aggregate analytics."
                    />
                ) : (
                    <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}>
                        <svg id="mainChart"></svg>
                    </div>
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
                        <div className="donut-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg className="donut-chart" id="devicesChart"></svg>
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
                        <div className="donut-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg className="donut-chart" id="browsersChart"></svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Link Legend */}
            {linksMeta.length > 0 && (
                <div className="link-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', padding: '16px', background: '#1E2330', borderRadius: '12px' }}>
                    <div style={{ width: '100%', fontSize: '13px', fontWeight: '600', color: '#F8FAFC', marginBottom: '4px' }}>Link Color Legend</div>
                    {linksMeta.map((link, idx) => (
                        <div key={link.id} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#94A3B8' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: d3.schemeCategory10[idx % 10], marginRight: 8 }}></div>
                            {link.title || link.shortCode}
                        </div>
                    ))}
                </div>
            )}

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

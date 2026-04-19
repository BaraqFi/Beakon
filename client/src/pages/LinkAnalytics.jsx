import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import useClipboard from '../hooks/useClipboard';
import ErrorNotice from '../components/ui/ErrorNotice';
import * as d3 from 'd3';

const LinkAnalytics = () => {
  const { shortCode } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [link, setLink] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [error, setError] = useState('');
  const { copied, copy } = useClipboard();

  const chartRef = useRef(null);
  const devicesRef = useRef(null);
  const browsersRef = useRef(null);

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
        const s = analyticsData.stats || {};

        if (isMounted) {
          setLink({
            ...selectedLink,
            totalClicks: s.totalClicks || 0,
            uniqueVisitors: s.uniqueVisitors || 0,
            ctr: s.totalClicks > 0
              ? Number(((s.uniqueVisitors / s.totalClicks) * 100).toFixed(1))
              : 0
          });
          setChartData((s.clicksByDate || []).map((entry) => ({
            date: entry._id,
            value: entry.count
          })));

          const dColors = ['#8B5CF6', '#F43F5E', '#10B981', '#F59E0B'];

          setLocations((s.byCountry || []).map((entry) => ({
            country: entry._id || 'Unknown',
            count: entry.count,
            flag: '🌍'
          })));

          setDevices((s.byDevice || []).map((entry, idx) => ({
            label: entry._id || 'Unknown',
            value: entry.count,
            color: dColors[idx % 4]
          })));

          setBrowsers((s.byBrowser || []).map((entry, idx) => ({
            label: entry._id || 'Unknown',
            value: entry.count,
            color: dColors[idx % 4]
          })));
        }
      } catch (err) {
        console.error('Failed to load link analytics', err);
        if (isMounted) setError(err?.response?.data?.error || 'Failed to load link analytics');
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

  // Clicks Over Time chart
  useEffect(() => {
    if (isLoading || chartData.length === 0) return;

    const chartContainer = document.getElementById('linkMainChart');
    if (!chartContainer) return;

    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    d3.select('#linkMainChart').selectAll('*').remove();
    const containerWidth = (chartContainer.parentElement?.offsetWidth || 600) - 48;
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#linkMainChart')
      .attr('width', containerWidth)
      .attr('height', 300)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(chartData.map(d => d.date)).range([0, width]);
    const maxVal = d3.max(chartData, d => d.value) || 10;
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([height, 0]);

    svg.append('g').attr('class', 'grid')
      .selectAll('line').data(y.ticks(5)).enter().append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#252836').attr('stroke-width', 1);

    svg.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '11px').attr('y', 12));

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? (d / 1000) + 'k' : d))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('text').attr('fill', '#6B7280').attr('font-size', '11px').attr('x', -10));

    const area = d3.area()
      .x(d => x(d.date)).y0(height).y1(d => y(d.value))
      .curve(d3.curveMonotoneX);
    svg.append('path').datum(chartData)
      .attr('fill', 'rgba(139, 92, 246, 0.08)').attr('d', area);

    const line = d3.line()
      .x(d => x(d.date)).y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    svg.append('path').datum(chartData)
      .attr('fill', 'none').attr('stroke', '#8B5CF6')
      .attr('stroke-width', 2).attr('d', line);

    // Dot markers
    svg.selectAll('circle').data(chartData).enter().append('circle')
      .attr('cx', d => x(d.date)).attr('cy', d => y(d.value))
      .attr('r', 3).attr('fill', '#8B5CF6');

  }, [isLoading, chartData]);

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
      createDonut('linkDevicesChart', devices, link?.totalClicks?.toLocaleString());
    }
    if (browsers.length > 0) {
      createDonut('linkBrowsersChart', browsers, link?.totalClicks?.toLocaleString());
    }
  }, [isLoading, devices, browsers, link]);

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
            Back to Links
          </Link>
        }
      />
    );
  }

  const topLocation = locations[0];
  const maxLocationCount = topLocation?.count || 1;

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
          <span>All time</span>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="metrics-grid">
        <MetricCard
          iconClass="fas fa-mouse-pointer"
          label="Total Clicks"
          value={link.totalClicks?.toLocaleString() || '0'}
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
          secondaryText="Unique / total clicks"
        />
      </div>

      {/* Clicks Over Time */}
      <div className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Clicks Over Time</h2>
        </div>
        {chartData.length === 0 ? (
          <EmptyState
            icon="fas fa-chart-area"
            title="No click data yet"
            description="Share this link to start seeing click activity."
          />
        ) : (
          <svg id="linkMainChart" ref={chartRef}></svg>
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
                  <div
                    className="location-bar-fill"
                    style={{ width: `${(loc.count / maxLocationCount) * 100}%` }}
                  ></div>
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
              <svg className="donut-chart" id="linkDevicesChart" ref={devicesRef}></svg>
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
              <svg className="donut-chart" id="linkBrowsersChart" ref={browsersRef}></svg>
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
    </>
  );
};

export default LinkAnalytics;

import React, { useEffect, useState } from 'react';
import MetricCard from '../components/dashboard/MetricCard';
import Skeleton from '../components/ui/Skeleton';
import * as d3 from 'd3';

const Analytics = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return;
        // Sparkline for Total Clicks stat card
        const sparklineData = [85, 90, 95, 88, 92, 98, 105, 102, 110, 115, 120, 118, 125, 130, 128, 135, 140, 145, 150, 148, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
        
        const sparkSvg = d3.select('#totalClicksSparkline');
        sparkSvg.selectAll("*").remove(); // clear previous renders
        const sparkWidth = 80;
        const sparkHeight = 32;

        const sparkX = d3.scaleLinear()
            .domain([0, sparklineData.length - 1])
            .range([0, sparkWidth]);

        const sparkY = d3.scaleLinear()
            .domain([d3.min(sparklineData), d3.max(sparklineData)])
            .range([sparkHeight - 2, 2]);

        const sparkLine = d3.line()
            .x((d, i) => sparkX(i))
            .y(d => sparkY(d))
            .curve(d3.curveMonotoneX);

        sparkSvg.append('path')
            .datum(sparklineData)
            .attr('fill', 'none')
            .attr('stroke', '#06B6D4')
            .attr('stroke-width', 2)
            .attr('d', sparkLine);

        // Main chart data
        const chartData = [
            {date: 'Nov 15', value: 800},
            {date: 'Nov 17', value: 950},
            {date: 'Nov 19', value: 1100},
            {date: 'Nov 21', value: 1300},
            {date: 'Nov 23', value: 1550},
            {date: 'Nov 25', value: 1750},
            {date: 'Nov 27', value: 1900},
            {date: 'Nov 29', value: 2200},
            {date: 'Dec 1', value: 2500},
            {date: 'Dec 3', value: 2850},
            {date: 'Dec 5', value: 3400},
            {date: 'Dec 7', value: 3800},
            {date: 'Dec 8', value: 3891},
            {date: 'Dec 9', value: 3650},
            {date: 'Dec 11', value: 3300},
            {date: 'Dec 13', value: 3100}
        ];

        // Chart dimensions
        const margin = {top: 20, right: 40, bottom: 40, left: 60};
        const chartContainer = document.getElementById('mainChart');
        if (chartContainer) {
            d3.select('#mainChart').selectAll("*").remove();
            const containerWidth = chartContainer.parentElement.offsetWidth - 48;
            const width = containerWidth - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select('#mainChart')
                .attr('width', containerWidth)
                .attr('height', 400)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scalePoint()
                .domain(chartData.map(d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, 4000])
                .range([height, 0]);

            // Grid lines
            svg.append('g')
                .attr('class', 'grid')
                .selectAll('line')
                .data(y.ticks(5))
                .enter()
                .append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', d => y(d))
                .attr('y2', d => y(d))
                .attr('stroke', '#252836')
                .attr('stroke-width', 1);

            // X-axis
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).tickValues(['Nov 15', 'Nov 22', 'Nov 29', 'Dec 6', 'Dec 13']))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick line').remove())
                .call(g => g.selectAll('text')
                    .attr('fill', '#6B7280')
                    .attr('font-size', '12px')
                    .attr('y', 12));

            // Y-axis
            svg.append('g')
                .call(d3.axisLeft(y).ticks(5).tickFormat(d => d === 0 ? '0' : (d / 1000) + 'k'))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick line').remove())
                .call(g => g.selectAll('text')
                    .attr('fill', '#6B7280')
                    .attr('font-size', '12px')
                    .attr('x', -10));

            // Area
            const area = d3.area()
                .x(d => x(d.date))
                .y0(height)
                .y1(d => y(d.value))
                .curve(d3.curveMonotoneX);

            svg.append('path')
                .datum(chartData)
                .attr('fill', 'rgba(139, 92, 246, 0.08)')
                .attr('d', area);

            // Line
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
                .curve(d3.curveMonotoneX);

            svg.append('path')
                .datum(chartData)
                .attr('fill', 'none')
                .attr('stroke', '#8B5CF6')
                .attr('stroke-width', 2)
                .attr('d', line);

            // Tooltip interaction
            const tooltip = d3.select('#chartTooltip');
            const tooltipDate = d3.select('#tooltipDate');
            const tooltipValue = d3.select('#tooltipValue');

            const focus = svg.append('g')
                .style('display', 'none');

            focus.append('circle')
                .attr('r', 4)
                .attr('fill', '#8B5CF6')
                .attr('stroke', '#F8FAFC')
                .attr('stroke-width', 2);

            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all')
                .on('mouseover', () => {
                    focus.style('display', null);
                    tooltip.style('opacity', 1);
                })
                .on('mouseout', () => {
                    focus.style('display', 'none');
                    tooltip.style('opacity', 0);
                })
                .on('mousemove', function(event) {
                    const [mouseX] = d3.pointer(event);
                    const domain = x.domain();
                    const range = x.range();
                    const rangePoints = d3.range(range[0], range[1], (range[1] - range[0]) / (domain.length - 1));
                    rangePoints.push(range[1]);
                    
                    const index = d3.bisect(rangePoints, mouseX);
                    const d = chartData[Math.min(index, chartData.length - 1)];
                    
                    focus.attr('transform', `translate(${x(d.date)},${y(d.value)})`);
                    
                    tooltipDate.text(d.date);
                    tooltipValue.text(d.value.toLocaleString() + ' clicks');
                    
                    const tooltipX = event.pageX - chartContainer.parentElement.offsetLeft;
                    const tooltipY = event.pageY - chartContainer.parentElement.offsetTop - 80;
                    
                    tooltip
                        .style('left', (tooltipX + 10) + 'px')
                        .style('top', tooltipY + 'px');
                });
        }

        // Donut chart function
        function createDonutChart(elementId, data) {
            const width = 160;
            const height = 160;
            const radius = Math.min(width, height) / 2;
            const innerRadius = radius * 0.6;

            const targetSvg = d3.select(elementId);
            targetSvg.selectAll("*").remove();

            const svg = targetSvg
                .attr('viewBox', `0 0 ${width} ${height}`);

            const g = svg.append('g')
                .attr('transform', `translate(${width / 2},${height / 2})`);

            const color = d3.scaleOrdinal()
                .range(data.map(d => d.color));

            const pie = d3.pie()
                .value(d => d.value)
                .sort(null);

            const arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(radius);

            const arcs = g.selectAll('arc')
                .data(pie(data))
                .enter()
                .append('g');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data.label));

            // Center text
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.2em')
                .attr('font-size', '20px')
                .attr('font-weight', '700')
                .attr('fill', '#F8FAFC')
                .text('48.2k');

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.2em')
                .attr('font-size', '12px')
                .attr('fill', '#6B7280')
                .text('total');
        }

        // Devices donut chart
        const devicesData = [
            {label: 'Mobile', value: 58, color: '#8B5CF6'},
            {label: 'Desktop', value: 31, color: '#06B6D4'},
            {label: 'Tablet', value: 11, color: '#10B981'}
        ];
        createDonutChart('#devicesChart', devicesData);

        // Browsers donut chart
        const browsersData = [
            {label: 'Chrome', value: 52, color: '#8B5CF6'},
            {label: 'Safari', value: 28, color: '#06B6D4'},
            {label: 'Firefox', value: 12, color: '#10B981'},
            {label: 'Other', value: 8, color: '#FBBF24'}
        ];
        createDonutChart('#browsersChart', browsersData);
    }, [isLoading]);

    return (
        <>
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <span>Links</span>
                <i className="fas fa-chevron-right breadcrumb-arrow"></i>
                <span>bkn.so/launch</span>
            </div>

            {/* Page Header */}
            <header className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Product Launch 2024</h1>
                    <div className="short-link-pill">
                        <span>bkn.so/launch</span>
                        <i className="fas fa-copy copy-icon"></i>
                    </div>
                    <span className="status-badge active">Active</span>
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
                    value="48,234"
                    delta="12.4%"
                    deltaPositive={true}
                    secondaryText="vs last period"
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-users"
                    label="Unique Visitors"
                    value="32,451"
                    secondaryText="67.3% of total clicks"
                    isLoading={isLoading}
                />
                <MetricCard 
                    iconClass="fas fa-clock"
                    label="Last Clicked"
                    value="2 mins ago"
                    secondaryText="4:47 PM, Dec 14 2024"
                    isLoading={isLoading}
                />
            </div>

            {/* Main Chart */}
            <div className="chart-card">
                <div className="chart-header">
                    <h2 className="chart-title">Clicks Over Time</h2>
                    <div className="time-toggles">
                        <button className="pill-toggle">7D</button>
                        <button className="pill-toggle active">30D</button>
                        <button className="pill-toggle">90D</button>
                        <button className="pill-toggle">1Y</button>
                    </div>
                </div>
                {isLoading ? (
                    <div style={{ height: '400px', padding: '24px' }}>
                        <Skeleton height="100%" borderRadius="8px" />
                    </div>
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
                    <div className="location-row">
                        <div className="location-left">
                            <span className="location-flag">🇺🇸</span>
                            <span className="location-name">United States</span>
                        </div>
                        <span className="location-count">21,432</span>
                        <div className="location-bar">
                            <div className="location-bar-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div className="location-row">
                        <div className="location-left">
                            <span className="location-flag">🇬🇧</span>
                            <span className="location-name">United Kingdom</span>
                        </div>
                        <span className="location-count">8,234</span>
                        <div className="location-bar">
                            <div className="location-bar-fill" style={{ width: '38%' }}></div>
                        </div>
                    </div>
                    <div className="location-row">
                        <div className="location-left">
                            <span className="location-flag">🇨🇦</span>
                            <span className="location-name">Canada</span>
                        </div>
                        <span className="location-count">5,891</span>
                        <div className="location-bar">
                            <div className="location-bar-fill" style={{ width: '27%' }}></div>
                        </div>
                    </div>
                    <div className="location-row">
                        <div className="location-left">
                            <span className="location-flag">🇩🇪</span>
                            <span className="location-name">Germany</span>
                        </div>
                        <span className="location-count">4,102</span>
                        <div className="location-bar">
                            <div className="location-bar-fill" style={{ width: '19%' }}></div>
                        </div>
                    </div>
                    <div className="location-row">
                        <div className="location-left">
                            <span className="location-flag">🇦🇺</span>
                            <span className="location-name">Australia</span>
                        </div>
                        <span className="location-count">3,891</span>
                        <div className="location-bar">
                            <div className="location-bar-fill" style={{ width: '18%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Devices */}
                <div className="breakdown-card">
                    <h3 className="breakdown-title">Devices</h3>
                    <div className="donut-container">
                        <svg className="donut-chart" id="devicesChart"></svg>
                        <div className="donut-legend">
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#8B5CF6' }}></div>
                                    <span className="legend-label">Mobile</span>
                                </div>
                                <span className="legend-percent">58%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#06B6D4' }}></div>
                                    <span className="legend-label">Desktop</span>
                                </div>
                                <span className="legend-percent">31%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#10B981' }}></div>
                                    <span className="legend-label">Tablet</span>
                                </div>
                                <span className="legend-percent">11%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Browsers */}
                <div className="breakdown-card">
                    <h3 className="breakdown-title">Browsers</h3>
                    <div className="donut-container">
                        <svg className="donut-chart" id="browsersChart"></svg>
                        <div className="donut-legend">
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#8B5CF6' }}></div>
                                    <span className="legend-label">Chrome</span>
                                </div>
                                <span className="legend-percent">52%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#06B6D4' }}></div>
                                    <span className="legend-label">Safari</span>
                                </div>
                                <span className="legend-percent">28%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#10B981' }}></div>
                                    <span className="legend-label">Firefox</span>
                                </div>
                                <span className="legend-percent">12%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#FBBF24' }}></div>
                                    <span className="legend-label">Other</span>
                                </div>
                                <span className="legend-percent">8%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clicks Log Table */}
            <div className="table-card">
                <div className="table-header">
                    <h2 className="table-title">Clicks Log</h2>
                    <button className="export-btn">
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
                        <tr>
                            <td className="td-primary">2 min ago</td>
                            <td className="td-secondary">United States</td>
                            <td className="td-secondary">New York</td>
                            <td className="td-secondary">📱 Mobile</td>
                            <td className="td-secondary">Chrome</td>
                            <td className="td-secondary">iOS</td>
                            <td className="td-secondary">twitter.com</td>
                        </tr>
                        <tr>
                            <td className="td-primary">8 min ago</td>
                            <td className="td-secondary">United Kingdom</td>
                            <td className="td-secondary">London</td>
                            <td className="td-secondary">💻 Desktop</td>
                            <td className="td-secondary">Safari</td>
                            <td className="td-secondary">macOS</td>
                            <td className="td-secondary">google.com</td>
                        </tr>
                        <tr>
                            <td className="td-primary">15 min ago</td>
                            <td className="td-secondary">Canada</td>
                            <td className="td-secondary">Toronto</td>
                            <td className="td-secondary">💻 Desktop</td>
                            <td className="td-secondary">Chrome</td>
                            <td className="td-secondary">Windows</td>
                            <td className="td-secondary">Direct</td>
                        </tr>
                        <tr>
                            <td className="td-primary">24 min ago</td>
                            <td className="td-secondary">Germany</td>
                            <td className="td-secondary">Berlin</td>
                            <td className="td-secondary">📱 Mobile</td>
                            <td className="td-secondary">Safari</td>
                            <td className="td-secondary">iOS</td>
                            <td className="td-secondary">linkedin.com</td>
                        </tr>
                        <tr>
                            <td className="td-primary">31 min ago</td>
                            <td className="td-secondary">Australia</td>
                            <td className="td-secondary">Sydney</td>
                            <td className="td-secondary">💻 Desktop</td>
                            <td className="td-secondary">Firefox</td>
                            <td className="td-secondary">Windows</td>
                            <td className="td-secondary">Direct</td>
                        </tr>
                        <tr>
                            <td className="td-primary">47 min ago</td>
                            <td className="td-secondary">United States</td>
                            <td className="td-secondary">San Francisco</td>
                            <td className="td-secondary">📱 Mobile</td>
                            <td className="td-secondary">Chrome</td>
                            <td className="td-secondary">Android</td>
                            <td className="td-secondary td-truncate">t.co/abc123</td>
                        </tr>
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <div className="pagination-info">Showing 1–6 of 48,234 clicks</div>
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
        </>
    );
};

export default Analytics;

import React, { useEffect, useRef, useState } from 'react';
import Skeleton from '../components/ui/Skeleton';
import * as d3 from 'd3';

const Audiences = () => {
    const mapRendered = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return;
        let cancelled = false;

        // Country data for map visualization
        const countryData = {
            'United States': 94231,
            'United Kingdom': 38102,
            'Canada': 26784,
            'Germany': 19451,
            'Australia': 17230,
            'France': 14891,
            'Brazil': 11234,
            'Japan': 9102,
            'India': 7891,
            'Netherlands': 5432,
            'Spain': 4231,
            'Italy': 3892,
            'Mexico': 3421,
            'Sweden': 2891,
            'Norway': 2456,
            'China': 2234,
            'South Korea': 1891,
            'Singapore': 1456,
            'Switzerland': 1234,
            'Belgium': 892
        };

        // Map visualization
        const mapContainer = document.getElementById('visitorMap');
        if (mapContainer && window.topojson) {
            const mapWidth = mapContainer.parentElement.offsetWidth - 48;
            const mapHeight = 400;

            const mapSvg = d3.select('#visitorMap');
            mapSvg.selectAll("*").remove();

            mapSvg.attr('width', mapWidth).attr('height', mapHeight);

            const projection = d3.geoMercator()
                .scale(mapWidth / 6.5)
                .translate([mapWidth / 2, mapHeight / 1.5]);

            const path = d3.geoPath().projection(projection);
            const maxClicks = d3.max(Object.values(countryData));
            const colorScale = d3.scaleLinear()
                .domain([0, maxClicks / 4, maxClicks / 2, maxClicks])
                .range(['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.7)', '#6D28D9']);

            const tooltip = d3.select('#mapTooltip');
            const tooltipCountry = d3.select('#tooltipCountry');
            const tooltipCount = d3.select('#tooltipCount');

            // Load world map data
            d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                .then(world => {
                    if (cancelled) return; // StrictMode guard

                    const countries = window.topojson.feature(world, world.objects.countries);
                    
                    mapSvg.selectAll("*").remove(); // clear before drawing
                    
                    mapSvg.append('rect')
                        .attr('width', mapWidth)
                        .attr('height', mapHeight)
                        .attr('fill', '#111827');

                    mapSvg.selectAll('path')
                        .data(countries.features)
                        .enter()
                        .append('path')
                        .attr('d', path)
                        .attr('fill', d => {
                            const countryName = d.properties.name;
                            return countryData[countryName] ? colorScale(countryData[countryName]) : '#1E2A3A';
                        })
                        .attr('stroke', '#252836')
                        .attr('stroke-width', 0.5)
                        .style('cursor', d => countryData[d.properties.name] ? 'pointer' : 'default')
                        .on('mouseover', function(event, d) {
                            const countryName = d.properties.name;
                            if (countryData[countryName]) {
                                d3.select(this)
                                    .attr('stroke', '#8B5CF6')
                                    .attr('stroke-width', 1.5);
                                
                                tooltipCountry.text(countryName);
                                tooltipCount.text(countryData[countryName].toLocaleString() + ' clicks');
                                
                                tooltip
                                    .style('left', (event.pageX + 10) + 'px')
                                    .style('top', (event.pageY - 40) + 'px')
                                    .style('opacity', 1);
                            }
                        })
                        .on('mouseout', function(event, d) {
                            d3.select(this)
                                .attr('stroke', '#252836')
                                .attr('stroke-width', 0.5);
                            
                            tooltip
                                .style('display', 'none')
                                .style('opacity', 0);
                        })
                        .on('mousemove', function(event) {
                            tooltip
                                .style('left', (event.pageX + 10) + 'px')
                                .style('top', (event.pageY - 40) + 'px');
                        });

                    mapRendered.current = true;
                })
                .catch(error => {
                    if (cancelled) return;
                    console.error('Error loading map data:', error);
                    mapSvg.append('text')
                        .attr('x', mapWidth / 2)
                        .attr('y', mapHeight / 2)
                        .attr('text-anchor', 'middle')
                        .attr('fill', '#6B7280')
                        .attr('font-size', '14px')
                        .text('Map visualization loading...');
                });
        }

        // Donut chart function
        function createDonutChart(elementId, data) {
            const width = 180;
            const height = 180;
            const radius = Math.min(width, height) / 2;
            const innerRadius = radius * 0.6;

            const targetSvg = d3.select(elementId);
            targetSvg.selectAll("*").remove();

            const svg = targetSvg.attr('viewBox', `0 0 ${width} ${height}`);

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
                .attr('font-size', '22px')
                .attr('font-weight', '700')
                .attr('fill', '#F8FAFC')
                .text('284k');

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.3em')
                .attr('font-size', '13px')
                .attr('fill', '#6B7280')
                .text('total');
        }

        // Devices donut chart
        const devicesData = [
            {label: 'Mobile', value: 61, color: '#8B5CF6'},
            {label: 'Desktop', value: 28, color: '#06B6D4'},
            {label: 'Tablet', value: 11, color: '#10B981'}
        ];
        createDonutChart('#devicesChart', devicesData);

        // Browsers donut chart
        const browsersData = [
            {label: 'Chrome', value: 49, color: '#8B5CF6'},
            {label: 'Safari', value: 31, color: '#06B6D4'},
            {label: 'Firefox', value: 11, color: '#10B981'},
            {label: 'Other', value: 9, color: '#FBBF24'}
        ];
        createDonutChart('#browsersChart', browsersData);

        return () => { cancelled = true; };

    }, [isLoading]);

    return (
        <>
            <header className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Audiences</h1>
                    <p className="page-subtitle">Aggregated visitor data across all your links.</p>
                </div>
                <div className="date-range-selector">
                    <i className="fas fa-calendar"></i>
                    <span>Last 30 days</span>
                    <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
                </div>
            </header>

            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-label">Total Unique Visitors</div>
                    <div className="stat-value-large violet">284,912</div>
                    <div className="stat-trend">
                        <i className="fas fa-arrow-up"></i>
                        <span>+8.3% vs last period</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-globe"></i>
                    </div>
                    <div className="stat-label">Most Active Country</div>
                    <div className="stat-country">
                        <span className="stat-country-flag">🇺🇸</span>
                        <span className="stat-country-name">United States</span>
                    </div>
                    <div className="stat-secondary">94,231 visitors</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-mobile-screen"></i>
                    </div>
                    <div className="stat-label">Most Used Device</div>
                    <div className="stat-device">
                        <i className="fas fa-mobile-screen stat-device-icon"></i>
                        <span className="stat-device-name">Mobile</span>
                    </div>
                    <div className="stat-secondary">61% of all visits</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <svg id="visitorMap"></svg>
                    <div className="map-caption">Hover a country to see click details</div>
                </div>

                <div className="card">
                    <h2 className="card-title">Top Countries</h2>
                    <div className="country-row">
                        <div className="country-left">
                            <span className="country-flag">🇺🇸</span>
                            <span className="country-name">United States</span>
                        </div>
                        <span className="country-count">94,231</span>
                        <div className="country-bar">
                            <div className="country-bar-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div className="country-row">
                        <div className="country-left">
                            <span className="country-flag">🇬🇧</span>
                            <span className="country-name">United Kingdom</span>
                        </div>
                        <span className="country-count">38,102</span>
                        <div className="country-bar">
                            <div className="country-bar-fill" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                    <div className="country-row">
                        <div className="country-left">
                            <span className="country-flag">🇨🇦</span>
                            <span className="country-name">Canada</span>
                        </div>
                        <span className="country-count">26,784</span>
                        <div className="country-bar">
                            <div className="country-bar-fill" style={{ width: '28%' }}></div>
                        </div>
                    </div>
                    <div className="country-row">
                        <div className="country-left">
                            <span className="country-flag">🇩🇪</span>
                            <span className="country-name">Germany</span>
                        </div>
                        <span className="country-count">19,451</span>
                        <div className="country-bar">
                            <div className="country-bar-fill" style={{ width: '21%' }}></div>
                        </div>
                    </div>
                    <div className="country-row">
                        <div className="country-left">
                            <span className="country-flag">🇦🇺</span>
                            <span className="country-name">Australia</span>
                        </div>
                        <span className="country-count">17,230</span>
                        <div className="country-bar">
                            <div className="country-bar-fill" style={{ width: '18%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="breakdown-grid">
                <div className="card">
                    <h3 className="card-title">Devices</h3>
                    <div className="donut-container">
                        <svg className="donut-chart" id="devicesChart"></svg>
                        <div className="donut-legend">
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#8B5CF6' }}></div>
                                    <span className="legend-label">Mobile</span>
                                </div>
                                <span className="legend-percent">61%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#06B6D4' }}></div>
                                    <span className="legend-label">Desktop</span>
                                </div>
                                <span className="legend-percent">28%</span>
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

                <div className="card">
                    <h3 className="card-title">Browsers</h3>
                    <div className="donut-container">
                        <svg className="donut-chart" id="browsersChart"></svg>
                        <div className="donut-legend">
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#8B5CF6' }}></div>
                                    <span className="legend-label">Chrome</span>
                                </div>
                                <span className="legend-percent">49%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#06B6D4' }}></div>
                                    <span className="legend-label">Safari</span>
                                </div>
                                <span className="legend-percent">31%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#10B981' }}></div>
                                    <span className="legend-label">Firefox</span>
                                </div>
                                <span className="legend-percent">11%</span>
                            </div>
                            <div className="legend-row">
                                <div className="legend-left">
                                    <div className="legend-dot" style={{ background: '#FBBF24' }}></div>
                                    <span className="legend-label">Other</span>
                                </div>
                                <span className="legend-percent">9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Tooltip Portal outside normal flow, injected usually into body, 
                but keeping here as requested since it's just a styled absolute div */}
            <div className="map-tooltip" id="mapTooltip" style={{ opacity: 0 }}>
                <div className="tooltip-country" id="tooltipCountry"></div>
                <div className="tooltip-count" id="tooltipCount"></div>
            </div>

        </>
    );
};

export default Audiences;

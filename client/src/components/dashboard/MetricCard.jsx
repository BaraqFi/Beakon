import React from 'react';

const MetricCard = ({ iconClass, label, value, delta, deltaPositive, secondaryText, highlightText }) => {
    return (
        <div className="metric-card">
            {iconClass && (
                <div className="metric-icon">
                    <i className={iconClass}></i>
                </div>
            )}
            <div className="metric-label">{label}</div>
            {highlightText ? (
                <div className="metric-highlight">{highlightText}</div>
            ) : (
                <div className="metric-value">{value}</div>
            )}
            
            {delta && (
                <span className={`metric-delta ${deltaPositive ? 'positive' : 'negative'}`}>
                    <i className={`fas fa-arrow-${deltaPositive ? 'up' : 'down'}`}></i>
                    {delta}
                </span>
            )}
            
            {secondaryText && (
                <div className="metric-secondary">{secondaryText}</div>
            )}
        </div>
    );
};

export default MetricCard;

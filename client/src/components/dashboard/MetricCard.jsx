import React from 'react';
import Skeleton from '../ui/Skeleton';

const MetricCard = ({ iconClass, label, value, delta, deltaPositive, secondaryText, highlightText, isLoading }) => {
    if (isLoading) {
        return (
            <div className="metric-card">
                <Skeleton width="40px" height="40px" borderRadius="50%" style={{ position: 'absolute', top: '20px', right: '20px' }} />
                <Skeleton width="100px" height="16px" style={{ marginBottom: '12px' }} />
                <Skeleton width="140px" height="32px" style={{ marginBottom: '12px' }} />
                <Skeleton width="80px" height="14px" />
            </div>
        );
    }
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

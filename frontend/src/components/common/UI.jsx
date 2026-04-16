import React from 'react';

export const GlassCard = ({ children, className = '', onClick, style = {} }) => (
    <div
        className={`glass ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
        {children}
    </div>
);

export const Badge = ({ status, children }) => {
    const statusClass = `badge-${status}`;
    return <span className={`badge ${statusClass}`}>{children}</span>;
};

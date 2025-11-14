/* src/components/StatCards.js */
import React from 'react';

const StatCard = ({ title, value, subtitle, icon, color = '#007bff', trend, trendLabel, onClick }) => {
    const styles = {
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${color}20`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            cursor: onClick ? 'pointer' : 'default'
        },
        content: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        textContent: {
            flex: 1
        },
        title: {
            fontSize: '0.875rem',
            color: '#6c757d',
            marginBottom: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        value: {
            fontSize: '2.25rem',
            fontWeight: '700',
            color: '#1a1d21',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.2'
        },
        subtitle: {
            fontSize: '0.875rem',
            color: '#6c757d',
            margin: '0'
        },
        trend: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginTop: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            backgroundColor: trend > 0 ? '#d4f8e8' : trend < 0 ? '#f8d7da' : '#e2e3e5',
            color: trend > 0 ? '#0a7b4c' : trend < 0 ? '#d93025' : '#6c757d',
            width: 'fit-content'
        },
        iconContainer: {
            fontSize: '2.5rem',
            opacity: 0.1,
            color: color,
            transition: 'opacity 0.3s ease-in-out'
        }
    };

    return (
        <div 
            style={styles.card}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                }
                e.currentTarget.querySelector('.stat-icon').style.opacity = '0.2';
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }
                e.currentTarget.querySelector('.stat-icon').style.opacity = '0.1';
            }}
        >
            <div style={styles.content}>
                <div style={styles.textContent}>
                    <div style={styles.title}>{title}</div>
                    <div style={styles.value}>{value}</div>
                    {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
                    {(trend || trend === 0) && (
                        <div style={styles.trend}>
                            <span>{trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}</span>
                            <span>{Math.abs(trend)}%</span>
                            {trendLabel && <span style={{marginLeft: '0.25rem'}}>{trendLabel}</span>}
                        </div>
                    )}
                </div>
                <div 
                    className="stat-icon"
                    style={styles.iconContainer}
                >
                    {icon}
                </div>
            </div>
            
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: color
            }} />
        </div>
    );
};

export default StatCard;
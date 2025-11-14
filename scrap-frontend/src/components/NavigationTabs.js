/* src/components/NavigationTabs.js */
import React from 'react';

const NavigationTabs = ({ userRole, activeTab, onTabChange }) => {
    const styles = {
        tabsContainer: {
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '1.5rem',
            border: '1px solid #e9ecef',
            overflowX: 'auto'
        },
        tab: {
            padding: '0.875rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: '#6c757d',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
        },
        activeTab: {
            backgroundColor: '#007bff',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)'
        },
        tabIcon: {
            fontSize: '1rem'
        }
    };

    const tabs = {
        admin: [
            { id: 'overview', label: 'Resumen General', icon: '📊' },
            { id: 'users', label: 'Gestión de Usuarios', icon: '👥' },
            { id: 'reports', label: 'Reportes Avanzados', icon: '📈' },
            { id: 'settings', label: 'Configuración', icon: '⚙️' }
        ],
        operador: [
            { id: 'registro', label: 'Nuevo Registro', icon: '📝' },
            { id: 'historial', label: 'Mis Registros', icon: '📋' },
            { id: 'estadisticas', label: 'Estadísticas', icon: '📊' },
            { id: 'reportes', label: 'Mis Reportes', icon: '📄' }
        ],
        receptor: [
            { id: 'recepcion', label: 'Nueva Recepción', icon: '🏷️' },
            { id: 'pendientes', label: 'Pendientes', icon: '⏳' },
            { id: 'stock', label: 'Stock Disponible', icon: '📦' },
            { id: 'historial', label: 'Historial', icon: '📋' },
            { id: 'reportes', label: 'Reportes', icon: '📊' }
        ]
    };

    const userTabs = tabs[userRole] || [];

    return (
        <div style={styles.tabsContainer}>
            {userTabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        ...styles.tab,
                        ...(activeTab === tab.id && styles.activeTab)
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.color = '#495057';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6c757d';
                        }
                    }}
                >
                    <span style={styles.tabIcon}>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default NavigationTabs;
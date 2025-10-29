// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import UserManagement from '../components/UserManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        apiClient.request('/dashboard/stats'),
        apiClient.request('/dashboard/recent-activity')
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Cargando dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Estadísticas */}
      <section style={styles.statsSection}>
        <h2>Estadísticas Generales</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Usuarios</h3>
            <p style={styles.statNumber}>{stats?.total_usuarios || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Registros de Scrap</h3>
            <p style={styles.statNumber}>{stats?.total_registros || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Recepciones</h3>
            <p style={styles.statNumber}>{stats?.total_recepciones || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Scrap Pendiente</h3>
            <p style={styles.statNumber}>{stats?.scrap_pendiente || 0}</p>
          </div>
        </div>
      </section>

      {/* Actividad Reciente */}
      <section style={styles.activitySection}>
        <h2>Actividad Reciente</h2>
        
        <div style={styles.activityGrid}>
          <div style={styles.activityCard}>
            <h3>Últimos Registros</h3>
            {recentActivity?.registros?.length > 0 ? (
              <ul style={styles.list}>
                {recentActivity.registros.map(registro => (
                  <li key={registro.id} style={styles.listItem}>
                    <strong>{registro.peso_kg}kg</strong> de {registro.tipo_material}
                    <br />
                    <small>Por: {registro.operador?.name}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay registros recientes</p>
            )}
          </div>

          <div style={styles.activityCard}>
            <h3>Últimas Recepciones</h3>
            {recentActivity?.recepciones?.length > 0 ? (
              <ul style={styles.list}>
                {recentActivity.recepciones.map(recepcion => (
                  <li key={recepcion.id} style={styles.listItem}>
                    <strong>HU: {recepcion.numero_hu}</strong>
                    <br />
                    <small>Receptor: {recepcion.receptor?.name}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay recepciones recientes</p>
            )}
          </div>
        </div>
      </section>

      {/* Navegación */}
      <section style={styles.managementSection}>
          <nav style={styles.navigation}>
            <h3>Módulos del Sistema</h3>
            <div style={styles.navGrid}>
              <div style={styles.navCard}>
                <h4>👥 Gestión de Usuarios</h4>
                <p>Crear y administrar usuarios del sistema</p>
              </div>
              <div style={styles.navCard}>
                <h4>📝 Registro de Scrap</h4>
                <p>Registrar nuevo scrap de producción</p>
              </div>
              <div style={styles.navCard}>
                <h4>🏷️ Recepción de Scrap</h4>
                <p>Recibir scrap y generar números HU</p>
              </div>
              <div style={styles.navCard}>
                <h4>📊 Reportes</h4>
                <p>Ver reportes y estadísticas detalladas</p>
              </div>
            </div>
          </nav>
        <UserManagement />
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: '2rem',
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  statsSection: {
    padding: '0 2rem',
    marginBottom: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '0.5rem 0 0 0',
  },
  activitySection: {
    padding: '0 2rem',
    marginBottom: '2rem',
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginTop: '1rem',
  },
  activityCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  navigation: {
    padding: '0 2rem',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  navCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
  },

  managementSection: {
  padding: '0 2rem',
  marginTop: '2rem',
},

};

// Efecto hover para las tarjetas de navegación
styles.navCard[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
};

export default AdminDashboard;
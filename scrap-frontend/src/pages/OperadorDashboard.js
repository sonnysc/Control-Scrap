import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

const OperadorDashboard = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    peso_kg: '',
    tipo_material: '',
    origen: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    
    // Se verifica que los metodos API existen
    console.log('Verificando netodos de apiClient:', {
      createRegistroScrap: typeof apiClient.createRegistroScrap,
      getRegistrosScrap: typeof apiClient.getRegistrosScrap,
      getRegistrosScrapStats: typeof apiClient.getRegistroScrapStats
    });
    
    loadOperadorData();
  }, []);

  const loadOperadorData = async () => {
    try {
      const [registrosData, statsData] = await Promise.all([
        apiClient.getRegistrosScrap(),
        apiClient.getRegistroScrapStats()
      ]);
      
      setRegistros(registrosData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos del operador:', error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar nuevo registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiClient.createRegistroScrap(formData);
      alert('Registro de scrap creado exitosamente');
      setShowModal(false);
      setFormData({ peso_kg: '', tipo_material: '', origen: '' });
      loadOperadorData(); // Recargar datos
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Traducir tipo de material
  const getMaterialLabel = (tipo) => {
    const materiales = {
      cobre: 'cobre',
      aluminio: 'aluminio',
      mixto: 'mixto'
    };
    return materiales[tipo] || tipo;
  };

  if (loading) {
    return <div style={styles.loading}>Cargando dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Estadísticas */}
      <section style={styles.statsSection}>
        <h2>Mis Estadísticas</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Registros</h3>
            <p style={styles.statNumber}>{stats?.total_registros || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Peso Total</h3>
            <p style={styles.statNumber}>{stats?.total_peso_kg || 0} kg</p>
          </div>
          <div style={styles.statCard}>
            <h3>Pendientes</h3>
            <p style={styles.statNumber}>{stats?.pendientes || 0}</p>
          </div>
          <div style={styles.statCard}>
            <button 
              onClick={() => setShowModal(true)}
              style={styles.createButton}
            >
              + Nuevo Registro
            </button>
          </div>
        </div>
      </section>

      {/* Lista de Registros Recientes */}
      <section style={styles.registrosSection}>
        <h2>Mis Registros Recientes</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Peso (kg)</th>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Origen</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(registro => (
                <tr key={registro.id} style={styles.tr}>
                  <td style={styles.td}>
                    {new Date(registro.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>{registro.peso_kg} kg</td>
                  <td style={styles.td}>{getMaterialLabel(registro.tipo_material)}</td>
                  <td style={styles.td}>{registro.origen}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.status,
                      ...(registro.estado === 'pendiente' ? styles.pendiente : styles.recibido)
                    }}>
                      {registro.estado === 'pendiente' ? 'Pendiente' : 'Recibido'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {registros.length === 0 && (
            <div style={styles.emptyState}>
              No hay registros de scrap. ¡Crea tu primer registro!
            </div>
          )}
        </div>
      </section>

      {/* Modal para crear nuevo registro */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Nuevo Registro de Scrap</h3>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Peso (kg):</label>
                <input
                  type="number"
                  name="peso_kg"
                  value={formData.peso_kg}
                  onChange={handleInputChange}
                  style={styles.input}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Material:</label>
                <select
                  name="tipo_material"
                  value={formData.tipo_material}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="cobre">Cobre</option>
                  <option value="aluminio">Aluminio</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Origen/Área:</label>
                <input
                  type="text"
                  name="origen"
                  value={formData.origen}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Ej: Área de Cortes, Línea 1, etc."
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  Registrar Scrap
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  createButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
  },
  registrosSection: {
    padding: '0 2rem',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '1rem',
  },
  status: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  pendiente: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  recibido: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: 1,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6c757d',
  },
};

export default OperadorDashboard;
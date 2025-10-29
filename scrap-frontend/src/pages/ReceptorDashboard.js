// src/pages/ReceptorDashboard.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

const ReceptorDashboard = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [recepciones, setRecepciones] = useState([]);
  const [registrosPendientes, setRegistrosPendientes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    registro_scrap_id: '',
    peso_kg: '',
    tipo_material: '',
    origen_tipo: 'interna',
    origen_especifico: '',
    destino: 'reciclaje',
    observaciones: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadReceptorData();
  }, []);

  const loadReceptorData = async () => {
    try {
      const [recepcionesData, pendientesData, statsData] = await Promise.all([
        apiClient.getRecepcionesScrap(),
        apiClient.getRegistrosPendientes(),
        apiClient.getRecepcionScrapStats()
      ]);
      
      setRecepciones(recepcionesData);
      setRegistrosPendientes(pendientesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos del receptor:', error);
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

    // Si se selecciona un registro pendiente, cargar sus datos
    if (name === 'registro_scrap_id' && value) {
      const registro = registrosPendientes.find(r => r.id == value);
      if (registro) {
        setFormData(prev => ({
          ...prev,
          peso_kg: registro.peso_kg,
          tipo_material: registro.tipo_material,
          origen_especifico: registro.origen
        }));
      }
    }
  };

  // Enviar nueva recepción
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.createRecepcionScrap(formData);
      alert(`Recepción creada exitosamente! Número HU: ${response.numero_hu}`);
      setShowModal(false);
      setFormData({
        registro_scrap_id: '',
        peso_kg: '',
        tipo_material: 'cobre',
        origen_tipo: 'interna',
        origen_especifico: '',
        destino: 'reciclaje',
        observaciones: ''
      });
      loadReceptorData(); // Recargar datos
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Traducir valores
  const getMaterialLabel = (tipo) => {
    const materiales = { cobre: 'Cobre', aluminio: 'Aluminio', mixto: 'Mixto' };
    return materiales[tipo] || tipo;
  };

  const getDestinoLabel = (destino) => {
    const destinos = { reciclaje: 'Reciclaje', venta: 'Venta', almacenamiento: 'Almacenamiento' };
    return destinos[destino] || destino;
  };

  const getOrigenTipoLabel = (tipo) => {
    return tipo === 'interna' ? 'Interna' : 'Externa';
  };

  if (loading) {
    return <div style={styles.loading}>Cargando dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1>Dashboard - Receptor de Scrap</h1>
        <div style={styles.userInfo}>
          <span>Receptor: {user.name}</span>
          <button onClick={logout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <section style={styles.statsSection}>
        <h2>Estadísticas</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Recepciones</h3>
            <p style={styles.statNumber}>{stats?.total_recepciones || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Peso Total</h3>
            <p style={styles.statNumber}>{stats?.total_peso_kg || 0} kg</p>
          </div>
          <div style={styles.statCard}>
            <h3>Registros Pendientes</h3>
            <p style={styles.statNumber}>{stats?.registros_pendientes || 0}</p>
          </div>
          <div style={styles.statCard}>
            <button 
              onClick={() => setShowModal(true)}
              style={styles.createButton}
              disabled={registrosPendientes.length === 0}
            >
              + Nueva Recepción
            </button>
            {registrosPendientes.length === 0 && (
              <p style={styles.noPendientes}>No hay registros pendientes</p>
            )}
          </div>
        </div>

        {/* Distribución por destino */}
        {stats?.destinos && stats.destinos.length > 0 && (
          <div style={styles.destinosSection}>
            <h3>Distribución por Destino</h3>
            <div style={styles.destinosGrid}>
              {stats.destinos.map((destino, index) => (
                <div key={index} style={styles.destinoCard}>
                  <h4>{getDestinoLabel(destino.destino)}</h4>
                  <p>{destino.count} recepciones</p>
                  <p>{destino.peso_total} kg</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Registros Pendientes */}
      <section style={styles.pendientesSection}>
        <h2>Registros Pendientes de Recepción ({registrosPendientes.length})</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Peso (kg)</th>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Origen</th>
                <th style={styles.th}>Operador</th>
              </tr>
            </thead>
            <tbody>
              {registrosPendientes.map(registro => (
                <tr key={registro.id} style={styles.tr}>
                  <td style={styles.td}>#{registro.id}</td>
                  <td style={styles.td}>
                    {new Date(registro.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>{registro.peso_kg} kg</td>
                  <td style={styles.td}>{getMaterialLabel(registro.tipo_material)}</td>
                  <td style={styles.td}>{registro.origen}</td>
                  <td style={styles.td}>{registro.operador?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {registrosPendientes.length === 0 && (
            <div style={styles.emptyState}>
              No hay registros pendientes de recepción.
            </div>
          )}
        </div>
      </section>

      {/* Recepciones Realizadas */}
      <section style={styles.recepcionesSection}>
        <h2>Recepciones Realizadas</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Número HU</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Peso (kg)</th>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Origen</th>
                <th style={styles.th}>Destino</th>
              </tr>
            </thead>
            <tbody>
              {recepciones.map(recepcion => (
                <tr key={recepcion.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{recepcion.numero_hu}</strong>
                  </td>
                  <td style={styles.td}>
                    {new Date(recepcion.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>{recepcion.peso_kg} kg</td>
                  <td style={styles.td}>{getMaterialLabel(recepcion.tipo_material)}</td>
                  <td style={styles.td}>
                    {getOrigenTipoLabel(recepcion.origen_tipo)} - {recepcion.origen_especifico}
                  </td>
                  <td style={styles.td}>{getDestinoLabel(recepcion.destino)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {recepciones.length === 0 && (
            <div style={styles.emptyState}>
              No se han realizado recepciones aún.
            </div>
          )}
        </div>
      </section>

      {/* Modal para crear nueva recepción */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Nueva Recepción de Scrap</h3>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Registro Pendiente:</label>
                <select
                  name="registro_scrap_id"
                  value={formData.registro_scrap_id}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Seleccionar registro pendiente</option>
                  {registrosPendientes.map(registro => (
                    <option key={registro.id} value={registro.id}>
                      #{registro.id} - {registro.peso_kg}kg {getMaterialLabel(registro.tipo_material)} - {registro.origen}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Peso Recibido (kg):</label>
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
                <label style={styles.label}>Tipo de Origen:</label>
                <select
                  name="origen_tipo"
                  value={formData.origen_tipo}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="interna">Interna (Producción propia)</option>
                  <option value="externa">Externa (Otra planta/proveedor)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Origen Específico:</label>
                <input
                  type="text"
                  name="origen_especifico"
                  value={formData.origen_especifico}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Ej: Planta Norte, Proveedor XYZ, etc."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Destino:</label>
                <select
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="reciclaje">Reciclaje</option>
                  <option value="venta">Venta</option>
                  <option value="almacenamiento">Almacenamiento</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones:</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Observaciones adicionales..."
                  rows="3"
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  Generar Recepción y HU
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
  noPendientes: {
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '0.5rem',
  },
  destinosSection: {
    marginTop: '2rem',
  },
  destinosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  destinoCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  pendientesSection: {
    padding: '0 2rem',
    marginBottom: '2rem',
  },
  recepcionesSection: {
    padding: '0 2rem',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginTop: '1rem',
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    resize: 'vertical',
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

export default ReceptorDashboard;
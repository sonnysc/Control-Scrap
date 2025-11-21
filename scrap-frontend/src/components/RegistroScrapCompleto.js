/* src/components/RegistroScrapCompleto.js */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';
import BasculaConnection from './BasculaConnection';
import { useToast } from '../context/ToastContext'; 

const RegistroScrapCompleto = ({ onRegistroCreado, onCancelar }) => {
  const { addToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campoBasculaActivo, setCampoBasculaActivo] = useState('peso_cobre_estanado');
  const [enviando, setEnviando] = useState(false);

  // Estado para el formulario principal
  const [formData, setFormData] = useState({
    turno: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Estado para los datos de la tabla
  const [tablaData, setTablaData] = useState([]);
  const [celdaActiva, setCeldaActiva] = useState(null);

  // Estado para filtros
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [maquinasDisponibles, setMaquinasDisponibles] = useState([]);

  const ultimoPesoRef = useRef(null);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    try {
      const configData = await apiClient.getRegistrosConfig();
      setConfig(configData);
      inicializarTablaData(configData);
    } catch (error) {
      addToast('Error cargando configuración: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const inicializarTablaData = useCallback((configData) => {
    if (!configData?.areas_maquinas) return;

    const data = [];
    const areas = [];
    
    Object.entries(configData.areas_maquinas).forEach(([areaNombre, maquinas]) => {
      areas.push(areaNombre);
      maquinas.forEach(maquina => {
        data.push({
          area_real: areaNombre,
          maquina_real: maquina.maquina_nombre,
          peso_cobre: 0,
          peso_cobre_estanado: 0,
          peso_purga_pvc: 0,
          peso_purga_pe: 0,
          peso_purga_pur: 0,
          peso_purga_pp: 0,
          peso_cable_pvc: 0,
          peso_cable_pe: 0,
          peso_cable_pur: 0,
          peso_cable_pp: 0,
          peso_cable_aluminio: 0,
          peso_cable_estanado_pvc: 0,
          peso_cable_estanado_pe: 0,
          peso_total: 0,
          conexion_bascula: false
        });
      });
    });

    setTablaData(data);
    setAreasDisponibles(areas);
  }, []);

  useEffect(() => { 
    loadConfig(); 
  }, [loadConfig]);

  // Filtrar maquinas cuando cambia el área
  useEffect(() => {
    if (!config?.areas_maquinas || !filtroArea) {
      setMaquinasDisponibles([]);
      return;
    }

    const maquinas = config.areas_maquinas[filtroArea]?.map(m => m.maquina_nombre) || [];
    setMaquinasDisponibles(maquinas);
    
    // Si hay solo una máquina, seleccionarla automáticamente
    if (maquinas.length === 1) {
      setFiltroMaquina(maquinas[0]);
    } else {
      setFiltroMaquina('');
    }
  }, [filtroArea, config]);

  // Manejar peso desde báscula
  const handlePesoFromBascula = useCallback((peso, campo = campoBasculaActivo) => {
    if (!celdaActiva || !campo) return;

    const { areaIndex } = celdaActiva;
    
    setTablaData(prev => {
      const newData = [...prev];
      
      if (newData[areaIndex]) {
        newData[areaIndex] = {
          ...newData[areaIndex],
          [campo]: peso,
          conexion_bascula: peso > 0,
          peso_total: calcularTotalFila({ ...newData[areaIndex], [campo]: peso })
        };
      }
      
      return newData;
    });

    if (peso > 0) {
      addToast(`Peso ${peso}kg asignado a ${campo} en ${tablaData[areaIndex]?.maquina_real}`, 'info');
    }
    
    ultimoPesoRef.current = peso;
  }, [celdaActiva, campoBasculaActivo, addToast, tablaData]);

  // Calcular total por fila
  const calcularTotalFila = (fila) => {
    const camposPeso = [
      'peso_cobre', 
      'peso_cobre_estanado', 
      'peso_purga_pvc', 
      'peso_purga_pe',
      'peso_purga_pur', 
      'peso_purga_pp', 
      'peso_cable_pvc', 
      'peso_cable_pe',
      'peso_cable_pur', 
      'peso_cable_pp', 
      'peso_cable_aluminio',
      'peso_cable_estanado_pvc', 
      'peso_cable_estanado_pe'
    ];

    return camposPeso.reduce((total, campo) => total + (parseFloat(fila[campo]) || 0), 0);
  };

  // Manejar cambio manual de input en tabla
  const handleInputChangeTabla = (areaIndex, campo, valor) => {
    setTablaData(prev => {
      const newData = [...prev];
      newData[areaIndex] = {
        ...newData[areaIndex],
        [campo]: parseFloat(valor) || 0,
        peso_total: calcularTotalFila({ ...newData[areaIndex], [campo]: parseFloat(valor) || 0 })
      };
      return newData;
    });
  };

  // Activar celda para báscula
  const activarCeldaParaBascula = (areaIndex, campo) => {
    setCeldaActiva({ areaIndex, campo });
    setCampoBasculaActivo(campo);
    
    const fila = tablaData[areaIndex];
    addToast(`Celda activada: ${fila.maquina_real} - ${campo} - Listo para báscula`, 'info');
  };

  // Función para seleccionar área/máquina rápidamente
  const seleccionarAreaMaquina = (area, maquina) => {
    if (!area || !maquina) return;

    // Encontrar el índice de la fila que coincide con área y máquina
    const index = tablaData.findIndex(fila => 
      fila.area_real === area && fila.maquina_real === maquina
    );

    if (index !== -1 && campoBasculaActivo) {
      setCeldaActiva({ areaIndex: index, campo: campoBasculaActivo });
      addToast(`✅ ${maquina} seleccionada - Listo para báscula en ${campoBasculaActivo}`, 'success');
    }
  };

  // Enviar todos los registros
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.turno) {
      addToast('Seleccione el turno', 'warning');
      return;
    }

    const filasConPeso = tablaData.filter(fila => 
      Object.keys(fila).some(k => k.startsWith('peso_') && parseFloat(fila[k]) > 0)
    );

    if (filasConPeso.length === 0) {
      addToast('Ingrese al menos un peso en alguna fila', 'warning');
      return;
    }

    setEnviando(true);
    try {
      const promises = filasConPeso.map(fila => 
        apiClient.createRegistroScrap({
          ...formData,
          ...fila,
          numero_lote: `LOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          observaciones: 'Registro múltiple desde tabla'
        })
      );

      const resultados = await Promise.all(promises);
      
      addToast(`${resultados.length} registros guardados exitosamente`, 'success');
      
      if (onRegistroCreado) {
        onRegistroCreado();
      }
      
    } catch (error) {
      console.error('❌ Error guardando registros:', error);
      addToast('Error al guardar registros: ' + error.message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  // Calcular totales por columna
  const calcularTotalesColumnas = () => {
    const totales = {};
    const camposPeso = [
      'peso_cobre', 'peso_cobre_estanado', 'peso_purga_pvc', 'peso_purga_pe',
      'peso_purga_pur', 'peso_purga_pp', 'peso_cable_pvc', 'peso_cable_pe',
      'peso_cable_pur', 'peso_cable_pp', 'peso_cable_aluminio',
      'peso_cable_estanado_pvc', 'peso_cable_estanado_pe'
    ];

    camposPeso.forEach(campo => {
      totales[campo] = tablaData.reduce((sum, fila) => sum + (parseFloat(fila[campo]) || 0), 0);
    });

    totales.general = tablaData.reduce((sum, fila) => sum + (parseFloat(fila.peso_total) || 0), 0);

    return totales;
  };

  // Filtrar datos para mostrar (si hay filtros aplicados)
  const datosFiltrados = tablaData.filter(fila => {
    if (filtroArea && fila.area_real !== filtroArea) return false;
    if (filtroMaquina && fila.maquina_real !== filtroMaquina) return false;
    return true;
  });

  if (loading) return <div style={styles.loading}>Cargando configuración...</div>;

  const totales = calcularTotalesColumnas();
  const tiposScrap = config?.tipos_scrap ? Object.values(config.tipos_scrap).flat() : [];
  const filasConPeso = tablaData.filter(fila => fila.peso_total > 0).length;

  return (
    <div style={styles.container}>
      {/* Báscula y Controles Principales */}
      <div style={styles.basculaPanel}>
        <BasculaConnection
          onPesoObtenido={handlePesoFromBascula}
          campoDestino={campoBasculaActivo}
        />
        
        <div style={styles.controlesSuperiores}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Fecha:</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              style={styles.input}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <label style={styles.label}>Turno:</label>
            <select
              value={formData.turno}
              onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
              style={styles.select}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="1">Turno 1</option>
              <option value="2">Turno 2</option>
              <option value="3">Turno 3</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Campo báscula:</label>
            <select
              value={campoBasculaActivo}
              onChange={(e) => setCampoBasculaActivo(e.target.value)}
              style={styles.select}
            >
              {tiposScrap.map(t => (
                <option key={t.columna_db} value={t.columna_db}>
                  {t.tipo_nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FILTRO RÁPIDO PARA SELECCIONAR ÁREA/MÁQUINA */}
      <div style={styles.filtroRapido}>
        <h4 style={styles.filtroTitulo}>🔍 SELECCIÓN RÁPIDA DE MÁQUINA</h4>
        <div style={styles.filtroControles}>
          <div style={styles.filtroGroup}>
            <label style={styles.label}>Área:</label>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              style={styles.select}
            >
              <option value="">Todas las áreas</option>
              {areasDisponibles.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div style={styles.filtroGroup}>
            <label style={styles.label}>Máquina:</label>
            <select
              value={filtroMaquina}
              onChange={(e) => setFiltroMaquina(e.target.value)}
              style={styles.select}
            >
              <option value="">Todas las máquinas</option>
              {maquinasDisponibles.map(maquina => (
                <option key={maquina} value={maquina}>{maquina}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => seleccionarAreaMaquina(filtroArea, filtroMaquina)}
            disabled={!filtroArea || !filtroMaquina || !campoBasculaActivo}
            style={styles.btnSeleccionar}
          >
            🎯 Seleccionar para Báscula
          </button>

          <button
            type="button"
            onClick={() => {
              setFiltroArea('');
              setFiltroMaquina('');
              setCeldaActiva(null);
            }}
            style={styles.btnLimpiar}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>

        {/* Indicador de selección actual */}
        {celdaActiva && (
          <div style={styles.indicadorSeleccion}>
            <span style={styles.indicadorTexto}>
              ✅ <strong>MÁQUINA ACTIVA:</strong> {tablaData[celdaActiva.areaIndex]?.maquina_real} | 
              <strong> CAMPO:</strong> {campoBasculaActivo}
            </span>
          </div>
        )}
      </div>

      {/* Tabla de datos */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.tablaContainer}>
          <div style={styles.tablaHeader}>
            <h4 style={styles.tablaTitulo}>
              📊 TABLA DE REGISTRO MASIVO - {datosFiltrados.length} MÁQUINAS
              {filtroArea && ` - FILTRADO: ${filtroArea}`}
              {filtroMaquina && ` / ${filtroMaquina}`}
            </h4>
          </div>
          
          <div style={styles.tablaWrapper}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  <th style={styles.th}>ÁREA</th>
                  <th style={styles.th}>MÁQUINA</th>
                  {tiposScrap.map(tipo => (
                    <th key={tipo.columna_db} style={styles.th}>
                      {tipo.tipo_nombre}
                    </th>
                  ))}
                  <th style={styles.th}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((fila, index) => {
                  // Encontrar el índice real en tablaData
                  const realIndex = tablaData.findIndex(item => 
                    item.area_real === fila.area_real && item.maquina_real === fila.maquina_real
                  );
                  
                  const estaActiva = celdaActiva?.areaIndex === realIndex;
                  
                  return (
                    <tr 
                      key={`${fila.area_real}-${fila.maquina_real}`} 
                      style={{
                        ...styles.tr,
                        ...(estaActiva ? styles.filaActiva : {})
                      }}
                    >
                      <td style={styles.td}>{fila.area_real}</td>
                      <td style={styles.td}>
                        <div style={styles.celdaMaquina}>
                          {fila.maquina_real}
                          {estaActiva && <span style={styles.indicadorActivo}>🎯</span>}
                        </div>
                      </td>
                      
                      {tiposScrap.map(tipo => {
                        const valor = fila[tipo.columna_db];
                        const celdaEstaActiva = estaActiva && campoBasculaActivo === tipo.columna_db;
                        
                        return (
                          <td key={tipo.columna_db} style={styles.td}>
                            <input
                              type="number"
                              step="0.001"
                              value={valor || ''}
                              onChange={(e) => handleInputChangeTabla(realIndex, tipo.columna_db, e.target.value)}
                              onFocus={() => activarCeldaParaBascula(realIndex, tipo.columna_db)}
                              style={{
                                ...styles.celdaInput,
                                ...(valor > 0 ? styles.celdaConDatos : {}),
                                ...(celdaEstaActiva ? styles.celdaActiva : {})
                              }}
                              placeholder="0.000"
                            />
                          </td>
                        );
                      })}
                      
                      <td style={styles.tdTotal}>
                        <strong>{fila.peso_total.toFixed(3)}</strong>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Fila de totales */}
                <tr style={styles.trTotal}>
                  <td style={styles.tdTotal} colSpan="2">
                    <strong>TOTAL GENERAL</strong>
                  </td>
                  {tiposScrap.map(tipo => (
                    <td key={tipo.columna_db} style={styles.tdTotal}>
                      <strong>{totales[tipo.columna_db].toFixed(3)}</strong>
                    </td>
                  ))}
                  <td style={styles.tdTotalGeneral}>
                    <strong>{totales.general.toFixed(3)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.resumen}>
            <strong>📋 RESUMEN:</strong> {filasConPeso} de {tablaData.length} máquinas con datos | 
            <strong> TOTAL: {totales.general.toFixed(3)} kg</strong>
          </div>
          <div style={styles.actions}>
            <button type="button" onClick={onCancelar} style={styles.btnCancel}>
              ❌ Cancelar
            </button>
            <button 
              type="submit" 
              disabled={enviando || !formData.turno || filasConPeso === 0}
              style={styles.btnSubmit}
            >
              {enviando ? '💾 Guardando...' : `💾 Guardar ${filasConPeso} Registros`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    fontSize: '1.2rem'
  },
  basculaPanel: {
    marginBottom: '1rem'
  },
  controlesSuperiores: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '-1rem',
    flexWrap: 'wrap'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    minWidth: '80px'
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    fontSize: '0.9rem'
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    fontSize: '0.9rem',
    minWidth: '150px'
  },
  // Filtro rápido
  filtroRapido: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
    border: '2px solid #e5e7eb'
  },
  filtroTitulo: {
    margin: '0 0 1rem 0',
    color: '#1f2937',
    fontSize: '1rem',
    textAlign: 'center'
  },
  filtroControles: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  filtroGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  btnSeleccionar: {
    padding: '0.6rem 1rem',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    ':disabled': {
      backgroundColor: '#9CA3AF',
      cursor: 'not-allowed'
    }
  },
  btnLimpiar: {
    padding: '0.6rem 1rem',
    backgroundColor: '#6B7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  indicadorSeleccion: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#DBEAFE',
    border: '2px solid #3B82F6',
    borderRadius: '6px',
    textAlign: 'center'
  },
  indicadorTexto: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  // Tabla
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  tablaContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tablaHeader: {
    padding: '1rem',
    backgroundColor: '#1f2937',
    color: 'white'
  },
  tablaTitulo: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  tablaWrapper: {
    overflowX: 'auto',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  th: {
    backgroundColor: '#374151',
    color: 'white',
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.75rem',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    minWidth: '100px',
    borderRight: '1px solid #4B5563'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  },
  filaActiva: {
    backgroundColor: '#FEF3C7',
    borderLeft: '4px solid #F59E0B'
  },
  trTotal: {
    backgroundColor: '#1e40af',
    color: 'white',
    fontWeight: 'bold',
    position: 'sticky',
    bottom: 0
  },
  td: {
    padding: '0.5rem',
    textAlign: 'center',
    borderRight: '1px solid #f3f4f6',
    verticalAlign: 'middle'
  },
  celdaMaquina: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600'
  },
  indicadorActivo: {
    fontSize: '1rem'
  },
  tdTotal: {
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#f8fafc'
  },
  tdTotalGeneral: {
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    backgroundColor: '#1e40af',
    color: 'white'
  },
  celdaInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    textAlign: 'right',
    fontSize: '0.8rem',
    backgroundColor: 'white',
    transition: 'all 0.2s'
  },
  celdaConDatos: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    fontWeight: '600',
    color: '#166534'
  },
  celdaActiva: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
    boxShadow: '0 0 0 2px #F59E0B',
    fontWeight: 'bold'
  },
  // Footer
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  resumen: {
    fontSize: '0.9rem',
    color: '#6b7280',
    flex: 1
  },
  actions: {
    display: 'flex',
    gap: '1rem'
  },
  btnCancel: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #D1D5DB',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  btnSubmit: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: '#2563EB',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    ':disabled': {
      backgroundColor: '#9CA3AF',
      cursor: 'not-allowed'
    }
  }
};

export default RegistroScrapCompleto;
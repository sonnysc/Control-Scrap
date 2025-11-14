import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';
import BasculaConnection from './BasculaConnection';

const EnhancedScrapForm = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [campoBascula, setCampoBascula] = useState('peso_cobre_estanado');
    const [activeCategory, setActiveCategory] = useState('');
    const [materialAnterior, setMaterialAnterior] = useState('');
    const [mensajeInfo, setMensajeInfo] = useState('');

    const [formData, setFormData] = useState({
        turno: '',
        area_real: '',
        maquina_real: '',
        peso_cobre_estanado: '',
        peso_purga_pvc: '',
        peso_purga_pe: '',
        peso_purga_pur: '',
        peso_purga_pp: '',
        peso_cable_pvc: '',
        peso_cable_pe: '',
        peso_cable_pur: '',
        peso_cable_pp: '',
        peso_cable_aluminio: '',
        peso_cable_estanado_pvc: '',
        peso_cable_estanado_pe: '',
        conexion_bascula: false,
        numero_lote: '',
        observaciones: ''
    });

    const [showReporteOptions, setShowReporteOptions] = useState(false);
    const [pesoTotal, setPesoTotal] = useState(0);
    const [ultimoCampoActualizado, setUltimoCampoActualizado] = useState('');
    const campoBasculaRef = useRef(campoBascula);

    const styles = {
        container: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            border: '1px solid #e1e5e9',
            minHeight: '600px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid #f0f2f5'
        },
        title: {
            margin: 0,
            color: '#1a1d21',
            fontSize: '1.5rem',
            fontWeight: '600'
        },
        layout: {
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '2rem',
            alignItems: 'start'
        },
        mainContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        },
        sidebar: {
            position: 'sticky',
            top: '2rem'
        },
        basculaCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '1.5rem',
            border: '1px solid #e9ecef',
            marginBottom: '1.5rem'
        },
        categoryTabs: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
        },
        categoryTab: {
            padding: '0.75rem 1.25rem',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease-in-out'
        },
        activeCategoryTab: {
            backgroundColor: '#007bff',
            color: 'white',
            borderColor: '#007bff'
        },
        inputsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
        },
        inputCard: {
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '1.25rem',
            transition: 'all 0.2s ease-in-out'
        },
        inputLabel: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '0.75rem'
        },
        inputGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        numberInput: {
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            width: '120px',
            textAlign: 'right',
            transition: 'all 0.2s'
        },
        unit: {
            fontSize: '0.875rem',
            color: '#6c757d',
            fontWeight: '500'
        },
        infoSection: {
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
        },
        formRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057'
        },
        select: {
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            transition: 'all 0.2s'
        },
        input: {
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
        },
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        summaryCard: {
            backgroundColor: '#e8f5e8',
            border: '2px solid #28a745',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            position: 'sticky',
            top: '2rem'
        },
        totalLabel: {
            fontSize: '1rem',
            color: '#2d5016',
            fontWeight: '600',
            marginBottom: '0.5rem'
        },
        totalValue: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#28a745',
            margin: '0 0 1.5rem 0'
        },
        submitButton: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            width: '100%',
            transition: 'all 0.2s ease-in-out'
        },
        campoSelector: {
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
        },
        selectorLabel: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '0.5rem'
        },
        selector: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'white'
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
            padding: '2rem'
        },
        modal: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        },
        modalActions: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1.5rem'
        },
        reporteButton: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s'
        },
        continuarButton: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
        },
        loading: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '1.2rem',
            color: '#6c757d'
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const calcularTotal = useCallback(() => {
        const total = Object.keys(formData)
            .filter(key => key.startsWith('peso_'))
            .reduce((sum, key) => sum + (parseFloat(formData[key]) || 0), 0);

        setPesoTotal(total);
        return total.toFixed(2);
    }, [formData]);

    useEffect(() => {
        calcularTotal();
    }, [calcularTotal]);

    useEffect(() => {
        if (config && config.tipos_scrap) {
            setActiveCategory(Object.keys(config.tipos_scrap)[0]);
            const primerCampo = Object.values(config.tipos_scrap).flat()[0]?.columna_db;
            if (primerCampo) {
                setCampoBascula(primerCampo);
            }
        }
    }, [config]);

    useEffect(() => {
        console.log('🔄 FormData actualizado:', formData);
        console.log('🎯 Campo báscula actual:', campoBascula);
    }, [formData, campoBascula]);

    useEffect(() => {
        campoBasculaRef.current = campoBascula;
        console.log(`🎯 Campo destino actualizado: ${campoBascula}`);
    }, [campoBascula]);

    // Efecto para el feedback visual "Cambiando..."
    useEffect(() => {
        if (materialAnterior && materialAnterior !== campoBascula) {
            const timer = setTimeout(() => {
                setMaterialAnterior('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [materialAnterior, campoBascula]);

    const loadConfig = async () => {
        try {
            const configData = await apiClient.getRegistrosConfig();
            setConfig(configData);
        } catch (error) {
            alert('Error cargando configuración: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePesoFromBascula = (peso, campoEspecifico = null) => {
        const campoActual = campoEspecifico || campoBasculaRef.current;
        console.log(`📦 Recibiendo peso: ${peso} kg para campo: ${campoActual}`);

        setFormData(prev => ({
            ...prev,
            [campoActual]: peso,
            conexion_bascula: peso > 0
        }));

        setUltimoCampoActualizado(campoActual);

        setTimeout(() => {
            setUltimoCampoActualizado('');
        }, 2000);
    };

    const handleCampoBasculaChange = (e) => {
        const nuevoCampo = e.target.value;
        console.log(`🎯 Cambiando campo de asignación de ${campoBascula} a: ${nuevoCampo}`);

        // Capturar peso actual y campo anterior
        const pesoActual = parseFloat(formData[campoBascula]) || 0;
        const campoAnterior = campoBascula;

        // Actualizar primero el campo
        setCampoBascula(nuevoCampo);

        // Solo transferir si hay peso y la báscula está conectada
        if (formData.conexion_bascula && pesoActual > 0) {
            console.log(`🔄 Transfiriendo peso ${pesoActual} kg de ${campoAnterior} a ${nuevoCampo}`);
            
            setFormData(prev => ({
                ...prev,
                [campoAnterior]: '', // Limpiar campo anterior
                [nuevoCampo]: pesoActual // Transferir peso al nuevo campo
            }));

            setMensajeInfo(`🔄 Peso transferido a: ${getNombreCampo(nuevoCampo)}`);
        } else {
            setMensajeInfo(`🎯 Peso ahora se asignará a: ${getNombreCampo(nuevoCampo)}`);
        }

        setMaterialAnterior(campoAnterior);

        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => setMensajeInfo(''), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getNombreCampo = (columnaDb) => {
        if (!config?.tipos_scrap) return columnaDb;

        for (const categoria of Object.values(config.tipos_scrap)) {
            const tipo = categoria.find(t => t.columna_db === columnaDb);
            if (tipo) {
                return tipo.tipo_nombre;
            }
        }
        return columnaDb;
    };

    const getCategoriaCampoActual = () => {
        if (!config?.tipos_scrap) return '';

        for (const [categoria, tipos] of Object.entries(config.tipos_scrap)) {
            if (tipos.some(t => t.columna_db === campoBascula)) {
                return categoria;
            }
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const tienePesos = Object.keys(formData).some(key =>
            key.startsWith('peso_') && parseFloat(formData[key]) > 0
        );

        if (!tienePesos) {
            alert('Debe ingresar al menos un peso para algún tipo de scrap.');
            return;
        }

        try {
            const datosEnviar = { ...formData };
            Object.keys(datosEnviar).forEach(key => {
                if (key.startsWith('peso_') && datosEnviar[key] === '') {
                    datosEnviar[key] = 0;
                }
            });

            await apiClient.createRegistroScrap(datosEnviar);
            alert('✅ Registro de scrap guardado exitosamente!');
            setShowReporteOptions(true);

        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    };

    const generarReporteDiario = async () => {
        try {
            const fecha = new Date().toISOString().split('T')[0];
            const turno = formData.turno;

            const token = localStorage.getItem('authToken');
            const url = `http://localhost:8000/api/registros-scrap/generar-reporte-diario`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fecha: fecha,
                    turno: turno
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `reporte_diario_${fecha}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            alert('📄 Reporte PDF generado y descargado exitosamente!');
            setShowReporteOptions(false);

        } catch (error) {
            alert('❌ Error generando reporte: ' + error.message);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            turno: '',
            area_real: '',
            maquina_real: '',
            peso_cobre_estanado: '',
            peso_purga_pvc: '',
            peso_purga_pe: '',
            peso_purga_pur: '',
            peso_purga_pp: '',
            peso_cable_pvc: '',
            peso_cable_pe: '',
            peso_cable_pur: '',
            peso_cable_pp: '',
            peso_cable_aluminio: '',
            peso_cable_estanado_pvc: '',
            peso_cable_estanado_pe: '',
            conexion_bascula: false,
            numero_lote: '',
            observaciones: ''
        });
        setShowReporteOptions(false);
    };

    const continuarSinReporte = () => {
        setShowReporteOptions(false);
        limpiarFormulario();
    };

    if (loading) return <div style={styles.loading}>📋 Cargando configuración...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📝 Registro de Scrap - Formato Completo</h2>
            </div>

            {/* Mensajes informativos */}
            {mensajeInfo && (
                <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #bee5eb',
                    backgroundColor: '#d1ecf1',
                    color: '#0c5460',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span>💡</span>
                    <span>{mensajeInfo}</span>
                </div>
            )}

            <div style={styles.layout}>
                <div style={styles.mainContent}>
                    <div style={styles.basculaCard}>
                        <BasculaConnection
                            onPesoObtenido={handlePesoFromBascula}
                            campoDestino={campoBascula}
                            key={campoBascula}
                        />

                        <div style={styles.campoSelector}>
                            <label style={styles.selectorLabel}>
                                🎯 Asignar peso a:
                                {ultimoCampoActualizado && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#28a745',
                                        marginLeft: '0.5rem',
                                        fontWeight: '600'
                                    }}>
                                        ✓ Actualizado
                                    </span>
                                )}
                                {materialAnterior && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#007bff',
                                        marginLeft: '0.5rem',
                                        fontWeight: '600'
                                    }}>
                                        🔄 Cambiando...
                                    </span>
                                )}
                            </label>
                            <select
                                value={campoBascula}
                                onChange={handleCampoBasculaChange}
                                style={{
                                    ...styles.selector,
                                    borderColor: ultimoCampoActualizado ? '#28a745' :
                                        materialAnterior ? '#007bff' : '#d1d5db'
                                }}
                            >
                                {config.tipos_scrap && Object.values(config.tipos_scrap).flat().map(tipo => (
                                    <option key={tipo.columna_db} value={tipo.columna_db}>
                                        {tipo.tipo_nombre}
                                        {formData[tipo.columna_db] > 0 && ` (${parseFloat(formData[tipo.columna_db]).toFixed(2)} kg)`}
                                    </option>
                                ))}
                            </select>

                            <div style={{
                                fontSize: '0.75rem',
                                color: '#6c757d',
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: formData.conexion_bascula ? '#e8f5e8' : '#f8f9fa',
                                borderRadius: '4px',
                                borderLeft: `3px solid ${formData.conexion_bascula ? '#28a745' : '#007bff'}`
                            }}>
                                <strong>Campo actual:</strong> {getNombreCampo(campoBascula)}
                                <br />
                                <strong>Categoría:</strong> {getCategoriaCampoActual()}
                                {formData[campoBascula] > 0 && (
                                    <>
                                        <br />
                                        <strong>Peso actual:</strong> {parseFloat(formData[campoBascula]).toFixed(3)} kg
                                    </>
                                )}
                                {formData.conexion_bascula && (
                                    <>
                                        <br />
                                        <strong style={{ color: '#28a745' }}>✅ Báscula conectada - Peso en tiempo real</strong>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={styles.infoSection}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>📋 Información Básica</h3>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>🕒 Turno:</label>
                                <select
                                    name="turno"
                                    value={formData.turno}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Seleccionar turno</option>
                                    {config.turnos.map(turno => (
                                        <option key={turno} value={turno}>Turno {turno}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>🏭 Área:</label>
                                <select
                                    name="area_real"
                                    value={formData.area_real}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Seleccionar área</option>
                                    {Object.keys(config.areas_maquinas).map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>⚙️ Máquina:</label>
                                <select
                                    name="maquina_real"
                                    value={formData.maquina_real}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Seleccionar máquina</option>
                                    {formData.area_real && config.areas_maquinas[formData.area_real]?.map(maquina => (
                                        <option key={maquina.maquina_nombre} value={maquina.maquina_nombre}>
                                            {maquina.maquina_nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                            ⚖️ Pesos por Tipo de Scrap (kg)
                            {campoBascula && (
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: '#007bff',
                                    marginLeft: '1rem',
                                    fontWeight: '500'
                                }}>
                                    🎯 Campo activo: {getNombreCampo(campoBascula)}
                                </span>
                            )}
                        </h3>

                        <div style={styles.categoryTabs}>
                            {Object.keys(config.tipos_scrap).map(categoria => (
                                <button
                                    key={categoria}
                                    onClick={() => setActiveCategory(categoria)}
                                    style={{
                                        ...styles.categoryTab,
                                        ...(activeCategory === categoria && styles.activeCategoryTab),
                                        ...(categoria === getCategoriaCampoActual() && {
                                            border: '2px solid #007bff',
                                            fontWeight: '600'
                                        })
                                    }}
                                >
                                    {categoria}
                                    {categoria === getCategoriaCampoActual() && ' 🎯'}
                                </button>
                            ))}
                        </div>

                        <div style={styles.inputsGrid}>
                            {config.tipos_scrap[activeCategory]?.map(tipo => (
                                <div
                                    key={tipo.columna_db}
                                    style={{
                                        ...styles.inputCard,
                                        ...(tipo.columna_db === campoBascula && {
                                            border: '2px solid #007bff',
                                            backgroundColor: '#f0f8ff'
                                        }),
                                        ...(tipo.columna_db === ultimoCampoActualizado && {
                                            border: '2px solid #28a745',
                                            backgroundColor: '#f0fff4'
                                        })
                                    }}
                                >
                                    <label style={styles.inputLabel}>
                                        {tipo.tipo_nombre}
                                        {tipo.columna_db === campoBascula && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: '#007bff',
                                                marginLeft: '0.5rem',
                                                fontWeight: '600'
                                            }}>
                                                (ACTIVO)
                                            </span>
                                        )}
                                    </label>
                                    <div style={styles.inputGroup}>
                                        <input
                                            type="number"
                                            name={tipo.columna_db}
                                            value={formData[tipo.columna_db]}
                                            onChange={handleInputChange}
                                            style={{
                                                ...styles.numberInput,
                                                ...(tipo.columna_db === campoBascula && {
                                                    borderColor: '#007bff',
                                                    backgroundColor: '#fff'
                                                })
                                            }}
                                            step="0.001"
                                            min="0"
                                            placeholder="0.000"
                                        />
                                        <span style={styles.unit}>kg</span>
                                    </div>
                                    {formData[tipo.columna_db] > 0 && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#28a745',
                                            marginTop: '0.5rem',
                                            fontWeight: '500'
                                        }}>
                                            ✅ {parseFloat(formData[tipo.columna_db]).toFixed(3)} kg
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.infoSection}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>📄 Información Adicional</h3>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="conexion_bascula"
                                        checked={formData.conexion_bascula}
                                        onChange={handleInputChange}
                                        style={styles.checkbox}
                                    />
                                    ✅ Registrado con báscula
                                    {formData.conexion_bascula && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#28a745',
                                            marginLeft: '0.5rem',
                                            fontWeight: '600'
                                        }}>
                                            (Conectado)
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>🏷️ Número de Lote:</label>
                                <input
                                    type="text"
                                    name="numero_lote"
                                    value={formData.numero_lote}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Opcional"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📝 Observaciones:</label>
                                <input
                                    type="text"
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Observaciones adicionales"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.sidebar}>
                    <div style={styles.summaryCard}>
                        <div style={styles.totalLabel}>PESO TOTAL</div>
                        <div style={styles.totalValue}>{pesoTotal.toFixed(2)} kg</div>

                        <div style={{
                            margin: '1.5rem 0',
                            padding: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '8px',
                            border: '1px solid #d1d7dc'
                        }}>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#2d5016',
                                marginBottom: '0.75rem'
                            }}>
                                📊 Campos con Peso:
                            </div>
                            {Object.keys(formData)
                                .filter(key => key.startsWith('peso_') && parseFloat(formData[key]) > 0)
                                .map(key => (
                                    <div key={key} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}>
                                        <span>{getNombreCampo(key)}:</span>
                                        <span style={{ fontWeight: '600', color: '#28a745' }}>
                                            {parseFloat(formData[key]).toFixed(2)} kg
                                        </span>
                                    </div>
                                ))}
                            {Object.keys(formData).filter(key => key.startsWith('peso_') && parseFloat(formData[key]) > 0).length === 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', fontStyle: 'italic' }}>
                                    No hay pesos registrados
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            style={styles.submitButton}
                        >
                            💾 Guardar Registro Completo
                        </button>
                    </div>
                </div>
            </div>

            {showReporteOptions && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>📄 Generar Reporte PDF</h3>
                        <p>¿Deseas generar un reporte PDF con el registro realizado?</p>

                        <div style={styles.modalActions}>
                            <button
                                onClick={generarReporteDiario}
                                style={styles.reporteButton}
                            >
                                📥 Descargar Reporte PDF
                            </button>
                            <button
                                onClick={continuarSinReporte}
                                style={styles.continuarButton}
                            >
                                ➕ Continuar sin Reporte
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedScrapForm;
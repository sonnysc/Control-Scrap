import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/api';

const getSessionLockKey = (puerto) => `bascula_lock_${puerto}_${Date.now()}`;

const BasculaConnection = ({ onPesoObtenido, campoDestino = 'peso' }) => {
    const [conectado, setConectado] = useState(false);
    const [peso, setPeso] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [cargandoPuertos, setCargandoPuertos] = useState(false);
    const [puertosDisponibles, setPuertosDisponibles] = useState([]);
    const [configuracion, setConfiguracion] = useState({
        puerto: 'COM3',
        timeout: 2,
    });
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [formatoDetectado, setFormatoDetectado] = useState('');
    const intervaloRef = useRef(null);
    const [modoManual, setModoManual] = useState(false);
    const [pesoManual, setPesoManual] = useState("");
    const [ultimaLectura, setUltimaLectura] = useState(null);
    const [lecturaEnProgreso, setLecturaEnProgreso] = useState(false);
    const [inicializado, setInicializado] = useState(false);

    const conectadoRef = useRef(false);
    const desconectandoRef = useRef(false);

    const campoDestinoRef = useRef(campoDestino);

    const [sessionLock, setSessionLock] = useState(null);
    const sessionLockRef = useRef(null);

    const [ultimaLecturaExitosa, setUltimaLecturaExitosa] = useState(null);
    const lecturasFallidasRef = useRef(0);

    const puertosComunes = ['COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9'];

    const notificarPeso = useCallback((nuevoPeso, campoEspecifico = null) => {
        const campoActual = campoEspecifico || campoDestinoRef.current;
        console.log(`📤 Notificando peso: ${nuevoPeso} kg para campo: ${campoActual}`);

        if (onPesoObtenido) {
            onPesoObtenido(nuevoPeso, campoActual);
        }
    }, [onPesoObtenido]);

    // Estilos Mejorados con Diseño Moderno
    const styles = {
        container: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            border: '1px solid #e1e5e9'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #f0f2f5'
        },
        titulo: {
            margin: 0,
            color: '#1a1d21',
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        statusBadge: {
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            letterSpacing: '0.3px'
        },
        statusConnected: {
            backgroundColor: '#d4f8e8',
            color: '#0a7b4c',
            border: '1px solid #a3e4c9'
        },
        statusDisconnected: {
            backgroundColor: '#f8d7da',
            color: '#d93025',
            border: '1px solid #f1b0b7'
        },
        statusManual: {
            backgroundColor: '#fff4e6',
            color: '#e67e22',
            border: '1px solid #fad8a6'
        },
        configCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #e9ecef'
        },
        configGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '1.25rem',
            alignItems: 'end'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057'
        },
        select: {
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            transition: 'all 0.2s',
            cursor: 'pointer'
        },
        inputSmall: {
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            width: '90px',
            textAlign: 'center',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
        },
        buttonGroup: {
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem'
        },
        button: {
            padding: '0.875rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flex: 1,
            minHeight: '48px'
        },
        primaryButton: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: '#6c757d',
            color: 'white'
        },
        successButton: {
            backgroundColor: '#28a745',
            color: 'white'
        },
        dangerButton: {
            backgroundColor: '#dc3545',
            color: 'white'
        },
        warningButton: {
            backgroundColor: '#ffc107',
            color: '#212529'
        },
        disabledButton: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        pesoDisplay: {
            textAlign: 'center',
            padding: '2.5rem 2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '2px solid #e9ecef',
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            overflow: 'hidden'
        },
        pesoValue: {
            fontSize: '3.5rem',
            fontWeight: '700',
            color: '#1a1d21',
            margin: '0.75rem 0'
        },
        pesoLabel: {
            fontSize: '0.875rem',
            color: '#6c757d',
            letterSpacing: '1px',
            fontWeight: '600'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
        },
        infoItem: {
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        },
        infoItemLabel: {
            fontSize: '0.75rem',
            color: '#6c757d',
            letterSpacing: '0.5px',
            marginBottom: '0.25rem'
        },
        infoItemValue: {
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#495057'
        },
        alert: {
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        alertSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
            borderColor: '#c3e6cb'
        },
        alertError: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderColor: '#f5c6cb'
        },
        alertInfo: {
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            borderColor: '#bee5eb'
        },
        alertWarning: {
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderColor: '#ffeaa7'
        },
        manualSection: {
            backgroundColor: '#fff9e6',
            border: '1px solid #ffeaa7',
            borderRadius: '10px',
            padding: '1.5rem',
            marginTop: '1rem'
        },
        manualHeader: {
            textAlign: 'center',
            marginBottom: '1.5rem'
        },
        manualTitle: {
            margin: '0 0 0.5rem 0',
            color: '#856404',
            fontSize: '1.1rem',
            fontWeight: '600'
        },
        manualInputGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
        },
        manualInput: {
            padding: '0.875rem',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: '500',
            textAlign: 'center',
            width: '150px',
            backgroundColor: 'white',
            transition: 'all 0.2s'
        },
        manualLabel: {
            fontWeight: '600',
            color: '#856404',
            fontSize: '1rem'
        },
        manualUnit: {
            fontWeight: '600',
            color: '#856404',
            fontSize: '1rem'
        },
        helpText: {
            fontSize: '0.75rem',
            color: '#6c757d',
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef',
            lineHeight: '1.5'
        }
    };

    // Componente de Badge de Estado Corregido
    const StatusBadge = () => {
        let badgeStyle = { ...styles.statusBadge };
        let text = '';

        if (modoManual) {
            badgeStyle = { ...badgeStyle, ...styles.statusManual };
            text = '📝 MODO MANUAL';
        } else if (conectado) {
            badgeStyle = { ...badgeStyle, ...styles.statusConnected };
            text = '⚡ CONECTADO';
        } else {
            badgeStyle = { ...badgeStyle, ...styles.statusDisconnected };
            text = '🔌 DESCONECTADO';
        }

        return <div style={badgeStyle}>{text}</div>;
    };

    // Componente de Alerta Corregido
    const Alert = ({ type, children, icon }) => {
        const alertStyle = {
            ...styles.alert,
            ...(type === 'success' && styles.alertSuccess),
            ...(type === 'error' && styles.alertError),
            ...(type === 'info' && styles.alertInfo),
            ...(type === 'warning' && styles.alertWarning)
        };

        return (
            <div style={alertStyle}>
                <span>{icon}</span>
                <span>{children}</span>
            </div>
        );
    };

    // Sincronizar las refs con el estado
    useEffect(() => {
        conectadoRef.current = conectado;
    }, [conectado]);

    // Cargar puertos
    const cargarPuertos = useCallback(async () => {
        if (cargandoPuertos) return;

        setCargandoPuertos(true);
        setError('');

        try {
            const resultado = await apiClient.listarPuertosBascula();

            if (resultado.success) {
                const puertos = resultado.puertos || puertosComunes;
                setPuertosDisponibles(puertos);

                const puertoRecomendado = resultado.puerto_recomendado ||
                    (puertos.includes('COM3') ? 'COM3' : puertos[0]) || 'COM3';

                const configGuardada = await apiClient.getRegistrosConfig().then(res => res.config_bascula).catch(() => null);

                if (!inicializado) {
                    setConfiguracion(prev => ({
                        ...prev,
                        puerto: configGuardada?.puerto || puertoRecomendado,
                        timeout: configGuardada?.timeout || 2,
                    }));
                    setInicializado(true);
                }

                setInfo(`✅ ${resultado.mensaje}`);
            }
        } catch (error) {
            console.debug('Error cargando puertos:', error.message);
            setPuertosDisponibles(puertosComunes);
            if (!inicializado) {
                setConfiguracion(prev => ({ ...prev, puerto: 'COM3' }));
                setInicializado(true);
            }
        } finally {
            setCargandoPuertos(false);
        }
    }, [cargandoPuertos, inicializado]);

    // Efecto para carga inicial
    useEffect(() => {
        if (!inicializado) {
            cargarPuertos();
        }
    }, [inicializado, cargarPuertos]);

    // Efecto para lectura automática - CORREGIDO
    useEffect(() => {
        let isMounted = true;
        let cleanupExecuted = false;

        const manageConnection = () => {
            if (!isMounted || cleanupExecuted) return;

            if (conectado && !modoManual && !desconectandoRef.current) {
                console.log('🟢 Iniciando lectura automática');
                // Pequeño delay antes de iniciar
                setTimeout(() => {
                    if (isMounted && !cleanupExecuted) {
                        iniciarLecturaAutomatica();
                    }
                }, 200);
            } else {
                console.log('🔴 Deteniendo lectura automática');
                detenerLecturaAutomatica();
            }
        };

        const timeoutId = setTimeout(manageConnection, 100);

        return () => {
            cleanupExecuted = true;
            isMounted = false;
            clearTimeout(timeoutId);
            console.log('🧹 Cleanup effect completo');
            detenerLecturaAutomatica();
            sessionLockRef.current = null;
            setSessionLock(null);
        };
    }, [conectado, modoManual]);

    // Sincronizar ref del campo destino
    useEffect(() => {
        console.log(`🎯 Campo destino actualizado: ${campoDestino}`);
        campoDestinoRef.current = campoDestino;
    }, [campoDestino]);

    const conectarBascula = async () => {
        if (!configuracion.puerto) {
            setError('Seleccione un puerto');
            return;
        }

        desconectandoRef.current = false;
        setCargando(true);
        setError('');
        setInfo(`🔌 Conectando a ${configuracion.puerto} (detección automática)...`);

        try {
            const resultado = await apiClient.conectarBascula({
                puerto: configuracion.puerto,
                timeout: configuracion.timeout
            });

            if (resultado.success) {
                setConectado(true);
                setModoManual(false);

                const pesoObtenido = parseFloat(resultado.peso_kg) || 0;
                setPeso(pesoObtenido);
                setUltimaLectura(new Date());

                notificarPeso(pesoObtenido);

                const mensaje = pesoObtenido > 0
                    ? `✅ Conectado - Peso inicial: ${pesoObtenido} kg`
                    : `✅ Conectado - Puerto ${configuracion.puerto} responde`;

                setInfo(mensaje);

                const baudiosDetectados = resultado.configuracion?.baudios || 'auto';
                setFormatoDetectado(`${resultado.formato_detectado || 'desconocido'} @ ${baudiosDetectados} baud`);

            } else {
                setConectado(false);
                setError(resultado.mensaje || 'No se pudo conectar. Revise la conexión o el puerto.');
            }
        } catch (error) {
            setError('Error de comunicación: ' + error.message);
            setConectado(false);
        } finally {
            setCargando(false);
        }
    };

    const leerPesoAutomatico = async () => {
        // Verificar múltiples condiciones de bloqueo
        if (!conectadoRef.current || lecturaEnProgreso || modoManual || desconectandoRef.current) {
            console.log('⏸️  Lectura automática omitida - condiciones no cumplidas');
            return;
        }

        // Verificar si hay bloqueo de sesión activo
        if (sessionLockRef.current) {
            const lockAge = Date.now() - parseInt(sessionLockRef.current.split('_').pop());
            if (lockAge < 5000) { // Lock de 5 segundos
                console.log('⏸️  Bloqueo de sesión activo');
                return;
            } else {
                // Limpiar lock expirado
                sessionLockRef.current = null;
                setSessionLock(null);
            }
        }

        setLecturaEnProgreso(true);

        // ✅ CORRECCIÓN: Definir newLock al inicio de la función
        let newLock = null;

        try {
            // Establecer nuevo lock
            newLock = getSessionLockKey(configuracion.puerto);
            sessionLockRef.current = newLock;
            setSessionLock(newLock);

            const resultado = await apiClient.leerPesoBascula({
                puerto: configuracion.puerto,
                timeout: configuracion.timeout
            });

            // Verificar si el lock sigue siendo válido
            if (sessionLockRef.current !== newLock) {
                console.log('🔒 Lectura cancelada - lock cambiado');
                return;
            }

            if (!conectadoRef.current || desconectandoRef.current) {
                console.log('⏸️  Lectura cancelada - estado cambiado durante llamada');
                return;
            }

            if (resultado.success) {
                const nuevoPeso = parseFloat(resultado.peso_kg) || 0;
                setPeso(nuevoPeso);
                setUltimaLectura(new Date());
                notificarPeso(nuevoPeso);

                if (resultado.formato_detectado) {
                    const baudiosDetectados = resultado.configuracion?.baudios || 'auto';
                    setFormatoDetectado(`${resultado.formato_detectado} @ ${baudiosDetectados} baud`);
                }

                if (error) setError('');

                // Resetear contador de fallos cuando hay éxito
                lecturasFallidasRef.current = 0;

            } else {
                console.warn('Error lectura:', resultado.mensaje);
                lecturasFallidasRef.current++;
            }

        } catch (error) {
            console.debug('Error en lectura automática:', error.message);
            lecturasFallidasRef.current++;

        } finally {
            setLecturaEnProgreso(false);

            // Protección contra rate limiting - Solo si hay muchos fallos
            if (lecturasFallidasRef.current >= 3) {
                console.warn('🛑 Muchas lecturas fallidas, pausando automático');
                detenerLecturaAutomatica();
                setError('Demasiados errores. Verifique conexión de la báscula.');

                // Reactivar después de 8 segundos
                setTimeout(() => {
                    lecturasFallidasRef.current = 0;
                    if (conectadoRef.current && !modoManual) {
                        console.log('🔄 Reintentando conexión después de fallos');
                        iniciarLecturaAutomatica();
                    }
                }, 8000);
            }

            // ✅ CORRECCIÓN: Usar newLock que ahora está definido en el scope
            if (newLock) {
                // Mantener el lock por 1.5 segundos más para prevenir spam
                setTimeout(() => {
                    if (sessionLockRef.current === newLock) {
                        sessionLockRef.current = null;
                        setSessionLock(null);
                    }
                }, 1500);
            }
        }
    };

    const iniciarLecturaAutomatica = () => {
        detenerLecturaAutomatica();

        console.log('▶️  Iniciando intervalo de lectura');
        // Leer inmediatamente y luego cada segundo
        leerPesoAutomatico();
        intervaloRef.current = setInterval(() => {
            leerPesoAutomatico();
        }, 1000);
    };

    const detenerLecturaAutomatica = () => {
        if (intervaloRef.current) {
            console.log('⏹️  Deteniendo intervalo de lectura');
            clearInterval(intervaloRef.current);
            intervaloRef.current = null;
        }
    };

    const desconectarBascula = async () => {
        console.log('🔌 Iniciando desconexión...');

        // Establecer flags de desconexión inmediatamente
        desconectandoRef.current = true;
        conectadoRef.current = false;

        // Detener lectura inmediatamente
        detenerLecturaAutomatica();

        // Limpiar locks
        sessionLockRef.current = null;
        setSessionLock(null);

        setConectado(false);
        setPeso(0);
        setInfo('Desconectando...');
        setLecturaEnProgreso(false);
        setCargando(true);

        try {
            console.log('📡 Enviando solicitud de desconexión al backend...');
            await apiClient.request('/bascula/desconectar', {
                method: 'POST',
                body: { puerto: configuracion.puerto }
            });

            console.log('✅ Desconexión completada en backend');
            setInfo('✅ Báscula desconectada correctamente');
            setError('');
            setModoManual(false);
            setPesoManual("");
            setFormatoDetectado('');

            notificarPeso(0);

        } catch (error) {
            console.log('⚠️  Error durante desconexión:', error);
            setInfo('✅ Báscula desconectada (error en backend)');
            setConectado(false);
            setPeso(0);
            notificarPeso(0);
        } finally {
            setCargando(false);
            // Pequeño delay antes de permitir reconexión
            setTimeout(() => {
                desconectandoRef.current = false;
            }, 1000);
            console.log('🔴 Desconexión completada completamente');
        }
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfiguracion(prev => ({
            ...prev,
            [name]: name === 'puerto' ? value : parseInt(value)
        }));
    };

    const activarModoManual = () => {
        console.log('📌 Activando modo manual');
        if (conectado) {
            desconectarBascula();
        } else {
            setModoManual(true);
            setInfo('📌 Modo manual activado');
        }
    };

    const handlePesoManualChange = (e) => {
        const valor = e.target.value;
        setPesoManual(valor);

        const pesoNumerico = parseFloat(valor) || 0;
        setPeso(pesoNumerico);

        notificarPeso(pesoNumerico);
    };

    const formatearTiempo = (fecha) => {
        if (!fecha) return '';
        return fecha.toLocaleTimeString();
    };

    const recargarPuertos = () => {
        cargarPuertos();
    };

    // Función auxiliar para estilos de botones
    const getButtonStyle = (type, disabled = false) => {
        const baseStyle = { ...styles.button };
        const typeStyle = styles[`${type}Button`] || {};
        const disabledStyle = disabled ? styles.disabledButton : {};

        return { ...baseStyle, ...typeStyle, ...disabledStyle };
    };

    return (
        <div style={styles.container}>
            {/* Header Mejorado */}
            <div style={styles.header}>
                <h2 style={styles.titulo}>
                    ⚖️ Báscula Digital
                </h2>
                <StatusBadge />
            </div>

            {/* Alertas */}
            {error && (
                <Alert type="error" icon="⚠️">
                    {error}
                </Alert>
            )}
            {info && (
                <Alert type="info" icon="💡">
                    {info}
                </Alert>
            )}

            {sessionLock && (
                <Alert type="warning" icon="🔒">
                    Báscula sincronizada - Lectura estable
                </Alert>
            )}

            {lecturaEnProgreso && (
                <Alert type="info" icon="⏳">
                    Leyendo peso...
                </Alert>
            )}

            {/* Configuración */}
            <div style={styles.configCard}>
                <div style={styles.configGrid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Puerto COM</label>
                        <select
                            name="puerto"
                            value={configuracion.puerto}
                            onChange={handleConfigChange}
                            style={styles.select}
                            disabled={conectado || modoManual || cargandoPuertos}
                        >
                            <option value="">{cargandoPuertos ? 'Cargando puertos...' : 'Seleccionar puerto'}</option>
                            {puertosDisponibles.map(puerto => (
                                <option key={puerto} value={puerto}>{puerto}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Timeout (segundos)</label>
                        <input
                            type="number"
                            name="timeout"
                            value={configuracion.timeout}
                            onChange={handleConfigChange}
                            style={styles.inputSmall}
                            disabled={conectado || modoManual}
                            min="1"
                            max="10"
                        />
                    </div>

                    <button
                        onClick={recargarPuertos}
                        disabled={conectado || cargandoPuertos}
                        style={getButtonStyle('secondary', conectado || cargandoPuertos)}
                    >
                        {cargandoPuertos ? '🔄' : '🔄 Actualizar'}
                    </button>
                </div>
            </div>

            {/* Controles Principales */}
            {!conectado && !modoManual ? (
                <div style={styles.buttonGroup}>
                    <button
                        onClick={conectarBascula}
                        disabled={cargando || !configuracion.puerto || cargandoPuertos}
                        style={getButtonStyle('primary', cargando || !configuracion.puerto || cargandoPuertos)}
                    >
                        {cargando ? '⏳ Conectando...' : '🔌 Conectar Báscula'}
                    </button>
                    <button
                        onClick={activarModoManual}
                        style={getButtonStyle('warning')}
                    >
                        ✍️ Modo Manual
                    </button>
                </div>
            ) : conectado ? (
                <>
                    {/* Display de Peso - Mejorado Visualmente */}
                    <div style={{
                        ...styles.pesoDisplay,
                        borderColor: peso > 0 ? '#28a745' : '#e9ecef',
                        backgroundColor: peso > 0 ? '#f0fff4' : '#f8f9fa'
                    }}>
                        <div style={styles.pesoLabel}>PESO ACTUAL</div>
                        <div style={styles.pesoValue}>{peso.toFixed(3)} kg</div>

                        <div style={styles.infoGrid}>
                            {ultimaLectura && (
                                <div style={styles.infoItem}>
                                    <div style={styles.infoItemLabel}>ÚLTIMA LECTURA</div>
                                    <div style={styles.infoItemValue}>{formatearTiempo(ultimaLectura)}</div>
                                </div>
                            )}
                            {formatoDetectado && (
                                <div style={styles.infoItem}>
                                    <div style={styles.infoItemLabel}>CONFIGURACIÓN</div>
                                    <div style={styles.infoItemValue}>{formatoDetectado}</div>
                                </div>
                            )}
                            <div style={styles.infoItem}>
                                <div style={styles.infoItemLabel}>MODO</div>
                                <div style={styles.infoItemValue}>Automático</div>
                            </div>
                            <div style={styles.infoItem}>
                                <div style={styles.infoItemLabel}>INTERVALO</div>
                                <div style={styles.infoItemValue}>1 segundo</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            onClick={desconectarBascula}
                            style={getButtonStyle('danger')}
                            disabled={cargando}
                        >
                            {cargando ? '⏳ Desconectando...' : '🔌 Desconectar'}
                        </button>
                    </div>
                </>
            ) : null}

            {/* Modo Manual - Mejorado */}
            {modoManual && (
                <div style={styles.manualSection}>
                    <div style={styles.manualHeader}>
                        <h3 style={styles.manualTitle}>📝 Modo Manual</h3>
                        <p style={{ margin: 0, color: '#856404', fontSize: '0.875rem' }}>
                            Ingresa el peso manualmente
                        </p>
                    </div>

                    <div style={styles.manualInputGroup}>
                        <label style={styles.manualLabel}>Peso:</label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={pesoManual}
                            onChange={handlePesoManualChange}
                            placeholder="0.000"
                            style={styles.manualInput}
                        />
                        <span style={styles.manualUnit}>kilogramos</span>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            onClick={() => {
                                setModoManual(false);
                                setPesoManual("");
                                setInfo('Modo manual desactivado');
                            }}
                            style={getButtonStyle('secondary')}
                        >
                            ↩️ Volver a Báscula
                        </button>
                    </div>

                    {peso > 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '2px solid #28a745',
                            color: '#28a745',
                            fontWeight: '600',
                            marginTop: '1rem'
                        }}>
                            ✅ Peso actual en el formulario: <strong>{peso.toFixed(3)} kg</strong>
                        </div>
                    )}
                </div>
            )}

            {/* Información del Sistema */}
            <div style={styles.helpText}>
                <strong>💡 Sistema Automático:</strong> Detección automática de configuración • Lectura cada 1 segundo • Conexión persistente
            </div>
        </div>
    );
};

export default BasculaConnection;
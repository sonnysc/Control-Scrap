// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OperadorDashboard from './pages/OperadorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ReceptorDashboard from './pages/ReceptorDashboard';

// Componente para la página de inicio (redirección automática)
const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {

    return <Navigate to="/admin" replace />;

  } else if (user?.role === 'operador') {

    return <Navigate to="/operador" replace />;

  } else if (user?.role === 'receptor') {

    return <Navigate to="/receptor" replace />;

  }

  // Si no hay usuario o rol no reconocido, ir al login
  return <Navigate to="/login" replace />;
};

// Página de inicio para usuarios autenticados
const HomePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div style={styles.welcome}>
        <h2>¡Bienvenido al Sistema de Control de Scrap! 🎉</h2>
        <p>Has iniciado sesión correctamente.</p>
        <p><strong>Usuario:</strong> {user.name}</p>
        <p><strong>Rol:</strong> {user.role}</p>

        <div style={styles.navigation}>
          <h3>Accesos Rápidos:</h3>
          {user.role === 'admin' && (
            <button
              onClick={() => window.location.href = '/admin'}
              style={styles.navButton}
            >
              Ir al Dashboard de Administrador
            </button>
          )}
          {user.role === 'operador' && (
            <button
              onClick={() => window.location.href = '/operador'}
              style={styles.navButton}
            >
              Ir al Dashboard de Operador
            </button>
          )}
          {user.role === 'receptor' && (
            <button
              onClick={() => window.location.href = '/receptor'}
              style={styles.navButton}
            >
              Ir a Dashboard de receptor
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz - redirección automática */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />

          {/* Página de inicio para usuarios autenticados */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          {/* Dashboard de administrador */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Dashboard de operador */}
          <Route path="/operador/*" element={
            <ProtectedRoute allowedRoles={['operador']}>
              <Layout>
                <OperadorDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Dashboard de receptores */}
          <Route path="/receptor/*" element={
            <ProtectedRoute allowedRoles={[ 'receptor' ]}>
              <Layout>
                <ReceptorDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

const styles = {
  welcome: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  navigation: {
    marginTop: '2rem',
  },
  navButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    margin: '0.5rem',
  },
};

export default App;
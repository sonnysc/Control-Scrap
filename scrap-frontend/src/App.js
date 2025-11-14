/* src/App.js */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OperadorDashboard from './pages/OperadorDashboard';
import ReceptorDashboard from './pages/ReceptorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const HomeRedirect = () => {
  const { user } = useAuth();

  console.log('HomeRedirect - Usuario:', user);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'operador') {
    return <Navigate to="/operador" replace />;
  } else if (user?.role === 'receptor') {
    return <Navigate to="/receptor" replace />;
  }

  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/operador/*" element={
              <ProtectedRoute allowedRoles={['operador']}>
                <Layout>
                  <OperadorDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/receptor/*" element={
              <ProtectedRoute allowedRoles={['receptor']}>
                <Layout>
                  <ReceptorDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
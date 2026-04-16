import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './views/Login';

// Admin portal
import { AdminPortal } from './portals/AdminPortal';
// Supplier portal
import { SupplierPortal } from './portals/SupplierPortal';
// Logist portal
import { LogistPortal } from './portals/LogistPortal';

const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'supplier') return <Navigate to="/supplier" replace />;
  if (user.role === 'logist') return <Navigate to="/logist" replace />;
  return <Navigate to="/login" replace />;
};

const ProtectedRoute = ({ user, allowedRole, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <RoleRedirect user={user} />;
  return children;
};

function App() {
  const { user, loading, error, login, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050507', color: '#fff', fontSize: '1.2rem' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <RoleRedirect user={user} /> : <Login onLogin={login} error={error} loading={loading} />}
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute user={user} allowedRole="admin">
            <AdminPortal user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/*"
        element={
          <ProtectedRoute user={user} allowedRole="supplier">
            <SupplierPortal user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logist/*"
        element={
          <ProtectedRoute user={user} allowedRole="logist">
            <LogistPortal user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<RoleRedirect user={user} />} />
    </Routes>
  );
}

export default App;

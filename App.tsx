import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth, Role } from './context/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Cities from './pages/Cities';
import Users from './pages/Users';
import PropertyDetails from './pages/PropertyDetails';
import UserDetails from './pages/UserDetails';

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: Role[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if unauthorized for specific route, or login if really lost
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Dashboard - Accessible by All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      {/* Properties - Accessible by ADMIN, OWNER, TENANT */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']} />}>
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
      </Route>

      {/* Cities - Accessible by ADMIN, OWNER, TENANT */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']} />}>
        <Route path="/cities" element={<Cities />} />
      </Route>

      {/* User Management Routes Split by Role Access */}
      
      {/* Owners List - Accessible by Admin and Owner */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']} />}>
        <Route path="/owners" element={<Users />} />
      </Route>

      {/* Tenants List - Accessible by Admin and Tenant */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TENANT']} />}>
         <Route path="/tenants" element={<Users />} />
      </Route>

      {/* Admin List & General User List - Admin Only */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/users" element={<Users />} />
        <Route path="/admins" element={<Users />} />
      </Route>

      {/* User Details - Accessible by all (controlled by list visibility) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']} />}>
        <Route path="/users/:id" element={<UserDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
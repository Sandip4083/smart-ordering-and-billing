import { Navigate } from 'react-router-dom';

// Protects routes based on login status and role
export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Not logged in → send to correct login
  if (!token) {
    if (requiredRole === 'employee') return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }
  // Wrong role → send to correct dashboard
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'employee' ? '/employee' : '/dashboard'} replace />;
  }

  return children;
}

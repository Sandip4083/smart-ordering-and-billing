import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Navigate to="/menu" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="customer"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="employee"><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={
          <div style={{ textAlign:'center', padding:'100px 20px', color:'#555' }}>
            <h2 style={{ color:'#b89e60', fontSize:'5rem', margin:0 }}>404</h2>
            <p style={{ margin:'12px 0 24px' }}>Page not found</p>
            <a href="/" style={{ color:'#b89e60' }}>← Back to Home</a>
          </div>
        } />
      </Routes>
      <ScrollToTop />
    </>
  );
}

export default App;

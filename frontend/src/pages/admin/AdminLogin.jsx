import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login/admin', {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.adminBadge}>🔐 ADMIN PORTAL</div>
          <Link to="/" className={styles.logo}>🍽️ Smart Order &amp; Billing</Link>
          <h2>Administrator Login</h2>
          <p>Restricted access. Authorized personnel only.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className={styles.field}>
            <label>Admin Username</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input
                placeholder="Enter admin username"
                required
                value={form.username}
                onChange={e => setForm(p => ({...p, username: e.target.value}))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔑</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter admin password"
                required
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading
              ? <><span className={styles.spin} /> Verifying...</>
              : '🔐 Access Admin Panel'
            }
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.securityNote}>
            <span>🛡️</span>
            <span>All actions are logged and monitored. Unauthorized access attempts are recorded.</span>
          </div>
          <p className={styles.customerLink}>
            Not an admin? <Link to="/login">Customer Portal →</Link>
          </p>
        </div>
      </div>

      {/* Decorative background */}
      <div className={styles.bgGrid} />
    </div>
  );
}

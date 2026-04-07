import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import styles from './Login.module.css';

export default function CustomerLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username_stored = localStorage.getItem('username');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login/customer', {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess('✅ Account created! Please log in.');
      setMode('login');
      setForm({ username: '', email: '', password: '', confirmPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match');
    if (form.newPassword.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/reset-password', {
        email: form.email,
        newPassword: form.newPassword
      });
      setSuccess(`✅ ${data.msg}`);
      setTimeout(() => {
        setMode('login');
        setForm({ username: '', email: '', password: '', confirmPassword: '', newPassword: '' });
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Password reset failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Left panel — dynamic video brand */}
      <div className={styles.left}>
        <img 
          src="/restu/image.png" 
          alt="Restaurant Background" 
          className={styles.bgVideo} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className={styles.videoOverlay}></div>
        
        <div className={styles.leftInner}>
          <Link to="/" className={styles.brandLogo}>🍽️</Link>
          <h1>Smart Order &amp;<br />Billing Portal</h1>
          <p>Order authentic dishes from 6 world cuisines. Reserve your table. Track your bills — all in one place, now with an extraordinary experience.</p>
          <div className={styles.featureList}>
            {['⚡ Instant ordering','📅 Table reservations','🧾 Digital billing','🌍 6 world cuisines'].map(f => (
              <div key={f} className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span> {f}
              </div>
            ))}
          </div>
          <div className={styles.adminHint}>
            Are you an admin? <Link to="/admin/login">Admin Portal →</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.formBox}>
          
          {mode !== 'forgot' && (
            <div className={styles.modeTabs}>
              <button className={`${styles.modeTab} ${mode === 'login' ? styles.modeActive : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Sign In</button>
              <button className={`${styles.modeTab} ${mode === 'register' ? styles.modeActive : ''}`} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Sign Up</button>
            </div>
          )}
          {mode === 'forgot' && (
             <div className={styles.forgotHeader}>
               <h2>Reset Password</h2>
               <p>Enter your registration email to create a new password.</p>
             </div>
          )}

          {success && <div className={styles.successMsg}>{success}</div>}
          {error && <div className={styles.errorMsg}>{error}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className={styles.glassForm}>
              <label className={styles.fLabel}>Username</label>
              <input className={styles.fInput} placeholder="Enter your username" required value={form.username} onChange={e => set('username', e.target.value)} />
              
              <div className={styles.passwordHeader}>
                <label className={styles.fLabel}>Password</label>
                <button type="button" className={styles.forgotBtn} onClick={() => {setMode('forgot'); setError(''); setSuccess('');}}>Forgot Password?</button>
              </div>
              <input className={styles.fInput} type="password" placeholder="Enter your password" required value={form.password} onChange={e => set('password', e.target.value)} />
              
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.btnSpinner} /> : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className={styles.glassForm}>
              <label className={styles.fLabel}>Username</label>
              <input className={styles.fInput} placeholder="Choose a username" required value={form.username} onChange={e => set('username', e.target.value)} />
              <label className={styles.fLabel}>Email</label>
              <input className={styles.fInput} type="email" placeholder="your@email.com" required value={form.email} onChange={e => set('email', e.target.value)} />
              <label className={styles.fLabel}>Password</label>
              <input className={styles.fInput} type="password" placeholder="Minimum 6 characters" required value={form.password} onChange={e => set('password', e.target.value)} />
              <label className={styles.fLabel}>Confirm Password</label>
              <input className={styles.fInput} type="password" placeholder="Repeat your password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.btnSpinner} /> : 'Create Account'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className={styles.glassForm}>
              <label className={styles.fLabel}>Registered Email</label>
              <input className={styles.fInput} type="email" placeholder="your@email.com" required value={form.email} onChange={e => set('email', e.target.value)} />
              <label className={styles.fLabel}>New Password</label>
              <input className={styles.fInput} type="password" placeholder="Minimum 6 characters" required value={form.newPassword} onChange={e => set('newPassword', e.target.value)} />
              <label className={styles.fLabel}>Confirm New Password</label>
              <input className={styles.fInput} type="password" placeholder="Repeat new password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.btnSpinner} /> : 'Reset Password'}
              </button>
              
              <button type="button" className={styles.backBtn} onClick={() => {setMode('login'); setError(''); setSuccess('');}}>
                ← Back to Login
              </button>
            </form>
          )}

          <p className={styles.footNote}>Customer portal only. Menu is available without login.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Bell, LogOut, User, ChefHat, LayoutDashboard, Settings, Menu, X, CalendarDays, MessageSquare, Sun, Moon } from 'lucide-react';
import API from '../api';
import CartSidebar from './CartSidebar';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const notifRef = useRef(null);
  const location = useLocation();
  const { count: cartCount } = useCart();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const hideNav = location.pathname === '/login' || location.pathname === '/admin/login';

  const fetchCount = useCallback(async () => {
    if (!token || role !== 'employee') return;
    try { const { data } = await API.get('/notifications/unread-count'); setNotifCount(data.count); } catch {}
  }, [token, role]);

  useEffect(() => {
    if (hideNav) return;
    fetchCount();
    const t = setInterval(fetchCount, 15000);
    return () => clearInterval(t);
  }, [fetchCount, hideNav]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close notifications on location change
  useEffect(() => {
    setShowNotifs(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!showNotifs) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (hideNav) return null;

  const openNotifs = async () => {
    if (!showNotifs) {
      try { const { data } = await API.get('/notifications'); setNotifs(data); } catch {}
    }
    setShowNotifs(!showNotifs);
  };

  const markAllRead = async () => {
    await API.put('/notifications/mark-read');
    setNotifCount(0);
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const logout = () => { localStorage.clear(); window.location.href = '/'; };

  const typeIcon = { new_order: <ShoppingCart size={16} />, new_reservation: <CalendarDays size={16} />, cancellation: <X size={16} />, feedback: <MessageSquare size={16} /> };

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <ChefHat size={22} />
          <span>Smart Order & Billing</span>
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          <Link to="/menu" className={styles.navLink}>Menu</Link>
          <Link to="/about" className={styles.navLink}>About</Link>

          {token && role === 'customer' && (
            <Link to="/dashboard" className={`${styles.navLink} ${styles.dashLink}`}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          )}
          {token && role === 'employee' && (
            <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
              <Settings size={14} /> Admin Panel
            </Link>
          )}

          {/* Cart — for customers + guests */}
          {role !== 'employee' && (
            <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          )}

          {/* Notifications — admin */}
          {token && role === 'employee' && (
            <div className={styles.bellWrap} ref={notifRef}>
              <button className={styles.bell} onClick={openNotifs}>
                <Bell size={18} />
                {notifCount > 0 && <span className={styles.badge}>{notifCount > 99 ? '99+' : notifCount}</span>}
              </button>
              {showNotifs && (
                <div className={styles.dropdown}>
                  <div className={styles.dropHead}>
                    <span>Notifications</span>
                    {notifCount > 0 && <button className={styles.markRead} onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className={styles.dropList}>
                    {notifs.length === 0 && <p className={styles.empty}>No notifications</p>}
                    {notifs.map(n => (
                      <div key={n._id} className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}>
                        <span className={styles.notifIcon}>{typeIcon[n.type] || <Bell size={16} />}</span>
                        <div>
                          <p className={styles.notifTitle}>{n.title}</p>
                          <p className={styles.notifMsg}>{n.message}</p>
                          <p className={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button className={styles.themeToggleBtn} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth */}
          {token ? (
            <div className={styles.userBox}>
              <div className={styles.userAvatar}>{username?.[0]?.toUpperCase()}</div>
              <span className={styles.userName}>{username}</span>
              <button onClick={logout} className={styles.logoutBtn} title="Logout"><LogOut size={15} /></button>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login">
                <button className={styles.loginBtn}><User size={14} /> Customer Login</button>
              </Link>
              <Link to="/admin/login">
                <button className={styles.adminLoginBtn}><Settings size={14} /> Admin</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/menu" onClick={() => setMobileOpen(false)}>Menu</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
          {token && role === 'customer' && <Link to="/dashboard" onClick={() => setMobileOpen(false)}>My Dashboard</Link>}
          {token && role === 'employee' && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
          {role !== 'employee' && <button onClick={() => { setCartOpen(true); setMobileOpen(false); }} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShoppingCart size={16}/> Cart ({cartCount})</button>}
          {token ? <button onClick={logout}>Logout</button> : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Customer Login</Link>
              <Link to="/admin/login" onClick={() => setMobileOpen(false)}>Admin Login</Link>
            </>
          )}
        </div>
      )}

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

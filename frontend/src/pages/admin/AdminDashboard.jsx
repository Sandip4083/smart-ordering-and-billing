import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import API from '../../api';
import styles from './AdminDashboard.module.css';

const TABS = [
  { id: 'overview',       icon: '📊', label: 'Overview' },
  { id: 'analytics',     icon: '📈', label: 'Analytics' },
  { id: 'orders',         icon: '🛒', label: 'Orders' },
  { id: 'reservations',   icon: '📅', label: 'Reservations' },
  { id: 'bills',          icon: '🧾', label: 'Bills' },
  { id: 'users',          icon: '👥', label: 'Users' },
  { id: 'feedback',       icon: '💬', label: 'Feedback' },
  { id: 'notifications',  icon: '🔔', label: 'Notifications' },
];

const STATUS_COLORS = { Pending: '#f39c12', 'In Progress': '#3498db', Completed: '#27ae60', Cancelled: '#e74c3c' };
const PIE_COLORS = ['#b89e60', '#3498db', '#27ae60', '#e74c3c', '#9b59b6'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const fetchData = useCallback(async () => {
    try {
      const [o, r, f, b, n] = await Promise.all([
        API.get('/orders'), API.get('/reservations'), API.get('/feedback'),
        API.get('/bills'), API.get('/notifications'),
      ]);
      setOrders(o.data); setReservations(r.data); setFeedback(f.data);
      setBills(b.data); setNotifications(n.data);
    } catch {}
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try { const { data } = await API.get('/users'); setUsers(data); } catch {}
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const { data } = await API.get('/users/analytics/summary'); setAnalytics(data); } catch {}
  }, []);

  useEffect(() => {
    if (localStorage.getItem('role') !== 'employee') return navigate('/login');
    fetchData();
    fetchUsers();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { fetchData(); fetchAnalytics(); }, 10000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const updateOrderStatus = async (id, status) => {
    const { data } = await API.put(`/orders/${id}/status`, { status });
    setOrders(orders.map(o => o._id === id ? data : o));
  };
  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    await API.delete(`/orders/${id}`);
    setOrders(orders.filter(o => o._id !== id));
    showToast('🗑️ Order deleted');
  };
  const cancelReservation = async (id) => {
    const { data } = await API.put(`/reservations/${id}/cancel`);
    setReservations(reservations.map(r => r._id === id ? data : r));
    showToast('✅ Reservation cancelled');
  };
  const deleteReservation = async (id) => {
    if (!confirm('Delete this reservation?')) return;
    await API.delete(`/reservations/${id}`);
    setReservations(reservations.filter(r => r._id !== id));
    showToast('🗑️ Reservation deleted');
  };
  const markBillPaid = async (id) => {
    const { data } = await API.put(`/bills/${id}/pay`);
    setBills(bills.map(b => b._id === id ? data : b));
    showToast('✅ Bill marked as paid');
  };
  const markAllNotifsRead = async () => {
    await API.put('/notifications/mark-read');
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('✅ All notifications read');
  };
  const deleteUser = async (user) => {
    try {
      await API.delete(`/users/${user._id}`);
      setUsers(users.filter(u => u._id !== user._id));
      setConfirmDelete(null);
      showToast(`✅ User "${user.username}" deleted`);
    } catch (err) { showToast(err.response?.data?.msg || 'Delete failed'); }
  };
  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setUserDetailsLoading(true);
    try {
      const { data } = await API.get(`/users/${user._id}/details`);
      setUserDetails(data);
    } catch {}
    setUserDetailsLoading(false);
  };

  const generateBillForOrder = async (order) => {
    let billItems = [];
    if (order.items && order.items.length > 0) {
      billItems = order.items.map(i => ({ foodItem: i.foodItem, cuisine: i.cuisine || order.cuisine, price: i.price, quantity: i.quantity, currency: '₹' }));
    } else {
      const price = prompt(`Enter price for "${order.foodItem}":`);
      if (!price || isNaN(price)) return;
      billItems = [{ foodItem: order.foodItem, cuisine: order.cuisine, price: Number(price), quantity: 1, currency: '₹' }];
    }
    await API.post('/bills', { customerId: order.customer, customerName: order.customerName, orders: billItems });
    await fetchData();
    showToast('🧾 Bill generated!');
  };

  const printBill = (bill) => {
    const win = window.open('', '', 'width=500,height=700');
    const methodIcons = { razorpay: '💳', paytm: '📱', phonepe: '📲', googlepay: '🔵', upi: '💸', cash: '💵', admin: '✅' };
    win.document.write(`
      <html><head><title>Bill #${bill._id.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 30px; max-width: 420px; margin: 0 auto; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
        .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
        hr { border: 1px dashed #000; margin: 15px 0; }
        .paid { color: green; font-weight: bold; font-size: 20px; text-align: center; }
        .header { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
      </style></head><body>
        <div class="center">
          <div class="header">🍽️ Smart Order</div>
          <p style="font-size:11px; color:#666; margin:0">KIIT Road, Bhubaneswar</p>
          <p style="font-size:11px; color:#666">Receipt #${bill._id.slice(-6).toUpperCase()}</p>
        </div>
        <hr/>
        <div class="row"><span>Customer:</span><span>${bill.customerName}</span></div>
        <div class="row"><span>Date:</span><span>${new Date(bill.createdAt).toLocaleDateString('en-IN')}</span></div>
        <div class="row"><span>Time:</span><span>${new Date(bill.createdAt).toLocaleTimeString('en-IN')}</span></div>
        <hr/>
        ${bill.orders.map(o => `<div class="row"><span>${o.foodItem} ${o.quantity > 1 ? `x${o.quantity}` : ''}</span><span>₹${o.price * (o.quantity || 1)}</span></div>`).join('')}
        <hr/>
        <div class="row"><span>Subtotal</span><span>₹${bill.subtotal}</span></div>
        <div class="row"><span>Tax (10%)</span><span>₹${bill.tax}</span></div>
        <div class="row total"><span>TOTAL</span><span>₹${bill.total}</span></div>
        ${bill.status === 'paid' ? `<hr/><div class="paid">✅ PAID ${methodIcons[bill.paymentMethod] || ''} ${bill.paymentMethod?.toUpperCase() || ''}</div>
        ${bill.transactionId ? `<div class="center" style="font-size:11px; color:#666; margin-top:8px">TXN: ${bill.transactionId}</div>` : ''}` : ''}
        <hr/>
        <div class="center" style="font-size:12px; color:#888">Thank you for dining with us!<br/>Come back soon 🙏</div>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length,
    cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    activeReservations: reservations.filter(r => r.status === 'active').length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    paidBills: bills.filter(b => b.status === 'paid').length,
    totalRevenue: bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0),
    unreadNotifs: notifications.filter(n => !n.read).length,
    totalUsers: users.filter(u => u.role === 'customer').length,
  };

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner} />
      <p>Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h3>Delete User?</h3>
            <p>This will permanently delete <strong>{confirmDelete.username}</strong> and all their orders, bills, and reservations.</p>
            <div className={styles.confirmBtns}>
              <button onClick={() => setConfirmDelete(null)} className={styles.cancelDeleteBtn}>Cancel</button>
              <button onClick={() => deleteUser(confirmDelete)} className={styles.confirmDeleteBtn}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedUser(null); setUserDetails(null); }}>
          <div className={styles.userDetailModal} onClick={e => e.stopPropagation()}>
            <div className={styles.userDetailHeader}>
              <div className={styles.userDetailAvatar}>{selectedUser.username[0].toUpperCase()}</div>
              <div>
                <h2>{selectedUser.username}</h2>
                <p>{selectedUser.email}</p>
                <span className={selectedUser.role === 'employee' ? styles.roleAdmin : styles.roleCustomer}>
                  {selectedUser.role === 'employee' ? '🔑 Admin' : '👤 Customer'}
                </span>
              </div>
              <button className={styles.closeModal} onClick={() => { setSelectedUser(null); setUserDetails(null); }}>✕</button>
            </div>
            {userDetailsLoading ? (
              <div className={styles.loader}><div className={styles.spin} /></div>
            ) : userDetails && (
              <div className={styles.userDetailBody}>
                <div className={styles.userStatRow}>
                  {[
                    { label: 'Total Orders', val: userDetails.orders.length, color: '#3498db' },
                    { label: 'Bills', val: userDetails.bills.length, color: '#b89e60' },
                    { label: 'Reservations', val: userDetails.reservations.length, color: '#27ae60' },
                    { label: 'Total Spent', val: `₹${selectedUser.totalSpent}`, color: '#e74c3c' },
                  ].map(s => (
                    <div key={s.label} className={styles.userStat}>
                      <strong style={{ color: s.color }}>{s.val}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                {userDetails.orders.length > 0 && (
                  <div>
                    <h4 className={styles.detailSubTitle}>Recent Orders</h4>
                    {userDetails.orders.slice(0, 5).map(o => (
                      <div key={o._id} className={styles.detailRow}>
                        <span>{o.items?.length > 0 ? o.items.map(i => i.foodItem).join(', ') : o.foodItem}</span>
                        <span className={styles.microBadge} style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <div className={styles.adminLogo}>🍽️</div>
          <h2>Admin Panel</h2>
          <p>👤 {username}</p>
          <div className={styles.autoRefreshToggle}>
            <input type="checkbox" id="autoRef" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            <label htmlFor="autoRef">Auto-refresh (10s)</label>
          </div>
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`${styles.sideBtn} ${tab === t.id ? styles.activeSide : ''}`}>
              <span className={styles.sideIcon}>{t.icon}</span>
              {t.label}
              {t.id === 'notifications' && stats.unreadNotifs > 0 && <span className={styles.sideBadge}>{stats.unreadNotifs}</span>}
              {t.id === 'bills' && stats.pendingBills > 0 && <span className={styles.sideBadge}>{stats.pendingBills}</span>}
              {t.id === 'orders' && stats.activeOrders > 0 && <span className={styles.sideCountBadge}>{stats.activeOrders}</span>}
            </button>
          ))}
        </nav>
        <button className={styles.logoutSide} onClick={() => { localStorage.clear(); navigate('/'); }}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>

        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              {[
                { icon: '🛒', label: 'Total Orders', val: stats.totalOrders, color: '#b89e60', sub: `${stats.activeOrders} active` },
                { icon: '✅', label: 'Completed', val: stats.completedOrders, color: '#27ae60', sub: `${stats.cancelledOrders} cancelled` },
                { icon: '📅', label: 'Reservations', val: stats.activeReservations, color: '#9b59b6', sub: 'active bookings' },
                { icon: '💰', label: 'Revenue', val: `₹${stats.totalRevenue.toFixed(0)}`, color: '#27ae60', sub: `${stats.paidBills} paid bills` },
                { icon: '🧾', label: 'Pending Bills', val: stats.pendingBills, color: '#e74c3c', sub: 'awaiting payment' },
                { icon: '👥', label: 'Customers', val: stats.totalUsers, color: '#3498db', sub: 'registered users' },
                { icon: '💬', label: 'Feedback', val: feedback.length, color: '#f39c12', sub: 'reviews received' },
                { icon: '🔔', label: 'Alerts', val: stats.unreadNotifs, color: '#e74c3c', sub: 'unread' },
              ].map(s => (
                <div key={s.label} className={styles.statCard} style={{ '--accent': s.color }}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Mini Charts */}
            {analytics && (
              <div className={styles.miniChartsGrid}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>📦 Orders (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={analytics.ordersByDay}>
                      <defs>
                        <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b89e60" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#b89e60" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0f0f0' }} />
                      <Area type="monotone" dataKey="orders" stroke="#b89e60" strokeWidth={2} fill="url(#ordersGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>🥧 Order Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={analytics.statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {analytics.statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0f0f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Orders Table */}
            <h3 className={styles.sectionTitle}>Recent Orders</h3>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Items</th><th>Address</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.slice(0, 6).map(o => (
                    <tr key={o._id}>
                      <td><strong>{o.customerName}</strong></td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.items?.length > 0 ? o.items.map(i => `${i.foodItem} x${i.quantity}`).join(', ') : o.foodItem}
                      </td>
                      <td>{o.deliveryPlace}</td>
                      <td><span className={styles.badge} style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                      <td>
                        <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)} className={styles.select}>
                          {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ANALYTICS ─── */}
        {tab === 'analytics' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Analytics & Reports</h1>
            {!analytics ? (
              <div className={styles.loader}><div className={styles.spin} /></div>
            ) : (
              <>
                <div className={styles.analyticsStats}>
                  {[
                    { label: 'Total Revenue', val: `₹${analytics.totalRevenue?.toFixed(0) || 0}`, color: '#27ae60', icon: '💰' },
                    { label: 'Total Orders', val: orders.length, color: '#b89e60', icon: '📦' },
                    { label: 'Avg Order Value', val: `₹${orders.length > 0 ? (analytics.totalRevenue / bills.filter(b => b.status === 'paid').length || 0).toFixed(0) : 0}`, color: '#3498db', icon: '📊' },
                    { label: 'Paid Bills', val: bills.filter(b => b.status === 'paid').length, color: '#9b59b6', icon: '✅' },
                  ].map(s => (
                    <div key={s.label} className={styles.analyticsStat} style={{ '--accent': s.color }}>
                      <div className={styles.analyticsStatIcon}>{s.icon}</div>
                      <div className={styles.analyticsStatVal} style={{ color: s.color }}>{s.val}</div>
                      <div className={styles.analyticsStatLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.chartsGrid}>
                  <div className={`${styles.chartCard} ${styles.chartWide}`}>
                    <h3 className={styles.chartTitle}>💹 Revenue & Orders (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics.ordersByDay} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0f0f0' }} />
                        <Legend wrapperStyle={{ color: '#888', fontSize: 12 }} />
                        <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#b89e60" radius={[4,4,0,0]} />
                        <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#3498db" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>🚴 Order Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={analytics.typeDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} fontSize={11}>
                          {analytics.typeDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0f0f0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>⭐ Order Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.statusDist} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0f0f0' }} />
                        <Bar dataKey="value" name="Count" radius={[0,4,4,0]}>
                          {analytics.statusDist.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {analytics.topDishes?.length > 0 && (
                    <div className={styles.chartCard}>
                      <h3 className={styles.chartTitle}>🍽️ Top Ordered Dishes</h3>
                      <div className={styles.topDishes}>
                        {analytics.topDishes.map((d, i) => (
                          <div key={d._id} className={styles.topDishRow}>
                            <span className={styles.topDishRank}>#{i + 1}</span>
                            <span className={styles.topDishName}>{d._id}</span>
                            <div className={styles.topDishBar}>
                              <div className={styles.topDishFill} style={{ width: `${(d.count / analytics.topDishes[0].count) * 100}%` }} />
                            </div>
                            <span className={styles.topDishCount}>{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {tab === 'orders' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>All Orders ({orders.length})</h1>
              <button className={styles.exportBtn} onClick={() => {
                const csv = 'ID,Customer,Items,Address,Status,Date\n' + orders.map(o => {
                  const items = o.items?.length ? o.items.map(i => `${i.foodItem} x${i.quantity}`).join(';') : o.foodItem;
                  return `"${o._id}","${o.customerName}","${items}","${o.deliveryPlace}","${o.status}","${new Date(o.createdAt).toLocaleDateString()}"`;
                }).join('\n');
                const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
                showToast('📥 Exported as CSV!');
              }}>📥 Export CSV</button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Items</th><th>Type</th><th>Address</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><strong>{o.customerName}</strong></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {o.items?.length > 0 ? o.items.map(i => `${i.foodItem} x${i.quantity}`).join(', ') : o.foodItem}
                      </td>
                      <td><span className={styles.typePill}>{o.orderType === 'delivery' ? '🚴' : o.orderType === 'dine-in' ? '🍽️' : '🥡'} {o.orderType}</span></td>
                      <td style={{ fontSize: '0.8rem', color: '#888' }}>{o.deliveryPlace}</td>
                      <td style={{ fontSize: '0.8rem', color: '#888' }}>{o.deliveryTime}</td>
                      <td><span className={styles.badge} style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                      <td className={styles.actions}>
                        <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)} className={styles.select}>
                          {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button className={styles.billBtn} onClick={() => generateBillForOrder(o)} title="Generate Bill">🧾</button>
                        <button className={styles.delBtn} onClick={() => deleteOrder(o._id)} title="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── RESERVATIONS ─── */}
        {tab === 'reservations' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>All Reservations ({reservations.length})</h1>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Guest</th><th>Table</th><th>Guests</th><th>Date</th><th>Time</th><th>Pre-Orders</th><th>Occasion</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r._id}>
                      <td><strong>{r.customerName}</strong></td>
                      <td>{r.guestName}</td>
                      <td>#{r.tableNumber} <span style={{ fontSize: '0.75rem', color: '#888' }}>{r.tableType}</span></td>
                      <td>👥 {r.numGuests}</td>
                      <td>{r.reservationDate}</td>
                      <td>{r.reservationTime}</td>
                      <td style={{ fontSize: '0.78rem', color: '#b89e60', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.preOrderedItems?.join(', ') || '—'}</td>
                      <td style={{ fontSize: '0.78rem' }}>{r.occasion !== 'None / Casual' && r.occasion !== 'None' ? `🎉 ${r.occasion}` : '—'}</td>
                      <td><span className={styles.badge} style={{ background: r.status === 'active' ? '#27ae6022' : '#e74c3c22', color: r.status === 'active' ? '#27ae60' : '#e74c3c' }}>{r.status === 'active' ? '✅ Active' : '❌ Cancelled'}</span></td>
                      <td className={styles.actions}>
                        {r.status === 'active' && <button className={styles.cancelBtn} onClick={() => cancelReservation(r._id)}>Cancel</button>}
                        <button className={styles.delBtn} onClick={() => deleteReservation(r._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── BILLS ─── */}
        {tab === 'bills' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Billing Management</h1>
            <div className={styles.billSummaryRow}>
              <div className={styles.billSumCard} style={{ '--c': '#e74c3c' }}>
                <span>Pending</span><strong>{stats.pendingBills}</strong>
              </div>
              <div className={styles.billSumCard} style={{ '--c': '#27ae60' }}>
                <span>Paid</span><strong>{stats.paidBills}</strong>
              </div>
              <div className={styles.billSumCard} style={{ '--c': '#b89e60' }}>
                <span>Total Revenue</span><strong>₹{stats.totalRevenue.toFixed(0)}</strong>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Bill ID</th><th>Customer</th><th>Items</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Method</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontSize: '0.75rem', color: '#888' }}>#{b._id.slice(-6).toUpperCase()}</td>
                      <td><strong>{b.customerName}</strong></td>
                      <td style={{ fontSize: '0.78rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.orders.map(o => o.foodItem).join(', ')}</td>
                      <td>₹{b.subtotal}</td>
                      <td>₹{b.tax}</td>
                      <td><strong style={{ color: '#b89e60' }}>₹{b.total}</strong></td>
                      <td>
                        {b.paymentMethod && b.paymentMethod !== 'admin' ? (
                          <span className={styles.methodPill}>{
                            { razorpay: '💳 Razorpay', paytm: '📱 Paytm', phonepe: '📲 PhonePe', googlepay: '🔵 GPay', upi: '💸 UPI', cash: '💵 Cash' }[b.paymentMethod] || b.paymentMethod
                          }</span>
                        ) : <span style={{ color: '#555' }}>—</span>}
                      </td>
                      <td><span className={styles.badge} style={{ background: b.status === 'paid' ? '#27ae6022' : '#f39c1222', color: b.status === 'paid' ? '#27ae60' : '#f39c12' }}>{b.status === 'paid' ? '✅ Paid' : '⏳ Pending'}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        {b.status === 'pending' && <button className={styles.payBtn} onClick={() => markBillPaid(b._id)}>✅ Mark Paid</button>}
                        <button className={styles.payBtn} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => printBill(b)}>🖨️ Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {tab === 'users' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>User Management ({users.length})</h1>
              <button className={styles.exportBtn} onClick={fetchUsers} title="Refresh">🔄 Refresh</button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Orders</th><th>Bills</th><th>Reservations</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userCellAvatar}>{u.username[0].toUpperCase()}</div>
                          <strong>{u.username}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#888' }}>{u.email || '—'}</td>
                      <td>
                        <span className={u.role === 'employee' ? styles.roleAdmin : styles.roleCustomer}>
                          {u.role === 'employee' ? '🔑 Admin' : '👤 Customer'}
                        </span>
                      </td>
                      <td>{u.orderCount || 0}</td>
                      <td>{u.billCount || 0}</td>
                      <td>{u.reservationCount || 0}</td>
                      <td style={{ color: '#b89e60', fontWeight: 700 }}>₹{u.totalSpent || 0}</td>
                      <td style={{ fontSize: '0.78rem', color: '#888' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className={styles.actions}>
                        <button className={styles.viewBtn} onClick={() => viewUserDetails(u)} title="View Details">👁️</button>
                        {u._id !== localStorage.getItem('userId') && (
                          <button className={styles.delBtn} onClick={() => setConfirmDelete(u)} title="Delete User">🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── FEEDBACK ─── */}
        {tab === 'feedback' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Customer Feedback ({feedback.length})</h1>
            <div className={styles.feedbackGrid}>
              {feedback.map(f => (
                <div key={f._id} className={styles.feedbackCard}>
                  <div className={styles.feedbackTop}>
                    <strong>{f.name || 'Anonymous'}</strong>
                    <span className={styles.feedbackTime}>{new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className={styles.feedbackMsg}>{f.message}</p>
                </div>
              ))}
              {feedback.length === 0 && <p className={styles.empty}>No feedback received yet.</p>}
            </div>
          </div>
        )}

        {/* ─── NOTIFICATIONS ─── */}
        {tab === 'notifications' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Notifications</h1>
              {stats.unreadNotifs > 0 && <button className={styles.exportBtn} onClick={markAllNotifsRead}>✅ Mark All Read</button>}
            </div>
            <div className={styles.notifList}>
              {notifications.map(n => (
                <div key={n._id} className={`${styles.notifCard} ${!n.read ? styles.notifUnread : ''}`}>
                  <div className={styles.notifIcon}>
                    {n.type === 'new_order' ? '🛒' : n.type === 'new_reservation' ? '📅' : n.type === 'cancellation' ? '❌' : '💬'}
                  </div>
                  <div className={styles.notifBody}>
                    <p className={styles.notifTitle}>{n.title}</p>
                    <p className={styles.notifMsg}>{n.message}</p>
                    <p className={styles.notifTime}>{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  {!n.read && <div className={styles.unreadDot} />}
                </div>
              ))}
              {notifications.length === 0 && <p className={styles.empty}>No notifications yet.</p>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

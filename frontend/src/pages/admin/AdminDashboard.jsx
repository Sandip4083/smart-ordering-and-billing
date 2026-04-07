import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import styles from './AdminDashboard.module.css';

const TABS = ['overview', 'orders', 'reservations', 'bills', 'inventory', 'feedback', 'notifications'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const fetchData = () => {
    Promise.all([
      API.get('/orders'),
      API.get('/reservations'),
      API.get('/feedback'),
      API.get('/bills'),
      API.get('/notifications'),
    ]).then(([o, r, f, b, n]) => {
      setOrders(o.data);
      setReservations(r.data);
      setFeedback(f.data);
      setBills(b.data);
      setNotifications(n.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (localStorage.getItem('role') !== 'employee') return navigate('/login');
    fetchData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const idx = setInterval(fetchData, 10000);
      setRefreshInterval(idx);
      return () => clearInterval(idx);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }, [autoRefresh]);

  const updateOrderStatus = async (id, status) => {
    const { data } = await API.put(`/orders/${id}/status`, { status });
    setOrders(orders.map(o => o._id === id ? data : o));
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    await API.delete(`/orders/${id}`);
    setOrders(orders.filter(o => o._id !== id));
  };

  const cancelReservation = async (id) => {
    const { data } = await API.put(`/reservations/${id}/cancel`);
    setReservations(reservations.map(r => r._id === id ? data : r));
  };

  const deleteReservation = async (id) => {
    if (!confirm('Delete this reservation?')) return;
    await API.delete(`/reservations/${id}`);
    setReservations(reservations.filter(r => r._id !== id));
  };

  const generateBill = async (order) => {
    const price = prompt(`Enter price for "${order.foodItem}" (number only):`);
    if (!price || isNaN(price)) return;
    await API.post('/bills', {
      customerId: order.customer,
      customerName: order.customerName,
      orders: [{ foodItem: order.foodItem, cuisine: order.cuisine, price: Number(price), currency: '₹' }],
    });
    const { data } = await API.get('/bills');
    setBills(data);
    alert('Bill generated!');
  };

  const markBillPaid = async (id) => {
    const { data } = await API.put(`/bills/${id}/pay`);
    setBills(bills.map(b => b._id === id ? data : b));
  };

  const markAllNotifsRead = async () => {
    await API.put('/notifications/mark-read');
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const printBill = (bill) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <html><head><title>Print Bill</title><style>
        body { font-family: monospace; padding: 20px; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        hr { border: 1px dashed #000; }
      </style></head><body>
        <div class="center">
          <h2>Smart Order & Billing</h2>
          <p>Customer: ${bill.customerName}</p>
        </div><hr/>
        ${bill.orders.map(o => `<div class="row"><span>${o.foodItem}</span><span>₹${o.price}</span></div>`).join('')}
        <hr/>
        <div class="row"><span>Subtotal</span><span>₹${bill.subtotal}</span></div>
        <div class="row"><span>Tax (10%)</span><span>₹${bill.tax}</span></div>
        <div class="row"><strong>TOTAL</strong><strong>₹${bill.total}</strong></div>
        <hr/><div class="center"><p>Thank you for dining with us!</p></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const exportOrdersToCSV = () => {
    const header = 'ID,Customer,Item,Cuisine,Address,Status,Date\\n';
    const rows = orders.map(o => `"${o._id}","${o.customerName}","${o.foodItem}","${o.cuisine}","${o.deliveryPlace}","${o.status}","${new Date(o.createdAt).toLocaleDateString()}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'admin_reports.csv'; a.click();
  };

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length,
    cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
    activeReservations: reservations.filter(r => r.status === 'active').length,
    cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
    feedbackCount: feedback.length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    unreadNotifs: notifications.filter(n => !n.read).length,
  };

  const statusColors = { Pending: '#f39c12', 'In Progress': '#3498db', Completed: '#27ae60', Cancelled: '#e74c3c' };

  if (loading) return <div className={styles.loading}>Loading admin panel...</div>;

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <h2>Admin Panel</h2>
          <p>👤 {username}</p>
          <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 6 }}>
            <input type="checkbox" id="autoRef" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            <label htmlFor="autoRef" style={{ cursor: 'pointer' }}>Auto-Refresh (10s)</label>
          </div>
        </div>
        <nav className={styles.sideNav}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`${styles.sideBtn} ${tab === t ? styles.activeSide : ''}`}>
              {t === 'overview' && '📊'} {t === 'orders' && '🛒'} {t === 'reservations' && '📅'}
              {t === 'bills' && '🧾'} {t === 'inventory' && '📦'} {t === 'feedback' && '💬'} {t === 'notifications' && '🔔'}
              {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'notifications' && stats.unreadNotifs > 0 && <span className={styles.sideBadge}>{stats.unreadNotifs}</span>}
              {t === 'bills' && stats.pendingBills > 0 && <span className={styles.sideBadge}>{stats.pendingBills}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.main}>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              {[
                { label: 'Total Orders',          val: stats.totalOrders,           color: '#b89e60', icon: '🛒' },
                { label: 'Active Orders',          val: stats.activeOrders,          color: '#3498db', icon: '⚡' },
                { label: 'Cancelled Orders',       val: stats.cancelledOrders,       color: '#e74c3c', icon: '❌' },
                { label: 'Active Reservations',    val: stats.activeReservations,    color: '#27ae60', icon: '📅' },
                { label: 'Cancelled Reservations', val: stats.cancelledReservations, color: '#e67e22', icon: '🚫' },
                { label: 'Feedback Count',         val: stats.feedbackCount,         color: '#9b59b6', icon: '💬' },
                { label: 'Pending Bills',          val: stats.pendingBills,          color: '#e74c3c', icon: '🧾' },
                { label: 'Unread Notifications',   val: stats.unreadNotifs,          color: '#f39c12', icon: '🔔' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Analytics Section */}
            <div className={styles.chartGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>💰 Revenue Analytics (Last 7 Days)</h3>
                <div className={styles.barChart}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const val = [45, 78, 52, 91, 64, 110, 85][i];
                    return (
                      <div key={day} className={styles.barWrap}>
                        <div className={styles.bar} style={{ 
                          height: `${(val / 120) * 100}%`, 
                          background: i === 6 ? 'var(--gold-grad)' : 'var(--border-light)' 
                        }}>
                          <span className={styles.barVal}>₹{val * 50}</span>
                        </div>
                        <span className={styles.barLabel}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Cuisine Performance</h3>
                <div className={styles.legend}>
                  {[
                    { label: 'Indian (45%)', color: '#b89e60' },
                    { label: 'Chinese (20%)', color: '#3498db' },
                    { label: 'Italian (15%)', color: '#27ae60' },
                    { label: 'Others (20%)', color: '#9b59b6' }
                  ].map(l => (
                    <div key={l.label} className={styles.legendItem}>
                      <div className={styles.dot} style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>Top Category Today</p>
                  <strong style={{ color: 'var(--gold)' }}>🔥 Spicy Indian Dishes</strong>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Recent Orders</h2>
              <button onClick={exportOrdersToCSV} style={{ background: 'var(--bg)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>📥 Export CSV</button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Item</th><th>Address</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o._id}>
                      <td>{o.customerName}</td>
                      <td><strong>{o.foodItem}</strong></td>
                      <td>{o.deliveryPlace}</td>
                      <td><span className={styles.badge} style={{ background: statusColors[o.status] + '22', color: statusColors[o.status] }}>{o.status}</span></td>
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

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <h1 className={styles.pageTitle}>All Orders</h1>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Item</th><th>Cuisine</th><th>Address</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td>{o.customerName}</td>
                      <td><strong>{o.foodItem}</strong></td>
                      <td>{o.cuisine}</td>
                      <td>{o.deliveryPlace}</td>
                      <td>{o.deliveryTime}</td>
                      <td><span className={styles.badge} style={{ background: statusColors[o.status] + '22', color: statusColors[o.status] }}>{o.status}</span></td>
                      <td className={styles.actions}>
                        <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)} className={styles.select}>
                          {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button className={styles.billBtn} onClick={() => generateBill(o)}>🧾 Bill</button>
                        <button className={styles.delBtn} onClick={() => deleteOrder(o._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {tab === 'reservations' && (
          <div>
            <h1 className={styles.pageTitle}>All Reservations</h1>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Guest Name</th><th>Table</th><th>Guests</th><th>Date</th><th>Time</th><th>Pre-Orders</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r._id}>
                      <td>{r.customerName}</td>
                      <td>{r.guestName}</td>
                      <td>#{r.tableNumber}</td>
                      <td>{r.numGuests}</td>
                      <td>{r.reservationDate}</td>
                      <td>{r.reservationTime}</td>
                      <td style={{ fontSize: '0.8rem', color: '#b89e60' }}>{r.preOrderedItems?.join(', ') || '—'}</td>
                      <td><span className={styles.badge} style={{ background: r.status === 'active' ? '#27ae6022' : '#e74c3c22', color: r.status === 'active' ? '#27ae60' : '#e74c3c' }}>{r.status}</span></td>
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

        {/* Bills Tab */}
        {tab === 'bills' && (
          <div>
            <h1 className={styles.pageTitle}>Billing Management</h1>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Customer</th><th>Items</th><th>Subtotal</th><th>Tax (10%)</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td>{b.customerName}</td>
                      <td style={{ fontSize: '0.8rem' }}>{b.orders.map(o => o.foodItem).join(', ')}</td>
                      <td>₹{b.subtotal}</td>
                      <td>₹{b.tax}</td>
                      <td><strong style={{ color: '#b89e60' }}>₹{b.total}</strong></td>
                      <td><span className={styles.badge} style={{ background: b.status === 'paid' ? '#27ae6022' : '#f39c1222', color: b.status === 'paid' ? '#27ae60' : '#f39c12' }}>{b.status}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        {b.status === 'pending' && <button className={styles.payBtn} onClick={() => markBillPaid(b._id)}>✅ Mark Paid</button>}
                        <button className={styles.payBtn} onClick={() => printBill(b)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>🖨️ Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {tab === 'feedback' && (
          <div>
            <h1 className={styles.pageTitle}>Customer Feedback</h1>
            <div className={styles.feedbackList}>
              {feedback.map(f => (
                <div key={f._id} className={styles.feedbackCard}>
                  <div className={styles.feedbackTop}>
                    <strong>{f.name}</strong>
                    <span className={styles.feedbackType}>{f.type}</span>
                    <span className={styles.feedbackTime}>{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{f.message}</p>
                </div>
              ))}
              {feedback.length === 0 && <p className={styles.empty}>No feedback yet.</p>}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div>
            <div className={styles.notifHeader}>
              <h1 className={styles.pageTitle}>Notifications</h1>
              {stats.unreadNotifs > 0 && <button className={styles.markAllBtn} onClick={markAllNotifsRead}>Mark all as read</button>}
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
                    <p className={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <div className={styles.unreadDot} />}
                </div>
              ))}
              {notifications.length === 0 && <p className={styles.empty}>No notifications yet.</p>}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {tab === 'inventory' && (
          <div>
            <h1 className={styles.pageTitle}>Inventory & Menu Management</h1>
            <p className={styles.pageSub} style={{ marginBottom: 20 }}>Manage real-time availability and stock levels across categories</p>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Item</th><th>Category</th><th>Current Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {['Chicken', 'Vegetarian', 'Seafood', 'Dessert'].map(cat => (
                    <tr key={cat} style={{ background: 'rgba(184,158,96,0.05)' }}><td colSpan="5"><strong>📁 {cat} Cuisines</strong></td></tr>
                  ))}
                  {[
                    { name: 'Paneer Butter Masala', cat: 'Vegetarian', stock: 45, status: 'In Stock' },
                    { name: 'Butter Chicken', cat: 'Chicken', stock: 12, status: 'Low Stock' },
                    { name: 'Chocolate Lava Cake', cat: 'Dessert', stock: 0, status: 'Out of Stock' },
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.cat}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="number" defaultValue={item.stock} style={{ width: 60, padding: 4 }} />
                          <button style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Update</button>
                        </div>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ 
                          background: item.status === 'In Stock' ? '#27ae6022' : item.status === 'Out of Stock' ? '#e74c3c22' : '#f39c1222',
                          color: item.status === 'In Stock' ? '#27ae60' : item.status === 'Out of Stock' ? '#e74c3c' : '#f39c12'
                        }}>{item.status}</span>
                      </td>
                      <td>
                        <button style={{ background: item.status === 'In Stock' ? '#e74c3c' : '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>
                          {item.status === 'In Stock' ? 'Disable Item' : 'Enable Item'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

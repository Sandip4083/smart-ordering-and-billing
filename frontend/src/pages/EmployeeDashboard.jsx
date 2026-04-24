import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import styles from './Dashboard.module.css';

export default function EmployeeDashboard() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (localStorage.getItem('role') !== 'employee') return navigate('/login');
    API.get('/orders').then(r => setOrders(r.data)).catch(() => {});
    API.get('/reservations').then(r => setReservations(r.data)).catch(() => {});
    API.get('/feedback').then(r => setFeedback(r.data)).catch(() => {});
  }, []);

  const updateOrderStatus = async (id, status) => {
    await API.put(`/orders/${id}/cancel`);
    setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Employee Dashboard 👨‍💼</h1>
        <p>Logged in as: <strong style={{ color: '#b89e60' }}>{username}</strong></p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Orders', val: orders.length, color: '#b89e60' },
          { label: 'Active Reservations', val: reservations.filter(r => r.status === 'active').length, color: '#27ae60' },
          { label: 'Feedback Count', val: feedback.length, color: '#3498db' },
          { label: 'Pending Orders', val: orders.filter(o => o.status === 'Pending').length, color: '#e67e22' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.tabs}>
        {['orders', 'reservations', 'feedback'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`${styles.tab} ${tab === t ? styles.active : ''}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>Active Orders Management</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: '1px solid #333' }}>
              <tr><th>Customer</th><th>Item</th><th>Address</th><th>Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>{orders.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px 0' }}>{o.customerName}</td>
                <td>{o.foodItem}</td>
                <td>{o.deliveryPlace}</td>
                <td>{o.deliveryTime}</td>
                <td><span className={`badge badge-${o.status.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {o.status === 'Pending' && (
                      <>
                        <button className="btn btn-primary" style={{ padding:'4px 8px', fontSize:'0.75rem', background: '#3498db' }} onClick={async () => {
                          const { data } = await API.put(`/orders/${o._id}`, { status: 'In Progress' });
                          setOrders(orders.map(or => or._id === o._id ? data : or));
                        }}>Accept</button>
                        <button className="btn btn-danger" style={{ padding:'4px 8px', fontSize:'0.75rem', background: '#e74c3c' }} onClick={() => updateOrderStatus(o._id, 'Cancelled')}>Cancel</button>
                      </>
                    )}
                    {o.status === 'In Progress' && (
                      <button className="btn btn-success" style={{ padding:'4px 8px', fontSize:'0.75rem', background: '#27ae60' }} onClick={async () => {
                        const { data } = await API.put(`/orders/${o._id}`, { status: 'Completed' });
                        setOrders(orders.map(or => or._id === o._id ? data : or));
                      }}>Complete</button>
                    )}
                    {o.status === 'Completed' && (
                      <button className="btn btn-warning" style={{ padding:'4px 8px', fontSize:'0.75rem', background: '#f1c40f', color: '#000' }} onClick={async () => {
                        try {
                          await API.post('/bills', { orderId: o._id, amount: o.price || 150 });
                          alert('Bill generated!');
                        } catch (err) { alert('Failed or bill already exists'); }
                      }}>Generate Bill</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>Active Reservations</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ borderBottom: '1px solid #333' }}>
              <tr><th>Guest</th><th>Table</th><th>Guests</th><th>Date</th><th>Special Requests</th><th>Status</th></tr>
            </thead>
            <tbody>{reservations.map(r => (
              <tr key={r._id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px 0' }}>{r.guestName}</td>
                <td>#{r.tableNumber} ({r.tableType})</td>
                <td>{r.numGuests}</td>
                <td>{r.reservationDate} {r.reservationTime}</td>
                <td>{r.specialRequests || 'None'}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>Customer Feedback Feed</h3>
          {feedback.length === 0 ? <p style={{ color: '#888' }}>No feedback yet.</p> :
            feedback.map(f => (
              <div key={f._id} style={{ borderBottom: '1px solid #2a2a2a', padding: '16px 0' }}>
                <strong style={{ color: '#b89e60', fontSize: '1.1rem' }}>{f.name}</strong>
                <span style={{ color: '#555', fontSize: '0.8rem', marginLeft: 12 }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                <p style={{ color: '#eee', marginTop: 8, fontStyle: 'italic' }}>"{f.message}"</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

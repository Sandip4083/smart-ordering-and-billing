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
          { label: 'Cancelled Orders', val: orders.filter(o => o.status === 'Cancelled').length, color: '#c0392b' },
          { label: 'Feedback Count', val: feedback.length, color: '#3498db' },
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
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>All Orders</h3>
          <table>
            <thead><tr><th>Customer</th><th>Item</th><th>Address</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{orders.map(o => (
              <tr key={o._id}>
                <td>{o.customerName}</td><td>{o.foodItem}</td>
                <td>{o.deliveryPlace}</td><td>{o.deliveryTime}</td>
                <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td>{o.status === 'Pending' && <button className="btn btn-danger" style={{ padding:'6px 12px', fontSize:'0.8rem' }} onClick={() => updateOrderStatus(o._id, 'Cancelled')}>Cancel</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>All Reservations</h3>
          <table>
            <thead><tr><th>Guest</th><th>Table</th><th>Guests</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>{reservations.map(r => (
              <tr key={r._id}>
                <td>{r.guestName}</td><td>{r.tableNumber}</td><td>{r.numGuests}</td>
                <td>{r.reservationDate}</td><td>{r.reservationTime}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#b89e60' }}>Customer Feedback</h3>
          {feedback.length === 0 ? <p style={{ color: '#888' }}>No feedback yet.</p> :
            feedback.map(f => (
              <div key={f._id} style={{ borderBottom: '1px solid #2a2a2a', padding: '12px 0' }}>
                <strong style={{ color: '#b89e60' }}>{f.name}</strong>
                <span style={{ color: '#555', fontSize: '0.8rem', marginLeft: 12 }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                <p style={{ color: '#ccc', marginTop: 6 }}>{f.message}</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Zap, CalendarDays, ShoppingBag, ClipboardList, Receipt, MessageSquare, Plus, CheckCircle2, ChevronRight, MapPin, Clock, Users, Star, StarHalf, User, Search, Download, Heart, TrendingUp, LogOut, RefreshCw } from 'lucide-react';
import API from '../api';
import { TimePicker, DatePicker } from '../components/TimePicker';
import styles from './Dashboard.module.css';

const CUISINES = ['Beef','Chicken','Seafood','Pasta','Lamb','Dessert','Vegan','Vegetarian','Starter','Breakfast','Pork','Miscellaneous'];

const TABS = [
  { id: 'overview',      icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { id: 'smart-order',   icon: <Zap size={18} />, label: 'Smart Order' },
  { id: 'smart-reserve', icon: <CalendarDays size={18} />, label: 'Reserve Table' },
  { id: 'orders',        icon: <ShoppingBag size={18} />, label: 'My Orders' },
  { id: 'reservations',  icon: <ClipboardList size={18} />, label: 'My Reservations' },
  { id: 'bills',         icon: <Receipt size={18} />, label: 'My Bills' },
  { id: 'feedback',      icon: <MessageSquare size={18} />, label: 'Recent Reviews' },
  { id: 'profile',       icon: <User size={18} />, label: 'Profile' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);
  const [menu, setMenu] = useState({});
  const [menuLoading, setMenuLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Smart Order state
  const [soCuisine, setSoCuisine] = useState('Chicken');
  const [soCart, setSoCart] = useState([]);
  const [soItems, setSoItems] = useState([]);
  const [soItemsLoading, setSoItemsLoading] = useState(false);
  const [soAddress, setSoAddress] = useState('');
  const [soTime, setSoTime] = useState('');

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });

  // Smart Reserve state
  const [resForm, setResForm] = useState({ guestName:'', numGuests:'' });
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [resOccasion, setResOccasion] = useState('None');
  const [resType, setResType] = useState('Standard');
  const [resNote, setResNote] = useState('');
  const [resPreOrder, setResPreOrder] = useState([]);
  const [resCuisine, setResCuisine] = useState('Chicken');
  const [resMenuItems, setResMenuItems] = useState([]);
  const [resMenuLoading, setResMenuLoading] = useState(false);

  // Feedback
  const [fbMsg, setFbMsg] = useState('');
  const [fbRating, setFbRating] = useState(5);

  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'customer') return navigate('/login');
    Promise.all([API.get('/orders'), API.get('/reservations'), API.get('/bills'), API.get('/favorites')]).then(([o, r, b, f]) => {
      setOrders(o.data);
      setReservations(r.data);
      setBills(b.data);
      setFavorites(f.data.map(i => i.foodName));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Load menu items when Smart Order cuisine changes
  useEffect(() => {
    if (tab !== 'smart-order') return;
    if (menu[soCuisine]) { setSoItems(menu[soCuisine]); return; }
    setSoItemsLoading(true);
    API.get(`/menu/${soCuisine}`).then(r => {
      setMenu(prev => ({ ...prev, [soCuisine]: r.data }));
      setSoItems(r.data);
      setSoItemsLoading(false);
    }).catch(() => setSoItemsLoading(false));
  }, [soCuisine, tab]);

  // Load menu for reservation pre-order
  useEffect(() => {
    if (tab !== 'smart-reserve') return;
    if (menu[resCuisine]) { setResMenuItems(menu[resCuisine]); return; }
    setResMenuLoading(true);
    API.get(`/menu/${resCuisine}`).then(r => {
      setMenu(prev => ({ ...prev, [resCuisine]: r.data }));
      setResMenuItems(r.data);
      setResMenuLoading(false);
    }).catch(() => setResMenuLoading(false));
  }, [resCuisine, tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // Smart Order — place
  const placeSmartOrder = async (e) => {
    e.preventDefault();
    if (soCart.length === 0) return showToast('Select at least one dish', 'error');
    if (!soTime) return showToast('Please select delivery time', 'error');
    if (!soAddress.trim()) return showToast('Please enter delivery address', 'error');
    try {
      await Promise.all(soCart.map(item =>
        API.post('/orders', { foodItem: item.name, cuisine: soCuisine, deliveryPlace: soAddress, deliveryTime: soTime })
      ));
      const { data } = await API.get('/orders');
      setOrders(data);
      setSoCart([]); setSoAddress(''); setSoTime('');
      showToast(`✅ ${soCart.length} item(s) ordered!`);
      setTab('orders');
    } catch (err) { showToast(err.response?.data?.msg || 'Order failed', 'error'); }
  };

  // Reservation — place
  const placeReservation = async (e) => {
    e.preventDefault();
    if (!resDate) return showToast('Please select a date', 'error');
    if (!resTime) return showToast('Please select a time', 'error');
    try {
      const { data } = await API.post('/reservations', {
        ...resForm,
        tableNumber: Math.floor(Math.random() * 20) + 1,
        tableType: resType,
        occasion: resOccasion,
        specialRequests: resNote,
        reservationDate: resDate,
        reservationTime: resTime,
        preOrderedItems: resPreOrder.map(i => i.name),
      });
      setReservations(prev => [data, ...prev]);
      setResForm({ guestName:'', numGuests:'' });
      setResNote(''); setResDate(''); setResTime(''); setResPreOrder([]);
      showToast('✅ Table reserved successfully!');
      setTab('reservations');
    } catch (err) { showToast(err.response?.data?.msg || 'Reservation failed', 'error'); }
  };

  const handleReorder = (order) => {
    setSoCuisine(order.cuisine || 'Chicken');
    setTab('smart-order');
    showToast(`Navigated to ${order.cuisine} for reordering!`);
  };

  const cancelOrder = async (id) => {
    try {
      const { data } = await API.put(`/orders/${id}/cancel`);
      setOrders(orders.map(o => o._id === id ? data : o));
      showToast('Order cancelled');
    } catch (err) { showToast(err.response?.data?.msg || 'Failed', 'error'); }
  };

  const cancelReservation = async (id) => {
    try {
      const { data } = await API.put(`/reservations/${id}/cancel`);
      setReservations(reservations.map(r => r._id === id ? data : r));
      showToast('Reservation cancelled');
    } catch (err) { showToast(err.response?.data?.msg || 'Failed', 'error'); }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await API.post('/feedback', { message: `⭐ ${fbRating}/5 — ${fbMsg}` });
      setFbMsg(''); setFbRating(5);
      showToast('✅ Feedback submitted! Thank you.');
    } catch { showToast('Failed to submit', 'error'); }
  };

  // Cart toggle
  const toggleCart = (item, cartSetter, cart) => {
    cartSetter(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  };

  // Toggle favorite
  const toggleFavorite = async (dish) => {
    try {
      const isFav = favorites.includes(dish.foodItem || dish.name);
      if (isFav) {
        await API.delete(`/favorites/${dish.foodId || dish.id}`);
        setFavorites(favorites.filter(n => n !== (dish.foodItem || dish.name)));
        showToast('Removed from favorites');
      } else {
        await API.post('/favorites', { 
          foodId: dish.foodId || dish.id, 
          foodName: dish.foodItem || dish.name, 
          imgUrl: dish.imgUrl || dish.img, 
          price: dish.price, 
          cuisine: dish.cuisine 
        });
        setFavorites([...favorites, dish.foodItem || dish.name]);
        showToast('❤️ Added to favorites!');
      }
    } catch (err) { showToast('Favorite action failed', 'error'); }
  };

  // Export orders as CSV
  const exportOrdersCSV = () => {
    const header = 'Food Item,Cuisine,Status,Delivery,Date\n';
    const rows = orders.map(o => `"${o.foodItem}","${o.cuisine}","${o.status}","${o.deliveryPlace}","${new Date(o.createdAt).toLocaleDateString()}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'my_orders.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Orders exported as CSV!');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Refresh data
  const refreshData = async () => {
    showToast('🔄 Refreshing...');
    try {
      const [o, r, b] = await Promise.all([API.get('/orders'), API.get('/reservations'), API.get('/bills')]);
      setOrders(o.data); setReservations(r.data); setBills(b.data);
      showToast('✅ Data refreshed!');
    } catch { showToast('Failed to refresh', 'error'); }
  };

  const statusColor = { Pending:'#f39c12','In Progress':'#3498db',Completed:'#27ae60',Cancelled:'#e74c3c' };

  const stats = {
    activeOrders: orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    activeReservations: reservations.filter(r => r.status === 'active').length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    totalBillAmount: bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.total, 0),
    cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
    totalSpent: bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0),
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (orderFilter !== 'all') filtered = filtered.filter(o => o.status === orderFilter);
    if (orderSearch.trim()) filtered = filtered.filter(o => o.foodItem.toLowerCase().includes(orderSearch.toLowerCase()) || o.cuisine.toLowerCase().includes(orderSearch.toLowerCase()));
    return filtered;
  }, [orders, orderFilter, orderSearch]);

  if (loading) return <div className={styles.fullLoader}><div className={styles.spin} /><p>Loading your dashboard...</p></div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{getGreeting()}, <span className={styles.gold}>{username}</span></h1>
          <p>{stats.activeOrders} active order{stats.activeOrders !== 1 ? 's' : ''} · {stats.activeReservations} reservation{stats.activeReservations !== 1 ? 's' : ''} · <strong><Star size={12} fill="var(--gold)" style={{marginRight:2}} /> {orders.length * 15} Points</strong></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={styles.hStats}>
            <div className={styles.hStat}><strong style={{color:'#3498db'}}>{orders.length}</strong><span>Orders</span></div>
            <div className={styles.hStat}><strong style={{color:'#27ae60'}}>{reservations.length}</strong><span>Reservations</span></div>
            <div className={styles.hStat}><strong style={{color: stats.pendingBills > 0 ? '#e74c3c' : '#27ae60'}}>{stats.pendingBills}</strong><span>Pending Bills</span></div>
          </div>
          <button onClick={refreshData} className={styles.catChip} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} title="Refresh Data"><RefreshCw size={16} /></button>
          <button onClick={handleLogout} className={styles.catChip} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', color: '#e74c3c', borderColor: 'rgba(231,76,60,0.3)' }} title="Logout"><LogOut size={16} /></button>
        </div>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`${styles.tab} ${tab === t.id ? styles.activeTab : ''}`}>
            <span className={styles.tabIcon}>{t.icon}</span>
            <span className={styles.tabLabel}>{t.label}</span>
            {t.id === 'bills' && stats.pendingBills > 0 && <span className={styles.tabBadge}>{stats.pendingBills}</span>}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className={styles.content}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Stats row */}
            {/* Stats row */}
            <div className={styles.statGrid}>
              {[
                { icon: <ShoppingBag />, label:'Total Orders',        val: orders.length,            color:'#3498db' },
                { icon: <Zap />,         label:'Active Orders',       val: stats.activeOrders,       color:'#f39c12' },
                { icon: <CheckCircle2 />,label:'Completed Orders',    val: stats.completedOrders,    color:'#27ae60' },
                { icon: <CalendarDays />,label:'Active Reservations', val: stats.activeReservations, color:'#9b59b6' },
                { icon: <Receipt />,     label:'Pending Bills',       val: stats.pendingBills,       color: stats.pendingBills > 0 ? '#e74c3c' : '#27ae60' },
                { icon: <Receipt />,     label:'Amount Due',          val: `₹${stats.totalBillAmount}`, color:'#e74c3c' },
                { icon: <TrendingUp />,  label:'Total Spent',         val: `₹${stats.totalSpent}`,   color:'#1abc9c' },
                { icon: <Heart />,       label:'Favorites',           val: favorites.length,         color:'#e91e63' },
              ].map(s => (
                <div key={s.label} className={styles.statCard} onClick={() => {
                  if (s.label.includes('Order')) setTab('orders');
                  else if (s.label.includes('Reservation')) setTab('reservations');
                  else if (s.label.includes('Bill') || s.label.includes('Amount') || s.label.includes('Spent')) setTab('bills');
                  else if (s.label.includes('Favorite')) setTab('orders');
                }}>
                  <div className={styles.statIcon} style={{ color: s.color }}>{s.icon}</div>
                  <div className={styles.statVal}>{s.val}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h3 className={styles.secTitle}>Quick Actions</h3>
            <div className={styles.quickGrid}>
              {[
                { icon: <Zap />,         title:'Smart Order',     desc:'Order multiple dishes instantly',        tab:'smart-order',   color:'#f39c12' },
                { icon: <CalendarDays />,title:'Reserve Table',    desc:'Book with optional food pre-order',      tab:'smart-reserve', color:'#9b59b6' },
                { icon: <ShoppingBag />, title:'My Orders',        desc:'Track & manage your orders',             tab:'orders',        color:'#3498db' },
                { icon: <Receipt />,     title:'My Bills',         desc:`${stats.pendingBills} pending payment`,  tab:'bills',         color:'#e74c3c' },
                { icon: <MessageSquare />,title:'Send Feedback',   desc:'Rate your experience & help us improve', tab:'feedback',      color:'#27ae60' },
                { icon: <User />,        title:'My Profile',       desc:'View account info & activity',           tab:'profile',       color:'#1abc9c' },
              ].map(q => (
                <div key={q.title} className={styles.quickCard} onClick={() => setTab(q.tab)}>
                  <div className={styles.quickIcon} style={{ background: q.color + '15', color: q.color }}>{q.icon}</div>
                  <div><h4>{q.title}</h4><p>{q.desc}</p></div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <>
                <h3 className={styles.secTitle}>Recent Orders</h3>
                <div className={styles.recentList}>
                  {orders.slice(0, 4).map(o => (
                    <div key={o._id} className={styles.recentItem}>
                      <div className={styles.recentLeft}>
                        <div className={styles.recentIcon}><ShoppingBag size={20} color="#b89e60" /></div>
                        <div>
                          <p className={styles.recentTitle}>{o.foodItem}</p>
                          <p className={styles.recentSub}>{o.cuisine} · {o.deliveryPlace}</p>
                        </div>
                      </div>
                      <span className={styles.statusPill} style={{ background: statusColor[o.status] + '22', color: statusColor[o.status] }}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pending bills banner */}
            {stats.pendingBills > 0 && (
              <div className={styles.billBanner} onClick={() => setTab('bills')}>
                <div>
                  <p className={styles.bannerTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Receipt size={18}/> You have {stats.pendingBills} pending bill{stats.pendingBills > 1 ? 's' : ''}</p>
                  <p className={styles.bannerSub}>Total amount due: <strong>₹{stats.totalBillAmount}</strong></p>
                </div>
                <button className={styles.bannerBtn}>View Bills →</button>
              </div>
            )}
          </div>
        )}

        {/* ── SMART ORDER ── */}
        {tab === 'smart-order' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Zap /> Smart Order</h2>
            <p className={styles.pageSub}>Select a category, pick multiple dishes, and place them all at once</p>

            {/* Category tabs */}
            <div className={styles.catScroll}>
              {CUISINES.map(c => (
                <button key={c} onClick={() => { setSoCuisine(c); setSoCart([]); }}
                  className={`${styles.catChip} ${soCuisine === c ? styles.activeCat : ''}`}>{c}</button>
              ))}
            </div>

            {/* Cart */}
            {soCart.length > 0 && (
              <div className={styles.cartBar}>
                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShoppingBag size={18} /> <strong>{soCart.length}</strong> selected — {soCart.map(i => i.name).join(', ')}</span>
                <span className={styles.cartTotal}>₹{soCart.reduce((s, i) => s + i.price, 0)}</span>
              </div>
            )}

            {/* Items */}
            {soItemsLoading ? <div className={styles.loader}><div className={styles.spin} /></div> : (
              <div className={styles.foodGrid}>
                {soItems.slice(0, 20).map(item => {
                  const inCart = soCart.find(i => i.id === item.id);
                  return (
                    <div key={item.id} className={`${styles.foodCard} ${inCart ? styles.foodSelected : ''}`}
                      onClick={() => toggleCart(item, setSoCart, soCart)}>
                      <img src={item.img} alt={item.name} className={styles.foodImg}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';}} />
                      {inCart && <div className={styles.checkOverlay}>✓</div>}
                      <div className={item.isVeg ? styles.vegIndicator : styles.nonVegIndicator} style={{ left: 8, top: 8 }}>
                        <div className={item.isVeg ? styles.vegDot : styles.nonVegDot} />
                      </div>
                      <div className={styles.foodInfo}>
                        <p className={styles.foodName}>{item.name}</p>
                        <p className={styles.foodPrice}>₹{item.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Delivery form */}
            <form onSubmit={placeSmartOrder} className={styles.orderForm}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><MapPin size={18} /> Delivery Details</h3>
              <input placeholder="Delivery address" required value={soAddress} onChange={e => setSoAddress(e.target.value)} className={styles.inp} />
              <TimePicker label="Delivery Time" value={soTime} onChange={setSoTime} />
              <button type="submit" className={styles.bigBtn} disabled={soCart.length === 0}>
                Place Order · {soCart.length} item{soCart.length !== 1 ? 's' : ''} · ₹{soCart.reduce((s,i) => s+i.price, 0)}
              </button>
            </form>
          </div>
        )}

        {/* ── RESERVE TABLE ── */}
        {tab === 'smart-reserve' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><CalendarDays /> Reserve a Table</h2>
            <p className={styles.pageSub}>Book your table and optionally pre-order dishes for your arrival</p>

            <div className={styles.reserveGrid}>
              {/* Form */}
              <form onSubmit={placeReservation} className={styles.resBox}>
                <h3>Table Details</h3>
                <input placeholder="Your full name" required value={resForm.guestName} onChange={e => setResForm({...resForm, guestName: e.target.value})} className={styles.inp} />
                <div className={styles.formRow2}>
                  <input type="number" placeholder="# Guests" min="1" max="20" required value={resForm.numGuests} onChange={e => setResForm({...resForm, numGuests: e.target.value})} className={styles.inp} />
                  <select value={resType} onChange={e => setResType(e.target.value)} className={styles.inp}>
                    <option>Standard Table</option>
                    <option>Booth Seat</option>
                    <option>Window Table</option>
                    <option>Premium Lounge</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Occasion</label>
                  <select value={resOccasion} onChange={e => setResOccasion(e.target.value)} className={styles.inp}>
                    <option>None / Casual</option>
                    <option>Birthday Party</option>
                    <option>Anniversary Dinner</option>
                    <option>Business Meeting</option>
                    <option>Romantic Date</option>
                  </select>
                </div>
                <textarea placeholder="Special requests (e.g. Near window, extra chair, cake)" value={resNote} onChange={e => setResNote(e.target.value)} className={styles.inp} style={{ height: 60, resize: 'none' }} />
                <DatePicker label="Reservation Date" value={resDate} onChange={setResDate} />
                <TimePicker label="Reservation Time" value={resTime} onChange={setResTime} />

                {resPreOrder.length > 0 && (
                  <div className={styles.preOrderBadge}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShoppingBag size={16} /> Pre-ordered: {resPreOrder.map(i => i.name).join(' · ')}</span>
                    <strong> (₹{resPreOrder.reduce((s,i) => s+i.price, 0)})</strong>
                  </div>
                )}

                <button type="submit" className={styles.bigBtn}>
                  Confirm Reservation {resPreOrder.length > 0 ? `+ ${resPreOrder.length} pre-order(s)` : ''}
                </button>
              </form>

              {/* Pre-order menu */}
              <div className={styles.preOrderPanel}>
                <h3>Pre-Order Food <span className={styles.optional}>(Optional)</span></h3>
                <div className={styles.catScroll} style={{ marginBottom: 12 }}>
                  {CUISINES.map(c => (
                    <button key={c} onClick={() => setResCuisine(c)}
                      className={`${styles.catChip} ${resCuisine === c ? styles.activeCat : ''}`}>{c}</button>
                  ))}
                </div>
                {resMenuLoading ? <div className={styles.loader}><div className={styles.spin} /></div> : (
                  <div className={styles.preList}>
                    {resMenuItems.slice(0, 15).map(item => {
                      const sel = resPreOrder.find(i => i.id === item.id);
                      return (
                        <div key={item.id} className={`${styles.preItem} ${sel ? styles.preSelected : ''}`}
                          onClick={() => toggleCart(item, setResPreOrder, resPreOrder)}>
                          <img src={item.img} alt={item.name} className={styles.preImg}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80';}} />
                          <span className={styles.preName}>{item.name}</span>
                          <span className={styles.prePrice}>₹{item.price}</span>
                          {sel && <span className={styles.preCheck}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MY ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px', margin: 0}}><ShoppingBag /> My Orders</h2>
              {orders.length > 0 && (
                <button onClick={exportOrdersCSV} className={styles.catChip} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Download size={14} /> Export CSV
                </button>
              )}
            </div>

            {/* Search & Filter */}
            {orders.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    className={styles.inp}
                    placeholder="Search orders by dish or cuisine..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    style={{ paddingLeft: 40, marginBottom: 0 }}
                  />
                </div>
                <div className={styles.catScroll} style={{ marginBottom: 0 }}>
                  {['all', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`${styles.catChip} ${orderFilter === s ? styles.activeCat : ''}`}>
                      {s === 'all' ? 'All' : s} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag size={48} color="#b89e60" />
                <h3>No orders yet</h3>
                <p>Use Smart Order to place your first order</p>
                <button className={styles.bigBtn} style={{ maxWidth: 220, marginTop: 16 }} onClick={() => setTab('smart-order')}>Smart Order →</button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} color="#b89e60" />
                <h3>No matching orders</h3>
                <p>Try a different search or filter</p>
              </div>
            ) : (
              <div className={styles.orderList}>
                {filteredOrders.map(o => (
                  <div key={o._id} className={styles.orderCard}>
                    <div className={styles.orderLeft}>
                      <div className={styles.orderIcon}><ShoppingBag size={24} color="#b89e60" /></div>
                      <div>
                        <p className={styles.orderName}>{o.foodItem}</p>
                        <p className={styles.orderMeta}>{o.cuisine} · {o.deliveryPlace} · {o.deliveryTime}</p>
                        <p className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                      </div>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.statusPill} style={{ background: statusColor[o.status]+'22', color: statusColor[o.status] }}>{o.status}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => toggleFavorite(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Toggle favorite">
                          <Heart size={16} color={favorites.includes(o.foodItem) ? '#e91e63' : 'var(--muted)'} fill={favorites.includes(o.foodItem) ? '#e91e63' : 'none'} />
                        </button>
                        {o.status === 'Completed' && (
                          <button className={styles.addBtn} onClick={() => handleReorder(o)} style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--gold)' }}>Reorder</button>
                        )}
                        {o.status === 'Pending' && (
                          <button className={styles.cancelBtn} onClick={() => cancelOrder(o._id)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MY RESERVATIONS ── */}
        {tab === 'reservations' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ClipboardList /> My Reservations</h2>
            {reservations.length === 0 ? (
              <div className={styles.emptyState}>
                <CalendarDays size={48} color="#b89e60" />
                <h3>No reservations yet</h3>
                <button className={styles.bigBtn} style={{ maxWidth: 220, marginTop: 16 }} onClick={() => setTab('smart-reserve')}>Reserve a Table →</button>
              </div>
            ) : (
              <div className={styles.resvList}>
                {reservations.map(r => (
                  <div key={r._id} className={`${styles.resvCard} ${r.status === 'cancelled' ? styles.resvCancelled : ''}`}>
                    <div className={styles.resvHead}>
                      <div>
                        <h4>Table #{r.tableNumber} · {r.numGuests} guests</h4>
                        <p>{r.guestName}</p>
                      </div>
                      <span className={styles.statusPill} style={{ background: r.status === 'active' ? '#27ae6022' : '#e74c3c22', color: r.status === 'active' ? '#27ae60' : '#e74c3c' }}>
                        {r.status === 'active' ? '✅ Active' : '❌ Cancelled'}
                      </span>
                    </div>
                    <div className={styles.resvDetails}>
                      <span><CalendarDays size={14} /> {r.reservationDate}</span>
                      <span><Clock size={14} /> {r.reservationTime}</span>
                      {r.preOrderedItems?.length > 0 && <span><ShoppingBag size={14} /> {r.preOrderedItems.join(', ')}</span>}
                    </div>
                    {r.status === 'active' && (
                      <button className={styles.cancelBtn} onClick={() => cancelReservation(r._id)}>Cancel Reservation</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MY BILLS ── */}
        {tab === 'bills' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Receipt /> My Bills</h2>
            {stats.pendingBills > 0 && (
              <div className={styles.billAlert}>
                ⚠️ You have <strong>{stats.pendingBills}</strong> unpaid bill{stats.pendingBills > 1 ? 's' : ''} totalling <strong>₹{stats.totalBillAmount}</strong>. Please pay at the counter.
              </div>
            )}
            {bills.length === 0 ? (
              <div className={styles.emptyState}>
                <p>🧾</p>
                <h3>No bills yet</h3>
                <p>Bills appear here after admin generates them for your orders</p>
              </div>
            ) : (
              <div className={styles.billList}>
                {bills.map(b => (
                  <div key={b._id} className={`${styles.billCard} ${b.status === 'pending' ? styles.billPending : styles.billPaid}`}>
                    <div className={styles.billHead}>
                      <div>
                        <h4>Bill #{b._id.slice(-6).toUpperCase()}</h4>
                        <p className={styles.billDate}>{new Date(b.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                      </div>
                      <span className={`${styles.billStatus} ${b.status === 'paid' ? styles.billStatusPaid : styles.billStatusPending}`}>
                        {b.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className={styles.billItems}>
                      {b.orders.map((o, i) => (
                        <div key={i} className={styles.billItem}>
                          <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShoppingBag size={14} /> {o.foodItem}</span>
                          <span>₹{o.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.billFooter}>
                      <div className={styles.billRow}><span>Subtotal</span><span>₹{b.subtotal}</span></div>
                      <div className={styles.billRow}><span>Tax (10%)</span><span>₹{b.tax}</span></div>
                      <div className={`${styles.billRow} ${styles.billTotal}`}><span>Total</span><span>₹{b.total}</span></div>
                      {b.status === 'paid' && b.paidAt && (
                        <p className={styles.paidAt}>Paid on {new Date(b.paidAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {tab === 'feedback' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><MessageSquare /> Leave Feedback</h2>
            <p className={styles.pageSub}>Your feedback helps us serve you better</p>
            <form onSubmit={submitFeedback} className={styles.fbForm}>
              <div className={styles.ratingRow}>
                <label>Your Rating</label>
                <div className={styles.stars}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" className={`${styles.star} ${fbRating >= s ? styles.starOn : ''}`}
                      onClick={() => setFbRating(s)}>★</button>
                  ))}
                  <span className={styles.ratingVal}>{fbRating}/5</span>
                </div>
              </div>
              <textarea
                className={styles.fbTextarea}
                placeholder="Tell us about your experience — food quality, service, delivery time..."
                rows={5}
                required
                value={fbMsg}
                onChange={e => setFbMsg(e.target.value)}
              />
              <button type="submit" className={styles.bigBtn}>Submit Feedback</button>
            </form>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div>
            <h2 className={styles.pageTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><User /> My Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              {/* Account Info Card */}
              <div className={styles.fbForm} style={{ maxWidth: '100%' }}>
                <h3 style={{ color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><User size={20} /> Account Information</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #d4b87a, #b89e60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#000' }}>
                    {username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{username}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Customer Account</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Total Orders', val: orders.length, icon: <ShoppingBag size={16} /> },
                    { label: 'Reservations', val: reservations.length, icon: <CalendarDays size={16} /> },
                    { label: 'Total Spent', val: `₹${stats.totalSpent}`, icon: <TrendingUp size={16} /> },
                    { label: 'Pending Bills', val: stats.pendingBills, icon: <Receipt size={16} /> },
                  ].map(s => (
                    <div key={s.label} style={{ padding: 14, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ color: 'var(--gold)', marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{s.val}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button onClick={exportOrdersCSV} className={styles.bigBtn} style={{ fontSize: '0.85rem', padding: '10px 16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} /> Export Data</button>
                  <button onClick={handleLogout} className={styles.cancelBtn} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px' }}><LogOut size={14} /> Log Out</button>
                </div>
              </div>

              {/* Favorites & Activity */}
              <div>
                {/* Favorites */}
                <div className={styles.fbForm} style={{ maxWidth: '100%', marginBottom: 20 }}>
                  <h3 style={{ color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={20} color="#e91e63" /> Favorite Dishes ({favorites.length})</h3>
                  {favorites.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No favorites yet. Click the ❤️ icon on any order to save it as a favorite.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {favorites.map(f => (
                        <span key={f} style={{ padding: '6px 14px', background: 'rgba(233,30,99,0.08)', border: '1px solid rgba(233,30,99,0.2)', borderRadius: 20, fontSize: '0.82rem', color: '#e91e63', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                          onClick={() => toggleFavorite(f)}>
                          {f} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className={styles.fbForm} style={{ maxWidth: '100%' }}>
                  <h3 style={{ color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} /> Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...orders.slice(0, 3).map(o => ({ type: 'order', text: `Ordered ${o.foodItem}`, status: o.status, date: o.createdAt })),
                      ...reservations.slice(0, 2).map(r => ({ type: 'reservation', text: `Reserved Table #${r.tableNumber}`, status: r.status, date: r.createdAt }))
                    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        {a.type === 'order' ? <ShoppingBag size={16} color="var(--gold)" /> : <CalendarDays size={16} color="#9b59b6" />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>{a.text}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={styles.statusPill} style={{ background: (statusColor[a.status] || '#27ae60') + '22', color: statusColor[a.status] || '#27ae60', fontSize: '0.7rem' }}>{a.status}</span>
                      </div>
                    ))}
                    {orders.length === 0 && reservations.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No recent activity</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

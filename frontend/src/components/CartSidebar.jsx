import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, MapPin, Clock, CreditCard, Gift, Plus, Minus, Tag, Zap, ChevronRight, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api';
import styles from './CartSidebar.module.css';

export default function CartSidebar({ open, onClose }) {
  const { cart, updateQty, removeFromCart, clearCart, total, count } = useCart();
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState('delivery');
  const [time, setTime] = useState('');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = () => {
    if (promo.toUpperCase() === 'WELCOME50') { setDiscount(50); setMsg(''); }
    else if (promo.toUpperCase() === 'FOOD10') { setDiscount(Math.floor(total * 0.1)); setMsg(''); }
    else { setDiscount(0); setMsg('Invalid Promo Code'); }
  };

  const finalTotal = Math.max(0, total - discount) + tip;
  const progress = Math.min(100, (total / 1000) * 100);

  const placeOrder = async () => {
    if (!localStorage.getItem('token')) { onClose(); navigate('/login'); return; }
    if (orderType === 'delivery' && !address.trim()) return setMsg('Please enter delivery address');
    if (!time) return setMsg('Please select a time');
    setPlacing(true);
    try {
      await Promise.all(cart.map(item =>
        API.post('/orders', {
          foodId: item.id,
          foodItem: item.name,
          cuisine: item.cuisine,
          price: item.price,
          quantity: item.quantity,
          orderType,
          deliveryPlace: orderType === 'dine-in' ? 'Dine In' : orderType === 'takeaway' ? 'Takeaway' : address,
          deliveryTime: time,
          imgUrl: item.img,
        })
      ));
      clearCart();
      onClose();
      navigate('/dashboard');
    } catch { setMsg('Order failed'); }
    setPlacing(false);
  };

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} />
      <div className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className={styles.iconCircle}><ShoppingBag size={20} /></div>
            <div>
              <h2>Your Order</h2>
              <p className={styles.headerSub}>{count} Items Selected</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyImg}>🥡</div>
            <h3>Empty Palate</h3>
            <p>Your culinary journey starts when you add something delicious from our menu!</p>
            <button className={styles.emptyBtn} onClick={onClose}>Explore Cuisines</button>
          </div>
        ) : (
          <>
            <div className={styles.mainScroll}>
              <div className={styles.promoIndicator}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Free Delivery Goal</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>₹{total} / ₹1000</span>
                </div>
                <div className={styles.progBar}><div className={styles.progFill} style={{ width: `${progress}%` }} /></div>
                <p style={{ fontSize: '0.65rem', marginTop: 6, color: 'var(--muted)' }}>
                  {total < 1000 ? `Add ₹${1000 - total} more for free delivery!` : '🎉 Enjoy Free Premium Delivery!'}
                </p>
              </div>

              <div className={styles.itemsList}>
                {cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.img} alt={item.name} className={styles.itemImg} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                      <div className={item.isVeg ? styles.vegDot : styles.nonVegDot} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{item.name}</h4>
                      <p>₹{item.price} × {item.quantity}</p>
                      <div className={styles.qtyPanel}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className={styles.qtyInBtn}><Minus size={12} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className={styles.qtyInBtn}><Plus size={12} /></button>
                      </div>
                    </div>
                    <button className={styles.trash} onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              <div className={styles.orderConfig}>
                <div className={styles.configHeader}>
                  <Zap size={14} className={styles.gold} /> <span>Delivery Preferences</span>
                </div>
                <div className={styles.typeSelector}>
                  {['delivery', 'dine-in', 'takeaway'].map(t => (
                    <button key={t} onClick={() => setOrderType(t)} className={`${styles.typeCard} ${orderType === t ? styles.typeActive : ''}`}>
                      <span style={{ fontSize: '1.1rem', marginBottom: 4 }}>{t === 'delivery' ? '🚴' : t === 'dine-in' ? '🍽️' : '🥡'}</span>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {orderType === 'delivery' && (
                  <div className={styles.inputWrap}>
                    <MapPin size={16} className={styles.inputIcon} />
                    <input placeholder="Search locality or flat no..." value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                )}
                <div className={styles.inputWrap}>
                  <Clock size={16} className={styles.inputIcon} />
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              <div className={styles.extrasSection}>
                <div className={styles.configHeader}><Gift size={14} className={styles.gold} /> <span>Support & Offers</span></div>
                <div className={styles.tipGrid}>
                  {[0, 20, 50, 100].map(amt => (
                    <button key={amt} onClick={() => setTip(amt)} className={`${styles.tipCircle} ${tip === amt ? styles.tipActive : ''}`}>
                      {amt === 0 ? 'None' : `₹${amt}`}
                    </button>
                  ))}
                </div>
                <div className={styles.promoWrap}>
                  <Tag size={16} className={styles.promoIcon} />
                  <input placeholder="Promo code (FOOD10)" value={promo} onChange={e => setPromo(e.target.value)} />
                  <button onClick={handleApplyPromo}>Apply</button>
                </div>
                {msg && <p className={styles.msgAlert}>{msg}</p>}
              </div>
            </div>

            <div className={styles.footerFooter}>
              <div className={styles.billSplit}>
                <div className={styles.billRow}><span>Items Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className={styles.billRow}><span>Packaging & Delivery</span><span style={{ color: total >= 1000 ? '#27ae60' : 'inherit' }}>{total >= 1000 ? 'FREE' : '₹40'}</span></div>
                {discount > 0 && <div className={styles.billRow} style={{ color: '#27ae60' }}><span>Promo Discount</span><span>-₹{discount}</span></div>}
                {tip > 0 && <div className={styles.billRow}><span>Service Tip</span><span>₹{tip}</span></div>}
                <div className={styles.billTotal}><span>Grand Total</span><span>₹{(finalTotal + (total >= 1000 ? 0 : 40)).toLocaleString()}</span></div>
              </div>
              <button className={styles.primaryBtn} onClick={placeOrder} disabled={placing}>
                {placing ? 'Authorizing Payment...' : <>Proceed to Checkout <ChevronRight size={18} /></>}
              </button>
              <button className={styles.clearMini} onClick={clearCart}>Reset Cart</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ShoppingBag, Trash2, MapPin, Clock, Gift,
  Plus, Minus, Tag, Zap, ChevronRight, Lock,
  CreditCard, Smartphone, Check, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../api';
import styles from './CartSidebar.module.css';

const PAYMENT_METHODS = [
  { id: 'razorpay',  label: 'Razorpay',   color: '#2D68F0', bg: '#2D68F015', emoji: '💳', desc: 'Credit / Debit Card' },
  { id: 'paytm',    label: 'Paytm',       color: '#00B9F1', bg: '#00B9F115', emoji: '🔵', desc: 'Paytm Wallet / UPI' },
  { id: 'phonepe',  label: 'PhonePe',     color: '#5F259F', bg: '#5F259F15', emoji: '📲', desc: 'PhonePe UPI / Wallet' },
  { id: 'googlepay',label: 'Google Pay',  color: '#4285F4', bg: '#4285F415', emoji: '🔷', desc: 'Google Pay UPI' },
  { id: 'upi',      label: 'Other UPI',   color: '#00875A', bg: '#00875A15', emoji: '💸', desc: 'Any UPI App' },
  { id: 'cash',     label: 'Pay at Counter', color: '#b89e60', bg: '#b89e6015', emoji: '💵', desc: 'Cash / Card at pickup' },
];

const PROMO_CODES = {
  'WELCOME50': { discount: 50, label: '₹50 flat off' },
  'FOOD10':    { getDiscount: (total) => Math.floor(total * 0.1), label: '10% off' },
  'FIRST100':  { discount: 100, label: '₹100 flat off' },
};

export default function CartSidebar({ open, onClose }) {
  const { cart, updateQty, removeFromCart, clearCart, total, count } = useCart();
  const [step, setStep] = useState('cart'); // cart → payment → processing → success
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState('delivery');
  const [time, setTime] = useState('');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState('');
  const [tip, setTip] = useState(0);
  const [payMethod, setPayMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [msg, setMsg] = useState('');
  const [qrData, setQrData] = useState(null);
  const [placedBillId, setPlacedBillId] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const deliveryFee = total >= 1000 ? 0 : 40;
  const finalTotal = Math.max(0, total - discount) + tip + deliveryFee;
  const progress = Math.min(100, (total / 1000) * 100);

  const handleApplyPromo = () => {
    const code = promo.toUpperCase().trim();
    if (PROMO_CODES[code]) {
      const p = PROMO_CODES[code];
      const d = p.discount ?? p.getDiscount(total);
      setDiscount(d);
      setPromoLabel(`✅ ${p.label} applied!`);
      setMsg('');
    } else {
      setDiscount(0);
      setPromoLabel('');
      setMsg('❌ Invalid promo code. Try WELCOME50 or FOOD10');
    }
  };

  const handleProceedToPayment = async () => {
    if (!localStorage.getItem('token')) { onClose(); navigate('/login'); return; }
    if (orderType === 'delivery' && !address.trim()) return setMsg('Please enter delivery address');
    if (!time) return setMsg('Please select a time');
    setMsg('');

    try {
      // Place the order first
      const { data } = await API.post('/orders', {
        items: cart.map(item => ({
          foodItem: item.name,
          cuisine: item.cuisine || 'Indian',
          price: item.price,
          quantity: item.quantity,
          imgUrl: item.img
        })),
        orderType,
        deliveryPlace: orderType === 'dine-in' ? 'Dine In' : orderType === 'takeaway' ? 'Takeaway' : address,
        deliveryTime: time,
      });
      setPlacedBillId(data.bill._id);
      setStep('payment');
    } catch {
      setMsg('Failed to place order. Please try again.');
    }
  };

  const handleInitiatePayment = async () => {
    if (!payMethod) return setMsg('Please select a payment method');
    setMsg('');
    try {
      const { data } = await API.post('/payments/initiate', {
        billId: placedBillId,
        method: payMethod,
        upiId: upiId || undefined,
      });
      setQrData(data);
      setStep('processing');
      // Auto-verify after 2.5s (simulated)
      setTimeout(() => handleVerifyPayment(), 2500);
    } catch {
      setMsg('Payment initiation failed. Try again.');
    }
  };

  const handleVerifyPayment = async () => {
    try {
      const { data } = await API.post('/payments/verify', {
        billId: placedBillId,
        method: payMethod,
      });
      setSuccessData(data);
      clearCart();
      setStep('success');
    } catch {
      setMsg('Payment verification failed.');
      setStep('payment');
    }
  };

  const handleClose = () => {
    setStep('cart');
    setMsg('');
    setQrData(null);
    setPlacedBillId(null);
    setSuccessData(null);
    setPayMethod('');
    onClose();
  };

  const goToDashboard = () => {
    handleClose();
    navigate('/dashboard');
  };

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={step === 'cart' ? handleClose : undefined} />
      <div className={`${styles.sidebar} ${open ? styles.open : ''}`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className={styles.iconCircle}>
              {step === 'cart' ? <ShoppingBag size={20} /> : step === 'payment' ? <CreditCard size={20} /> : step === 'success' ? <Check size={20} /> : <Zap size={20} />}
            </div>
            <div>
              <h2>{step === 'cart' ? 'Your Order' : step === 'payment' ? 'Payment' : step === 'processing' ? 'Processing...' : 'Order Placed!'}</h2>
              <p className={styles.headerSub}>
                {step === 'cart' ? `${count} Items Selected` : step === 'payment' ? 'Choose payment method' : step === 'processing' ? 'Please wait...' : 'Order confirmed ✅'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'cart' && cart.length > 0 && (
              <button className={styles.clearMini} onClick={clearCart}><Trash2 size={14} /> Clear</button>
            )}
            {(step === 'cart' || step === 'success') && (
              <button className={styles.closeBtn} onClick={handleClose}><X size={20} /></button>
            )}
          </div>
        </div>

        {/* ── Empty Cart ── */}
        {step === 'cart' && cart.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyImg}>🥡</div>
            <h3>Empty Palate</h3>
            <p>Add delicious dishes from our menu to get started!</p>
            <button className={styles.emptyBtn} onClick={handleClose}>Explore Menu</button>
          </div>
        )}

        {/* ── STEP: CART ── */}
        {step === 'cart' && cart.length > 0 && (
          <>
            <div className={styles.mainScroll}>
              {/* Free delivery progress */}
              <div className={styles.promoIndicator}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>🚀 Free Delivery Goal</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>₹{total} / ₹1000</span>
                </div>
                <div className={styles.progBar}><div className={styles.progFill} style={{ width: `${progress}%` }} /></div>
                <p style={{ fontSize: '0.65rem', marginTop: 6, color: 'var(--muted)' }}>
                  {total < 1000 ? `Add ₹${1000 - total} more for free delivery!` : '🎉 Free Premium Delivery unlocked!'}
                </p>
              </div>

              {/* Items */}
              <div className={styles.itemsList}>
                {cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={item.img} alt={item.name} className={styles.itemImg}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                      <div className={item.isVeg ? styles.vegDot : styles.nonVegDot} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{item.name}</h4>
                      <p>₹{item.price} × {item.quantity} = <strong style={{ color: 'var(--gold)' }}>₹{item.price * item.quantity}</strong></p>
                      {item.weight && <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>⚖️ {item.weight}</div>}
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

              {/* Order Config */}
              <div className={styles.orderConfig}>
                <div className={styles.configHeader}><Zap size={14} className={styles.gold} /> <span>Delivery Preferences</span></div>
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

              {/* Promo & Tips */}
              <div className={styles.extrasSection}>
                <div className={styles.configHeader}><Gift size={14} className={styles.gold} /> <span>Offers & Tips</span></div>
                <div className={styles.tipGrid}>
                  {[0, 20, 50, 100].map(amt => (
                    <button key={amt} onClick={() => setTip(amt)} className={`${styles.tipCircle} ${tip === amt ? styles.tipActive : ''}`}>
                      {amt === 0 ? 'No Tip' : `₹${amt}`}
                    </button>
                  ))}
                </div>
                <div className={styles.promoWrap}>
                  <Tag size={16} className={styles.promoIcon} />
                  <input placeholder="Promo code (WELCOME50, FOOD10)" value={promo} onChange={e => setPromo(e.target.value)} />
                  <button onClick={handleApplyPromo}>Apply</button>
                </div>
                {promoLabel && <p style={{ color: '#27ae60', fontSize: '0.75rem', marginTop: 4 }}>{promoLabel}</p>}
                {msg && <p className={styles.msgAlert}><AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />{msg}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footerFooter}>
              <div className={styles.billSplit}>
                <div className={styles.billRow}><span>Items Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className={styles.billRow}>
                  <span>Delivery Fee</span>
                  <span style={{ color: deliveryFee === 0 ? '#27ae60' : 'inherit' }}>{deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}</span>
                </div>
                {discount > 0 && <div className={styles.billRow} style={{ color: '#27ae60' }}><span>Promo Discount</span><span>-₹{discount}</span></div>}
                {tip > 0 && <div className={styles.billRow}><span>Tip 🙏</span><span>₹{tip}</span></div>}
                <div className={styles.billTotal}><span>Grand Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
              </div>
              <button className={styles.primaryBtn} onClick={handleProceedToPayment}>
                Proceed to Pay ₹{finalTotal} <ChevronRight size={18} />
              </button>
              <div className={styles.secureCheckout}><Lock size={12} /> Secure SSL Encrypted Checkout</div>
            </div>
          </>
        )}

        {/* ── STEP: PAYMENT ── */}
        {step === 'payment' && (
          <div className={styles.mainScroll}>
            <div className={styles.paymentSection}>
              <div className={styles.paymentAmount}>
                <div className={styles.payAmtLabel}>Amount to Pay</div>
                <div className={styles.payAmtVal}>₹{finalTotal.toLocaleString()}</div>
              </div>

              <h3 className={styles.payMethodTitle}>Choose Payment Method</h3>
              <div className={styles.payMethodGrid}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className={`${styles.payMethodCard} ${payMethod === m.id ? styles.payMethodActive : ''}`}
                    style={{ '--pm-color': m.color, '--pm-bg': m.bg }}>
                    <span className={styles.payMethodEmoji}>{m.emoji}</span>
                    <div>
                      <div className={styles.payMethodLabel}>{m.label}</div>
                      <div className={styles.payMethodDesc}>{m.desc}</div>
                    </div>
                    {payMethod === m.id && <Check size={16} className={styles.payMethodCheck} />}
                  </button>
                ))}
              </div>

              {payMethod && payMethod !== 'cash' && payMethod !== 'razorpay' && (
                <div className={styles.upiInput}>
                  <div className={styles.inputWrap}>
                    <Smartphone size={16} className={styles.inputIcon} />
                    <input placeholder={`Enter ${PAYMENT_METHODS.find(m => m.id === payMethod)?.label} UPI ID (optional)`}
                      value={upiId} onChange={e => setUpiId(e.target.value)} />
                  </div>
                </div>
              )}

              {msg && <p className={styles.msgAlert}><AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />{msg}</p>}

              <button className={styles.primaryBtn} style={{ marginTop: 24 }} onClick={handleInitiatePayment} disabled={!payMethod}>
                {payMethod === 'cash' ? '✅ Confirm Order' : `Pay ₹${finalTotal} via ${PAYMENT_METHODS.find(m => m.id === payMethod)?.label || '...'}`}
              </button>
              <button className={styles.backBtn} onClick={() => { setStep('cart'); setMsg(''); }}>← Back to Cart</button>
            </div>
          </div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'processing' && (
          <div className={styles.processingScreen}>
            <div className={styles.processingAnim}>
              {qrData?.qrCode ? (
                <>
                  <img src={qrData.qrCode} alt="Payment QR" className={styles.qrCode} />
                  <p className={styles.processingMsg}>Scan to pay ₹{finalTotal}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
                    {qrData.message}
                  </p>
                  <div className={styles.processingLoaderRow}>
                    <div className={styles.processingDot} style={{ '--delay': '0s' }} />
                    <div className={styles.processingDot} style={{ '--delay': '0.2s' }} />
                    <div className={styles.processingDot} style={{ '--delay': '0.4s' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>Verifying payment...</p>
                </>
              ) : (
                <>
                  <div className={styles.processingSpinner} />
                  <p className={styles.processingMsg}>{qrData?.message || 'Processing payment...'}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && successData && (
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Order Confirmed!</h2>
            <p className={styles.successSub}>Your payment was successful</p>
            <div className={styles.successCard}>
              <div className={styles.successRow}><span>Amount Paid</span><strong>₹{successData.amount}</strong></div>
              <div className={styles.successRow}><span>Method</span><strong>{PAYMENT_METHODS.find(m => m.id === successData.method)?.label || successData.method}</strong></div>
              <div className={styles.successRow}><span>Transaction ID</span><strong style={{ fontSize: '0.75rem' }}>{successData.transactionId}</strong></div>
              <div className={styles.successRow}><span>Time</span><strong>{new Date(successData.paidAt).toLocaleTimeString('en-IN')}</strong></div>
            </div>
            <button className={styles.primaryBtn} style={{ maxWidth: 280, margin: '0 auto' }} onClick={goToDashboard}>
              View Order Tracking →
            </button>
            <button className={styles.backBtn} onClick={handleClose}>Continue Shopping</button>
          </div>
        )}

      </div>
    </>
  );
}

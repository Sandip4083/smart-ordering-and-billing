import { Link } from 'react-router-dom';
import {
  Zap, CalendarCheck, Receipt, Bell, Globe, ShieldCheck,
  Search, ShoppingCart, CheckCircle, Cog, Code, Star,
  ArrowRight, Database, Server, Cpu, Users, Heart, Award
} from 'lucide-react';
import styles from './About.module.css';

const STATS = [
  { val: '99+', label: 'Indian Dishes', icon: '🍛' },
  { val: '10', label: 'Categories', icon: '🗂️' },
  { val: '24/7', label: 'Online Access', icon: '⚡' },
  { val: '100%', label: 'Digital Billing', icon: '🧾' },
];

const FEATURES = [
  { icon: <Zap size={24} />, title: 'Smart Cart System', desc: 'Multi-item ordering like Swiggy & Zomato. Add dishes, adjust quantity, apply promos — all in real-time.', color: '#b89e60' },
  { icon: <CalendarCheck size={24} />, title: 'Table Reservation', desc: 'Book your table in advance with guest count, occasion tagging, and pre-ordered meals ready on arrival.', color: '#3498db' },
  { icon: <Receipt size={24} />, title: 'Digital Auto-Billing', desc: 'One-click bill generation. Itemized breakdown, 10% tax, payment method tracking — receipts printable instantly.', color: '#27ae60' },
  { icon: <Bell size={24} />, title: 'Real-Time Notifications', desc: 'Admin receives instant alerts for every order & reservation. Zero missed orders, zero forgotten tables.', color: '#e74c3c' },
  { icon: <Globe size={24} />, title: '6 Payment Methods', desc: 'Razorpay, Paytm, PhonePe, Google Pay, UPI, and Cash on Delivery — full payment simulation built-in.', color: '#9b59b6' },
  { icon: <ShieldCheck size={24} />, title: 'Secure Role-Based Access', desc: 'bcrypt passwords, JWT sessions, separate customer and admin portals — enterprise-grade security.', color: '#1abc9c' },
];

const TECH = [
  { icon: <Code size={20} />, label: 'React 18 + Vite', cat: 'Frontend', color: '#61dafb' },
  { icon: <Database size={20} />, label: 'MongoDB + Mongoose', cat: 'Database', color: '#4db33d' },
  { icon: <Server size={20} />, label: 'Node.js + Express', cat: 'Backend', color: '#68a063' },
  { icon: <Cpu size={20} />, label: 'JWT Authentication', cat: 'Security', color: '#e74c3c' },
  { icon: <Globe size={20} />, label: 'Recharts', cat: 'Analytics', color: '#8884d8' },
  { icon: <Zap size={20} />, label: 'Framer Motion', cat: 'Animation', color: '#f39c12' },
];

const STEPS = [
  { step: '01', title: 'Browse by Region or State', desc: 'Explore 99+ authentic dishes with real food images, spice levels, calorie info and allergen warnings.', icon: <Search size={28} />, color: '#b89e60' },
  { step: '02', title: 'Add to Cart & Customize', desc: 'Select multiple dishes, adjust quantities, apply promo codes and chef tips.', icon: <ShoppingCart size={28} />, color: '#3498db' },
  { step: '03', title: 'Reserve Table (Optional)', desc: 'Book your spot and pre-order food so it\'s hot and ready the moment you arrive.', icon: <CalendarCheck size={28} />, color: '#27ae60' },
  { step: '04', title: 'Choose Payment Method', desc: 'Pay via Razorpay, Paytm, PhonePe, Google Pay, UPI or Cash. Instant QR generation.', icon: <Receipt size={28} />, color: '#9b59b6' },
  { step: '05', title: 'Admin Processes & Bills', desc: 'Admin receives an instant notification, updates status, and the digital bill is auto-generated.', icon: <Cog size={28} />, color: '#e74c3c' },
  { step: '06', title: 'Track & Enjoy', desc: 'Watch your order progress through Pending → In Progress → Completed in real-time.', icon: <CheckCircle size={28} />, color: '#1abc9c' },
];

export default function About() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <span className={styles.heroBadge}>🍽️ Smart Order & Billing Portal</span>
        <h1>One Platform.<br /><span className={styles.gold}>Every Flavor.</span></h1>
        <p>We combined the best of Swiggy, Zomato, and hotel booking — into a single premium restaurant management portal built with MERN stack.</p>
        <div className={styles.heroBtns}>
          <Link to="/menu"><button className={styles.primaryBtn}>Explore Menu <ArrowRight size={16} /></button></Link>
          <Link to="/login"><button className={styles.outlineBtn}>Get Started</button></Link>
        </div>
        <div className={styles.statsBar}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}>{s.icon}</span>
              <strong>{s.val}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Our Mission</div>
        <h2 className={styles.sectionTitle}>Why We Built This</h2>
        <div className={styles.missionGrid}>
          <div className={styles.missionText}>
            <p>Most restaurants juggle <strong>4–5 different tools</strong> for orders, reservations, billing, and feedback. We built a single platform where every part works seamlessly together — from the moment a customer browsing the menu to the instant the bill is printed.</p>
            <p style={{ marginTop: 16 }}>Every dish in our catalog is <strong>uniquely mapped to a high-quality image</strong> — no duplicates, no placeholders. Authentic Indian cuisine, priced realistically, with full nutritional information.</p>
          </div>
          <div className={styles.missionFeatures}>
            {[
              { icon: '✅', text: 'Unified customer + admin portal' },
              { icon: '✅', text: 'Auto bill generation on every order' },
              { icon: '✅', text: '6 payment methods including UPI & QR' },
              { icon: '✅', text: 'Real-time order status tracking' },
              { icon: '✅', text: 'Full analytics dashboard with live charts' },
              { icon: '✅', text: 'User management with data insights' },
            ].map(f => (
              <div key={f.text} className={styles.missionItem}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>What Makes Us Different</h2>
        <div className={styles.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featCard} style={{ '--accent': f.color }}>
              <div className={styles.featIcon} style={{ color: f.color, background: f.color + '15' }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Process</div>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s, i) => (
            <div key={s.step} className={styles.step} style={{ '--accent': s.color }}>
              <div className={styles.stepNum} style={{ color: s.color }}>{s.step}</div>
              <div className={styles.stepIcon} style={{ color: s.color, background: s.color + '15' }}>
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionLabel}>Tech Stack</div>
        <h2 className={styles.sectionTitle}>Built With Modern Tools</h2>
        <div className={styles.techGrid}>
          {TECH.map(t => (
            <div key={t.label} className={styles.techCard} style={{ '--tc': t.color }}>
              <div className={styles.techIcon} style={{ color: t.color }}>
                {t.icon}
              </div>
              <div>
                <div className={styles.techLabel}>{t.label}</div>
                <div className={styles.techCat}>{t.cat}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Builder ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Team</div>
        <h2 className={styles.sectionTitle}>Built By</h2>
        <div className={styles.builderCard}>
          <div className={styles.builderAvatar}>S</div>
          <div>
            <h3>Sandip</h3>
            <span className={styles.builderRole}>Full Stack Developer</span>
            <p>Built the complete MERN stack application — from MongoDB schema design and REST APIs to premium React UI with glassmorphism, Recharts analytics, and multi-payment integration.</p>
            <div className={styles.builderTags}>
              {['React', 'Node.js', 'MongoDB', 'Express', 'JWT', 'Recharts'].map(t => (
                <span key={t} className={styles.builderTag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <Heart size={40} style={{ color: '#e74c3c', marginBottom: 16 }} />
        <h2>Ready to Experience It?</h2>
        <p>Browse our authentic Indian menu and place your first order in under 60 seconds.</p>
        <div className={styles.heroBtns}>
          <Link to="/menu"><button className={styles.primaryBtn} style={{ fontSize: '1rem', padding: '15px 36px' }}>View Menu <ArrowRight size={18} /></button></Link>
          <Link to="/admin/login"><button className={styles.outlineBtn} style={{ padding: '15px 36px' }}>Admin Portal</button></Link>
        </div>
      </section>
    </div>
  );
}

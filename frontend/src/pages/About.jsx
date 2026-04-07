import { Link } from 'react-router-dom';
import { Zap, CalendarCheck, Receipt, Bell, Globe, ShieldCheck, Search, ShoppingCart, CheckCircle, Cog, Code, Star, Users, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './About.module.css';

const STATS = [
  { val: '300+', label: 'Menu Items' },
  { val: '14', label: 'World Cuisines' },
  { val: '24/7', label: 'Online Access' },
  { val: '100%', label: 'Digital Billing' },
];

const FEATURES = [
  { icon: <Zap size={28} />, title: 'Smart Ordering', desc: 'Select multiple dishes across any world cuisine and place them all in a single click — like Swiggy, but smarter.' },
  { icon: <CalendarCheck size={28} />, title: 'Table Reservation', desc: 'Book your table in advance. Pre-order your food so it\'s ready the moment you arrive.' },
  { icon: <Receipt size={28} />, title: 'Digital Billing', desc: 'Transparent itemized bills with 10% tax. Admin generates, you track — fully digital.' },
  { icon: <Bell size={28} />, title: 'Real-Time Alerts', desc: 'Instant admin notifications for every order and reservation — no missed orders, ever.' },
  { icon: <Globe size={28} />, title: 'World Cuisines', desc: 'Authentic dishes from 14 world cuisines — real food, real flavors, auto-priced like Zomato.' },
  { icon: <ShieldCheck size={28} />, title: 'Role-Based Access', desc: 'Separate customer and admin portals. Customers order and reserve. Admins control everything.' },
];

const TEAM = [
  { name: 'Sandip', role: 'Full Stack Developer', emoji: <Code size={48} />, desc: 'Built the entire MERN stack application — from MongoDB schemas to modern React UI with glassmorphism design.' }
];

const STEPS = [
  { step: '01', title: 'Browse Menu', desc: 'Explore dishes from 14 world cuisines with authentic flavors and INR prices.', icon: <Search size={32} /> },
  { step: '02', title: 'Add to Cart', desc: 'Select your dishes, set quantity, choose delivery / dine-in / takeaway.', icon: <ShoppingCart size={32} /> },
  { step: '03', title: 'Reserve a Table', desc: 'Book your table and optionally pre-order food to be ready on arrival.', icon: <CalendarCheck size={32} /> },
  { step: '04', title: 'Admin Processes', desc: 'Admin receives instant notification, processes your order, generates bill.', icon: <Cog size={32} /> },
  { step: '05', title: 'Pay & Enjoy', desc: 'Pay at counter. View your digital bill on the dashboard. Leave a review.', icon: <CheckCircle size={32} /> },
];

export default function About() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroBadge}>About Us</span>
        <h1>One App. Food + Table.<br /><span className={styles.gold}>All in One.</span></h1>
        <p>We combined the best of Swiggy, Zomato, and hotel booking — into a single, seamless restaurant management portal.</p>
        <div className={styles.heroBtns}>
          <Link to="/menu"><button className={styles.primaryBtn}>Explore Menu <ArrowRight size={16} style={{ marginLeft: 4 }} /></button></Link>
          <Link to="/login"><button className={styles.outlineBtn}>Get Started</button></Link>
        </div>
      </div>

      {/* Video */}
      <section className={styles.section} style={{ paddingTop: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>See It In Action</h2>
        <div className={styles.videoSection}>
          <img
            src="/restu/image.png"
            alt="Restaurant Experience"
            style={{ width: '100%', display: 'block', backgroundColor: '#000', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Stats */}
      <div className={styles.statsBar}>
        {STATS.map(s => (
          <div key={s.label} className={styles.stat}>
            <strong>{s.val}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section className={styles.section}>
        <h2>Our Mission</h2>
        <p className={styles.missionText}>
          Most restaurants juggle 3–4 different tools: one for orders, one for reservations, one for billing, one for feedback.
          We built a single platform that handles <strong>everything</strong> — from the moment a customer browses the menu
          to the moment the bill is paid. Smart auto-pricing ensures every dish is priced realistically based on its cuisine category.
        </p>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h2>What Makes Us Different</h2>
        <div className={styles.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featCard}>
              <div className={styles.featIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2>How It Works</h2>
        <div className={styles.steps}>
          {STEPS.map(s => (
            <div key={s.step} className={styles.step}>
              <div className={styles.stepNum}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className={styles.section}>
        <h2>Built By</h2>
        <div className={styles.teamGrid}>
          {TEAM.map(m => (
            <div key={m.name} className={styles.teamCard}>
              <div className={styles.teamEmoji}>{m.emoji}</div>
              <h3>{m.name}</h3>
              <span className={styles.teamRole}>{m.role}</span>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to Order?</h2>
        <p>Browse our world menu and place your first order in seconds.</p>
        <Link to="/menu">
          <button className={styles.primaryBtn} style={{ fontSize: '1rem', padding: '15px 40px' }}>
            View Menu <ArrowRight size={18} style={{ marginLeft: 6 }} />
          </button>
        </Link>
      </section>
    </div>
  );
}

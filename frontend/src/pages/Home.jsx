import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CalendarCheck, Receipt, Bell, Globe, ShieldCheck, ArrowRight, Star, ChefHat, Clock, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import styles from './Home.module.css';

const FEATURES = [
  { Icon: Globe,        title: '300+ World Dishes',   desc: 'Authentic cuisines from 14 categories — real food photos, auto-priced per cuisine category.',   color: '#3498db' },
  { Icon: Zap,         title: 'Smart Ordering',       desc: 'Add multiple dishes to cart, choose delivery, dine-in or takeaway, order instantly.',    color: '#b89e60' },
  { Icon: CalendarCheck,title: 'Table Reservation',   desc: 'Pre-book your table and even pre-order food. We prepare it before you arrive.',           color: '#27ae60' },
  { Icon: Receipt,     title: 'Instant Digital Bill', desc: 'Auto-generated bill for every order. Full breakdown: subtotal, 10% tax, total.',          color: '#9b59b6' },
  { Icon: Bell,        title: 'Live Notifications',   desc: 'Admin gets instant alerts for every order & reservation. Zero missed events.',             color: '#e74c3c' },
  { Icon: ShieldCheck, title: 'Secure & Private',     desc: 'bcrypt-hashed passwords, JWT sessions, role-based access between customer & admin.',       color: '#1abc9c' },
];

const CUISINES = [
  { name: 'North Indian', flag: '🍛', img: '/gen_imgs/authentic/dal_makhani.png',  tag: 'Rich & Creamy' },
  { name: 'South Indian', flag: '🌴', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80',  tag: 'Crispy & Tangy' },
  { name: 'East Indian',  flag: '🌶️', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',        tag: 'Subtle & Sweet' },
  { name: 'West Indian',  flag: '🥥', img: 'https://images.unsplash.com/photo-1750767396956-da1796f33ad1?w=600&q=80',     tag: 'Spicy & Vibrant' },
  { name: 'Street Food',  flag: '🔥', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',       tag: 'Chatpata Joy' },
  { name: 'Desserts',     flag: '🍮', img: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&q=80',    tag: 'Sweet Endings' },
];

const STEPS = [
  { num: '01', icon: '🔍', title: 'Browse Menu',      desc: 'Explore 300+ authentic dishes with real photos and transparent INR pricing.' },
  { num: '02', icon: '🛒', title: 'Add to Cart',      desc: 'Pick multiple dishes, set quantity, choose delivery / dine-in / takeaway.' },
  { num: '03', icon: '📅', title: 'Reserve a Table',  desc: 'Book in advance. Pre-order food so it\'s hot when you arrive.' },
  { num: '04', icon: '✅', title: 'We Handle the Rest',desc: 'Admin processes, prepares your food, your digital bill is auto-generated.' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1742281258189-3b933879867a?w=600&q=80',
  '/gen_imgs/authentic/aloo_paratha.png',
  '/gen_imgs/authentic/tandoori_chicken.png',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  '/gen_imgs/authentic/paneer_tikka.png',
  '/gen_imgs/authentic/kashmiri_pulao.png',
];

const REVIEWS = [
  { name: 'Aarav M.',  rating: 5, text: 'Best digital dining experience! Ordered Butter Chicken and it arrived hot. The cart system is exactly like Swiggy.' },
  { name: 'Emily K.',  rating: 5, text: 'Reserved a table with pre-order. Food was ready when I arrived. Absolutely premium experience!' },
  { name: 'Raj S.',    rating: 5, text: 'Admin panel is super clean. The auto-generated bills make end-of-day accounting so easy.' },
];

export default function Home() {

  return (
    <div className={styles.page}>

      {/* ── HERO IMAGE & CONTENT ── */}
      <section className={styles.heroSection}>
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80" 
          alt="Restaurant Background" 
          className={styles.videoBg} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className={styles.videoOverlay}></div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <ChefHat size={13} />Smart Ordering Portal
          </div>
          <h1>Order Food. Book Tables.<br /><span className={styles.goldGrad}>All in One Place.</span></h1>
          <p className={styles.heroSubText}>300+ world dishes · instant cart · auto-billing · real-time admin alerts</p>
          
          <div className={styles.heroBtns}>
            <Link to="/menu"><button className={styles.btnGold}><Zap size={16} /> Explore Menu</button></Link>
            <Link to="/login"><button className={styles.btnGhost}>Get Started <ArrowRight size={15} /></button></Link>
          </div>
          
          <div className={styles.heroStats}>
            {[['300+','Dishes'],['14','Cuisines'],['24/7','Online'],['Auto','Billing']].map(([v,l]) => (
              <div key={l} className={styles.heroStat}>
                <strong>{v}</strong><span>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Scroll hint */}
        <div className={styles.scrollArrow}>
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ── SPECIAL OFFERS ── */}
      <section className={styles.offerBanner}>
        <div className={styles.offerCard}>
           <div className={styles.offerBadge}>LIMITED TIME</div>
           <h2>Get 50% OFF on your first order</h2>
           <p>Use code <span className={styles.promoCode}>WELCOME50</span> at checkout</p>
           <Link to="/menu" className={styles.offerLink}>Order Now <ArrowRight size={16}/></Link>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Why Us</div>
        <h2 className={styles.sectionTitle}>A smarter way to dine</h2>
        <p className={styles.sectionSub}>Everything Swiggy + Zomato + hotel booking — in one unified portal.</p>
        <div className={styles.featGrid}>
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div key={title} className={styles.featCard}>
              <div className={styles.featIconWrap} style={{ background: color + '18', color }}>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUISINE SHOWCASE ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionLabel}>Explore</div>
        <h2 className={styles.sectionTitle}>World Cuisines</h2>
        <p className={styles.sectionSub}>14 categories, 300+ authentic dishes from around the globe.</p>
        <div className={styles.cuisineGrid}>
          {CUISINES.map(c => (
            <Link to="/menu" key={c.name} className={styles.cuisineCard}>
              <img src={c.img} alt={c.name} className={styles.cuisineImg}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'; }} />
              <div className={styles.cuisineOverlay}>
                <span className={styles.cuisineFlag}>{c.flag}</span>
                <h3>{c.name}</h3>
                <p>{c.tag}</p>
                <span className={styles.cuisineBtn}>Order Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Process</div>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionLabel}>Gallery</div>
        <h2 className={styles.sectionTitle}>Inside Our Restaurant</h2>
        <div className={styles.galleryGrid}>
          {GALLERY.map((img, i) => (
            <div key={i} className={`${styles.galleryItem} ${i === 0 ? styles.galleryLarge : ''}`}>
              <img src={img} alt={`Restaurant ${i + 1}`}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600'; }} />
              <div className={styles.galleryOverlay} />
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Reviews</div>
        <h2 className={styles.sectionTitle}>What Guests Say</h2>
        <div className={styles.reviewGrid}>
          {REVIEWS.map(r => (
            <div key={r.name} className={styles.reviewCard}>
              <div className={styles.reviewStars}>
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="#b89e60" color="#b89e60" />)}
              </div>
              <p>"{r.text}"</p>
              <div className={styles.reviewAuthor}>
                <div className={styles.reviewAvatar}>{r.name[0]}</div>
                <strong>{r.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h2>Ready to Order?</h2>
          <p>Join hundreds of happy diners. Browse the menu and place your first order in under 60 seconds.</p>
          <div className={styles.heroBtns}>
            <Link to="/menu"><button className={styles.btnGold}><Zap size={16} /> Order Now</button></Link>
            <Link to="/about"><button className={styles.btnGhost}>Learn More <ArrowRight size={15} /></button></Link>
          </div>
        </div>
        <div className={styles.ctaDeco}><ChefHat size={120} /></div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h3 className={styles.footerLogo}><ChefHat size={20}/> Smart Order & Billing</h3>
            <p>Where world flavors meet digital convenience. Order, reserve, and pay — all online.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            {[['/', 'Home'], ['/menu', 'Menu'], ['/about', 'About'], ['/login', 'Customer Login'], ['/admin/login', 'Admin Login']].map(([to, label]) => (
              <Link key={label} to={to} className={styles.footerLink}>{label}</Link>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <p><MapPin size={13} style={{ marginRight: 6, display:'inline' }} />KIIT Road, Bhubaneswar</p>
            <p><Phone size={13} style={{ marginRight: 6, display:'inline' }} />+91 0000000000</p>
            <p><Mail size={13} style={{ marginRight: 6, display:'inline' }} />[EMAIL_ADDRESS]</p>
          </div>
          <div>
            <h4>Hours</h4>
            <p><Clock size={13} style={{ marginRight: 6, display:'inline' }} />Dinner: 5PM – 10:30PM</p>
            <p><Clock size={13} style={{ marginRight: 6, display:'inline' }} />Brunch: 10:30AM – 3PM (Fri–Sun)</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 Smart Order & Billing · All Rights Reserved</p>
          <p>Built with ❤️ by Sandip using MERN Stack</p>
        </div>
      </footer>
    </div>
  );
}

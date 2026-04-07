import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Menu.module.css';
import API from '../api';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('North Indian');
  const [activeState, setActiveState] = useState('');
  const [browseMode, setBrowseMode] = useState('category'); 
  const [items, setItems] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const [quickView, setQuickView] = useState(null);
  const [toast, setToast] = useState('');
  const itemCache = useRef({});
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  useEffect(() => {
    Promise.all([
      API.get('/menu'),
      API.get('/menu/states')
    ]).then(([catRes, stateRes]) => {
      setCategories(catRes.data.categories);
      setStates(stateRes.data);
      // Auto-select first state from North Indian as default
      setActiveCategory('North Indian');
      setLoadingCats(false);
    }).catch(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      
      // Handle Search
      if (searchQ.trim().length > 1) {
        try {
          const r = await API.get(`/menu/search/${searchQ}`);
          setItems(r.data);
          setLoadingItems(false);
        } catch { setLoadingItems(false); }
        return;
      }

      // Handle Browse Mode switching
      let r;
      try {
        if (browseMode === 'state' && activeState) {
          const cacheKey = `state-${activeState}`;
          if (itemCache.current[cacheKey]) { setItems(itemCache.current[cacheKey]); setLoadingItems(false); return; }
          r = await API.get(`/menu/by-state/${activeState}`);
          itemCache.current[cacheKey] = r.data;
        } else {
          const cacheKey = `cat-${activeCategory}`;
          if (itemCache.current[cacheKey]) { setItems(itemCache.current[cacheKey]); setLoadingItems(false); return; }
          r = await API.get(`/menu/${activeCategory}`);
          itemCache.current[cacheKey] = r.data;
        }
        setItems(r.data);
      } catch { }
      setLoadingItems(false);
    };

    const debounce = setTimeout(fetchItems, searchQ.trim() ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [activeCategory, activeState, searchQ, browseMode]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const handleAdd = (item) => {
    addToCart(item);
    showToast(`✅ "${item.name}" added to cart`);
  };
  const getQtyInCart = (id) => {
    const found = cart.find(i => i.id === id);
    return found ? found.quantity : 0;
  };
  const getDiet = (item) => item.isVeg ? 'Veg' : 'Non-Veg';

  const filtered = items
    .filter(i => {
      const diet = getDiet(i);
      const matchesDiet = dietFilter === 'All' || diet === dietFilter;
      return matchesDiet;
    })
    .sort((a, b) => {
      if (sortOrder === 'Price: Low to High') return a.price - b.price;
      if (sortOrder === 'Price: High to Low') return b.price - a.price;
      if (sortOrder === 'Top Rated') return b.rating - a.rating;
      return 0;
    });

  const activeObj = categories.find(c => c.name === activeCategory);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>🇮🇳 Authentically Indian</div>
        <h1>The Great Indian Platter</h1>
        <p>A journey through the culinary map of India. Select a region or state to discover localized gems.</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-52%)', color: 'var(--gold)', fontSize: '0.9rem' }}>🔍</span>
            <input className={styles.search} placeholder="Search dishes, states or districts..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 38, border: searchQ ? '1px solid var(--gold)' : '' }} />
          </div>
          
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 25, padding: 4, border: '1px solid var(--border)', gap: 4 }}>
            <button onClick={() => setBrowseMode('category')} className={`${styles.modeBtn} ${browseMode === 'category' ? styles.modeBtnActive : ''}`}>By Region</button>
            <button onClick={() => setBrowseMode('state')} className={`${styles.modeBtn} ${browseMode === 'state' ? styles.modeBtnActive : ''}`}>By State</button>
          </div>

          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 25, padding: 4, border: '1px solid var(--border)', gap: 4 }}>
            {['All', 'Veg', 'Non-Veg'].map(f => (
              <button key={f} onClick={() => setDietFilter(f)} 
                className={`${styles.dietBtn} ${dietFilter === f ? styles.dietBtnActive : ''}`}>
                {f === 'Veg' && <div className={styles.vegDot} style={{ marginRight: 6 }} />}
                {f === 'Non-Veg' && <div className={styles.nonVegDot} style={{ marginRight: 6 }} />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.catBar}>
        {loadingCats ? (
          [1,2,3,4].map(i => <div key={i} className={`${styles.catBtn} ${styles.skeleton}`} style={{ width: 140, height: 160 }} />)
        ) : (
          <>
            {browseMode === 'category' ? (
              categories.map(c => (
                <button key={c.name} onClick={() => { setActiveCategory(c.name); setSearchQ(''); }}
                  className={`${styles.catBtn} ${activeCategory === c.name && !searchQ ? styles.activeCat : ''}`}>
                  <img src={c.thumb} alt={c.name} className={styles.catThumb} />
                  <span>{c.name}</span>
                </button>
              ))
            ) : (
              states.map(s => (
                <button key={s} onClick={() => { setActiveState(s); setSearchQ(''); }}
                  className={`${styles.catBtn} ${activeState === s && !searchQ ? styles.activeCat : ''}`}>
                  <div className={styles.areaCircle}>{s.slice(0, 1)}</div>
                  <span>{s}</span>
                </button>
              ))
            )}
          </>
        )}
      </div>

      <div className={styles.sectionHead}>
        <div>
          <h2 className={loadingItems ? styles.skeleton : ''}>
            {searchQ ? `Results for "${searchQ}"` : (browseMode === 'state' ? `${activeState} Specials` : `${activeCategory} Specialties`)}
          </h2>
          <p className={loadingItems ? styles.skeleton : ''}>
            {searchQ ? `Searching local specialties across India.` : (browseMode === 'state' ? `A deep dive into the districts of ${activeState}.` : activeObj?.desc)}
          </p>
        </div>
        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
          <select className={styles.sortSelect} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            {['Default', 'Price: Low to High', 'Price: High to Low', 'Top Rated'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div className={styles.countBadge}>{filtered.length} Dishes</div>
        </div>
      </div>

      {loadingItems ? (
        <div className={styles.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={styles.card}>
              <div className={`${styles.imgWrap} ${styles.skeleton}`} />
              <div className={styles.cardBody}>
                <div className={styles.skeleton} style={{ height: 24, marginBottom: 12 }} />
                <div className={styles.skeleton} style={{ height: 16, width: '60%', marginBottom: 12 }} />
                <div className={styles.skeleton} style={{ height: 40, marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => {
            const qty = getQtyInCart(item.id);
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img src={item.img} alt={item.name} className={styles.img} loading="lazy"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setQuickView(item)}
                  />
                  <div className={styles.priceBadge}>₹{item.price}</div>
                  <div className={item.isVeg ? styles.vegIndicator : styles.nonVegIndicator}>
                    <div className={item.isVeg ? styles.vegDot : styles.nonVegDot} />
                  </div>
                  {qty > 0 && <div className={styles.cartQtyBadge}>{qty}</div>}
                  {item.isTrending && <div className={styles.trendingBadge}>🔥 Trending</div>}
                  {item.price > 350 && <div className={styles.premiumBadge}>Premium Thali</div>}
                </div>
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.ratingBadge}>⭐ {item.rating}</div>
                  </div>
                  <p className={styles.cardCat}>{item.district} · {item.state}</p>
                  <p className={styles.cardDesc}>{item.desc}</p>
                  <button className={styles.addBtn} onClick={() => handleAdd(item)}>
                    {qty > 0 ? `✓ ${qty} in Cart · Add More` : '+ Add to Order'}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loadingItems && (
            <div className={styles.noResult}>
              <div style={{ fontSize: '3rem', marginBottom: 15 }}>🥘</div>
              <p>No Indian dishes found matching your search.</p>
              <button 
                onClick={() => { setSearchQ(''); setDietFilter('All'); }}
                style={{ marginTop: 15, background: 'none', border: `1px solid var(--gold)`, color: 'var(--gold)', padding: '8px 20px', borderRadius: 20, cursor: 'pointer' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {quickView && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', padding: 20 }}>
          <div style={{ background: 'var(--surface)', width: '100%', maxWidth: 800, borderRadius: 24, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setQuickView(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>✕</button>
            <div style={{ flex: '1 1 300px', minHeight: 300 }}>
              <img src={quickView.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={quickView.name} />
            </div>
            <div style={{ flex: '1 1 300px', padding: 32, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className={quickView.isVeg ? styles.vegIndicator : styles.nonVegIndicator} style={{ position: 'static' }}>
                  <div className={quickView.isVeg ? styles.vegDot : styles.nonVegDot} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{quickView.district} · {quickView.state}</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: 16, color: 'var(--text)' }}>{quickView.name}</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24, fontSize: '0.9rem' }}>{quickView.desc}</p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--gold)' }}>District Specialty</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-soft, var(--text))' }}>This dish is a signature item from the <strong>{quickView.district}</strong> district of <strong>{quickView.state}</strong>.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)' }}>₹{quickView.price}</span>
                <button className={styles.addBtn} onClick={() => { handleAdd(quickView); setQuickView(null); }} style={{ padding: '12px 24px' }}>
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

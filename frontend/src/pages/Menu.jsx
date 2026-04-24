import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useCart } from '../context/CartContext';
import styles from './Menu.module.css';

const STATE_FLAGS = {
  'Punjab': '🌾', 'Delhi': '🏛️', 'Uttar Pradesh': '🕌', 'Rajasthan': '🏜️',
  'Jammu & Kashmir': '🏔️', 'Bihar': '🌿', 'Haryana': '🌻', 'Himachal Pradesh': '⛰️',
  'Uttarakhand': '🦅', 'Karnataka': '🌴', 'Tamil Nadu': '🌺', 'Kerala': '🥥',
  'Andhra Pradesh': '🌶️', 'Telangana': '💎', 'Maharashtra': '🌊', 'Gujarat': '🦁',
  'Goa': '🏖️', 'Madhya Pradesh': '🐯', 'West Bengal': '🐟', 'Odisha': '🛕',
  'Sikkim': '🏔️', 'Assam': '🍃', 'Jharkhand': '🌲', 'Chhattisgarh': '🦜',
};

function Menu() {
  const { addToCart, cart, updateQty } = useCart();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  
  // Filtering & State
  const [activeCategory, setActiveCategory] = useState('');
  const [toast, setToast] = useState('');
  const [browseMode, setBrowseMode] = useState('category'); // 'category' or 'state'
  const [states, setStates] = useState([]);
  const [activeState, setActiveState] = useState('');
  
  // Advanced Indian UI Filters
  const [searchQ, setSearchQ] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [spiceFilter, setSpiceFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');

  // Modal
  const [quickView, setQuickView] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Cache to avoid refetching
  const itemCache = useRef({});

  useEffect(() => {
    // Initial fetch of categories and states
    Promise.all([
      API.get('/menu'),
      API.get('/menu/states')
    ]).then(([catRes, stateRes]) => {
      setCategories(catRes.data.categories);
      setStates(stateRes.data);
      // Auto-select first category
      if (catRes.data.categories.length > 0) {
        setActiveCategory(catRes.data.categories[0].name);
      }
      if (stateRes.data.length > 0) setActiveState('Delhi'); // Default state
      setLoadingCats(false);
    }).catch(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      
      // Handle Search overriding
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
        } else if (browseMode === 'category' && activeCategory) {
          const cacheKey = `cat-${activeCategory}`;
          if (itemCache.current[cacheKey]) { setItems(itemCache.current[cacheKey]); setLoadingItems(false); return; }
          r = await API.get(`/menu/${activeCategory}`);
          itemCache.current[cacheKey] = r.data;
        }
        if (r && r.data) setItems(r.data);
      } catch { }
      setLoadingItems(false);
    };

    const debounce = setTimeout(fetchItems, searchQ.trim() ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [activeCategory, activeState, searchQ, browseMode]);

  useEffect(() => {
    if (quickView) {
      API.get(`/menu/recommend/${quickView.id}`)
         .then(res => setRecommendations(res.data))
         .catch(() => setRecommendations([]));
    }
  }, [quickView]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const handleAdd = (item, e) => {
    if (e) e.stopPropagation();
    addToCart(item);
    showToast(`✅ "${item.name}" added to cart`);
  };
  const getQtyInCart = (id) => {
    const found = cart.find(i => i.id === id);
    return found ? found.quantity : 0;
  };
  const getDiet = (item) => item.isVeg ? 'Veg' : 'Non-Veg';

  const spiceEmoji = { 'Mild': '🫑', 'Medium': '🌶️', 'Hot': '🌶️🌶️', 'Extra Hot': '🔥🔥🔥' };
  const spiceColor = { 'Mild': '#27ae60', 'Medium': '#f39c12', 'Hot': '#e74c3c', 'Extra Hot': '#c0392b' };

  const filtered = items
    .filter(i => {
      const diet = getDiet(i);
      const matchesDiet = dietFilter === 'All' || diet === dietFilter;
      const matchesSpice = spiceFilter === 'All' || i.spice === spiceFilter;
      return matchesDiet && matchesSpice;
    })
    .sort((a, b) => {
      if (sortOrder === 'Price: Low to High') return a.price - b.price;
      if (sortOrder === 'Price: High to Low') return b.price - a.price;
      if (sortOrder === 'Top Rated') return b.rating - a.rating;
      if (sortOrder === 'Quick Prep') return a.prepTime - b.prepTime;
      if (sortOrder === 'Low Calorie') return a.calories - b.calories;
      return 0;
    });

  const activeObj = categories.find(c => c.name === activeCategory);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>🇮🇳 100% Authentic Indian</div>
        <h1>The Great Indian Platter</h1>
        <p>Explore 80+ handpicked dishes from every corner of India — with real images, nutrition info & spice levels.</p>
        
        <div className={styles.filterRow}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input className={styles.search} placeholder="Search dishes, states, ingredients..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 38, border: searchQ ? '1px solid var(--gold)' : '' }} />
          </div>
          
          <div className={styles.filterGroup}>
            <button onClick={() => setBrowseMode('category')} className={`${styles.modeBtn} ${browseMode === 'category' ? styles.modeBtnActive : ''}`}>By Region</button>
            <button onClick={() => setBrowseMode('state')} className={`${styles.modeBtn} ${browseMode === 'state' ? styles.modeBtnActive : ''}`}>By State</button>
          </div>

          <div className={styles.filterGroup}>
            {['All', 'Veg', 'Non-Veg'].map(f => (
              <button key={f} onClick={() => setDietFilter(f)} 
                className={`${styles.dietBtn} ${dietFilter === f ? styles.dietBtnActive : ''}`}>
                {f === 'Veg' && <div className={styles.vegDot} style={{ marginRight: 4 }} />}
                {f === 'Non-Veg' && <div className={styles.nonVegDot} style={{ marginRight: 4 }} />}
                {f}
              </button>
            ))}
          </div>

          <div className={styles.filterGroup}>
            {['All', 'Mild', 'Medium', 'Hot', 'Extra Hot'].map(s => (
              <button key={s} onClick={() => setSpiceFilter(s)}
                className={`${styles.dietBtn} ${spiceFilter === s ? styles.dietBtnActive : ''}`}
                style={spiceFilter === s && s !== 'All' ? { color: spiceColor[s] } : {}}>
                {s === 'All' ? '🌡️ All' : `${spiceEmoji[s]?.slice(0, 2) || ''} ${s}`}
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
                  <div className={styles.catCount}>{c.count}</div>
                </button>
              ))
            ) : (
              states.map(s => {
                const flag = STATE_FLAGS[s] || '📍';
                return (
                  <button key={s} onClick={() => { setActiveState(s); setSearchQ(''); }}
                    className={`${styles.catBtn} ${activeState === s && !searchQ ? styles.activeCat : ''}`}>
                    <div className={styles.areaCircle}>
                      <span style={{ fontSize: '1.4rem' }}>{flag}</span>
                    </div>
                    <span>{s}</span>
                  </button>
                );
              })
            )}
          </>
        )}
      </div>

      <div className={styles.sectionHead}>
        <div>
          <h2>
            {searchQ ? `Search results for "${searchQ}"` : 
             browseMode === 'state' ? `${activeState} Specialties` : 
             `${activeCategory} Specialties`}
          </h2>
          <p>{!searchQ && browseMode === 'category' ? activeObj?.desc : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={styles.sortSelect}>
            {['Default', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Quick Prep', 'Low Calorie'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className={styles.countBadge}>{filtered.length} Dishes</div>
        </div>
      </div>

      <div className={styles.grid}>
        {loadingItems ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className={styles.card} style={{ height: 380 }}>
              <div className={styles.imgWrap}><div className={`${styles.skeleton}`} style={{ width: '100%', height: '100%' }} /></div>
              <div className={styles.cardBody}>
                <div className={`${styles.skeleton}`} style={{ width: '70%', height: 24, marginBottom: 12 }} />
                <div className={`${styles.skeleton}`} style={{ width: '40%', height: 16, marginBottom: 24 }} />
                <div className={`${styles.skeleton}`} style={{ width: '100%', height: 40, marginTop: 'auto' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className={styles.noResult}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
            <h3>No authentic dishes found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filtered.map(item => {
            const qty = getQtyInCart(item.id);
            return (
              <div key={item.id} className={styles.card} onClick={() => setQuickView(item)}>
                <div className={styles.imgWrap}>
                  <img src={item.img} alt={item.name} className={styles.img} loading="lazy" />
                  <div className={styles.priceBadge}>₹{item.price}</div>
                  
                  {item.isVeg ? (
                    <div className={styles.vegIndicator}><div className={styles.vegDot} /></div>
                  ) : (
                    <div className={styles.nonVegIndicator}><div className={styles.nonVegDot} /></div>
                  )}

                  {item.isTrending && <div className={styles.trendingBadge}>🔥 Trending</div>}
                  {item.rating >= 4.8 && <div className={styles.premiumBadge}>Premium Content</div>}
                  
                  {qty > 0 && <div className={styles.cartQtyBadge}>{qty} in cart</div>}
                </div>
                
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.hindiName}>{item.hindiName}</div>
                      <div className={styles.cardCat}>{item.origin}</div>
                    </div>
                    <div className={styles.ratingBadge}>⭐ {item.rating}</div>
                  </div>
                  
                  <div className={styles.nutritionRow}>
                    <div className={styles.nutritionPill} style={{ color: spiceColor[item.spice], borderColor: `${spiceColor[item.spice]}55`, background: `${spiceColor[item.spice]}11` }}>
                      {spiceEmoji[item.spice]?.slice(0, 2)} {item.spice}
                    </div>
                    {item.weight && <div className={styles.nutritionPill}>⚖️ {item.weight}</div>}
                    <div className={styles.nutritionPill}>🔥 {item.calories} cal</div>
                    <div className={styles.nutritionPill}>⏱️ {item.prepTime}m</div>
                  </div>

                  <p className={styles.cardDesc}>{item.desc}</p>
                  
                  {qty > 0 ? (
                    <div className={styles.qtyControl} onClick={e => e.stopPropagation()}>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.id, qty - 1)}>−</button>
                      <span className={styles.qtySpan}>{qty}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.id, qty + 1)}>+</button>
                    </div>
                  ) : (
                    <button className={styles.addBtn} onClick={(e) => handleAdd(item, e)}>
                      + Add to Order
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {/* QUICK VIEW MODAL */}
      {quickView && (
        <div className={styles.modalOverlay} onClick={() => setQuickView(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setQuickView(null)}>✕</button>
            
            <div className={styles.modalImage}>
              <img src={quickView.img} alt={quickView.name} />
              <div className={styles.modalPriceTag}>₹{quickView.price}</div>
              {quickView.isVeg ? (
                <div className={styles.vegIndicator} style={{ zoom: 1.5 }}><div className={styles.vegDot} /></div>
              ) : (
                <div className={styles.nonVegIndicator} style={{ zoom: 1.5 }}><div className={styles.nonVegDot} /></div>
              )}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.cardCat} style={{ fontSize: '0.8rem', letterSpacing: 1 }}>{quickView.origin}</div>
              <h2 className={styles.modalTitle}>{quickView.name}</h2>
              <div className={styles.hindiName} style={{ fontSize: '1rem', marginBottom: 16 }}>{quickView.hindiName}</div>

              <div className={styles.nutritionRow} style={{ marginBottom: 20 }}>
                <div className={styles.nutritionPill} style={{ fontSize: '0.8rem', padding: '4px 10px', color: spiceColor[quickView.spice], borderColor: `${spiceColor[quickView.spice]}55`, background: `${spiceColor[quickView.spice]}11` }}>
                  {spiceEmoji[quickView.spice]?.slice(0, 2)} {quickView.spice}
                </div>
                <div className={styles.ratingBadge} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>⭐ {quickView.rating} Rating</div>
              </div>

              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                {quickView.desc}
              </p>

              <div className={styles.modalNutritionGrid} style={{ marginBottom: 24 }}>
                <div className={styles.modalNutritionItem}>
                  <div className={styles.modalNutritionIcon}>🔥</div>
                  <span>{quickView.calories}</span>
                  <small>Calories</small>
                </div>
                <div className={styles.modalNutritionItem}>
                  <div className={styles.modalNutritionIcon}>⏱️</div>
                  <span>{quickView.prepTime}m</span>
                  <small>Prep Time</small>
                </div>
                <div className={styles.modalNutritionItem}>
                  <div className={styles.modalNutritionIcon}>{quickView.isVeg ? '🥬' : '🍗'}</div>
                  <span>{getDiet(quickView)}</span>
                  <small>Dietary</small>
                </div>
                {quickView.weight && (
                  <div className={styles.modalNutritionItem}>
                    <div className={styles.modalNutritionIcon}>⚖️</div>
                    <span style={{ fontSize: '0.9rem' }}>{quickView.weight}</span>
                    <small>Portion Size</small>
                  </div>
                )}
              </div>

              {quickView.ingredients && quickView.ingredients.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8, letterSpacing: 1 }}>Core Ingredients</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {quickView.ingredients.map(ing => (
                      <span key={ing} className={styles.ingredientTag}>{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {quickView.allergens && quickView.allergens.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#e74c3c', marginBottom: 8, letterSpacing: 1 }}>Allergen Warning</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {quickView.allergens.map(al => (
                      <span key={al} className={styles.allergenTag}>⚠️ Contains {al}</span>
                    ))}
                  </div>
                </div>
              )}

              {getQtyInCart(quickView.id) > 0 ? (
                <div className={styles.qtyControl} style={{ marginTop: 'auto', padding: '4px' }}>
                  <button className={styles.qtyBtn} style={{ padding: '12px 24px', fontSize: '1.2rem' }} onClick={() => updateQty(quickView.id, getQtyInCart(quickView.id) - 1)}>−</button>
                  <span className={styles.qtySpan} style={{ fontSize: '1.2rem' }}>{getQtyInCart(quickView.id)}</span>
                  <button className={styles.qtyBtn} style={{ padding: '12px 24px', fontSize: '1.2rem' }} onClick={() => updateQty(quickView.id, getQtyInCart(quickView.id) + 1)}>+</button>
                </div>
              ) : (
                <button className={styles.addBtn} style={{ padding: '16px', fontSize: '1rem', marginTop: 'auto' }} onClick={() => handleAdd(quickView)}>
                  + Add {quickView.name} to Order
                </button>
              )}

              {recommendations.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 12 }}>You Might Also Like</h4>
                  <div className={styles.recGrid}>
                    {recommendations.slice(0, 4).map(rec => (
                      <div key={rec.id} className={styles.recCard} onClick={() => setQuickView(rec)}>
                        <img src={rec.img} alt={rec.name} />
                        <div>
                          <p>{rec.name}</p>
                          <span>₹{rec.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;

const router = require('express').Router();
const https = require('https');

// ─── MASTER INDIAN CUISINE DATA (Sorted & Expanded) ───
const RAW_STATE_DATA = {
  'Andhra Pradesh': { districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'], dishes: ['Pulihora', 'Pesarattu', 'Gongura Pachadi'], meat: ['Andhra Chicken Curry', 'Nellore Fish Pulusu'] },
  'Arunachal Pradesh': { districts: ['Itanagar', 'Tawang', 'Ziro', 'Pasighat'], dishes: ['Thukpa', 'Zan', 'Khura'], meat: ['Pika Pila', 'Lukter'] },
  'Assam': { districts: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'], dishes: ['Khar', 'Masor Tenga', 'Aloo Pitika'], meat: ['Duck Meat Curry', 'Pork with Bamboo Shoot'] },
  'Bihar': { districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'], dishes: ['Litti Chokha', 'Thekua', 'Sattu Paratha'], meat: ['Bihari Kabab', 'Mutton Curry'] },
  'Chhattisgarh': { districts: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'], dishes: ['Chana Samosa', 'Muthia', 'Faraa'], meat: ['Bafauri', 'Chhattisgarhi Mutton'] },
  'Goa': { districts: ['Panaji', 'Margao', 'Vasco', 'Mapusa'], dishes: ['Bebinca', 'Khatkhate', 'Sanna'], meat: ['Pork Vindaloo', 'Fish Recheado', 'Chicken Cafreal'] },
  'Gujarat': { districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'], dishes: ['Dhokla', 'Thepla', 'Khandvi', 'Undhiyu'], meat: ['Surti Ghari', 'Coastal Fish Curry'] },
  'Haryana': { districts: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala'], dishes: ['Bajra Khichdi', 'Kachri Ki Sabzi', 'Mixed Dal'], meat: ['Haryanvi Chicken', 'Teetar Roast'] },
  'Himachal Pradesh': { districts: ['Shimla', 'Manali', 'Dharamshala', 'Solan'], dishes: ['Siddu', 'Madra', 'Babru'], meat: ['Chha Gosht', 'Kullu Trout'] },
  'Jammu & Kashmir': { districts: ['Srinagar', 'Jammu', 'Anantnag', 'Udhampur'], dishes: ['Dum Aloo', 'Kashmiri Pulao', 'Sheer Chai'], meat: ['Rogan Josh', 'Yakhni Mutton', 'Gushtaba'] },
  'Jharkhand': { districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'], dishes: ['Dhuska', 'Rugra', 'Pitha'], meat: ['Handia Chicken', 'Silk Mutton'] },
  'Karnataka': { districts: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'], dishes: ['Bisi Bele Bath', 'Mysore Pak', 'Neer Dosa'], meat: ['Kori Gassi', 'Pandi Curry'] },
  'Kerala': { districts: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Wayanad'], dishes: ['Appam Stew', 'Avial', 'Puttu Kadala'], meat: ['Malabar Biryani', 'Kerala Beef Fry'] },
  'Madhya Pradesh': { districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'], dishes: ['Poha Jalebi', 'Bhutte Ka Kees', 'Dal Bafla'], meat: ['Bhopali Gosht Korma'] },
  'Maharashtra': { districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'], dishes: ['Vada Pav', 'Pav Bhaji', 'Misal Pav', 'Puran Poli'], meat: ['Kolhapuri Mutton', 'Malvani Fish'] },
  'Manipur': { districts: ['Imphal', 'Churachandpur', 'Thoubal', 'Ukhrul'], dishes: ['Eromba', 'Singju', 'Chamthong'], meat: ['Nga Thongba', 'Smoked Pork'] },
  'Meghalaya': { districts: ['Shillong', 'Tura', 'Jowai', 'Nongstoin'], dishes: ['Jadoh', 'Nakham Bitchi', 'Pukhlein'], meat: ['Doh-Neiiong', 'Smoked Meat'] },
  'Mizoram': { districts: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'], dishes: ['Bai', 'Koat Pitha', 'Mizo Salad'], meat: ['Vawksa Rep', 'Arsa Buhchiar'] },
  'Nagaland': { districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'], dishes: ['Axone', 'Galho', 'Hinkejvu'], meat: ['Pork with King Chilli', 'Nagaland Smoked Meat'] },
  'Odisha': { districts: ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela'], dishes: ['Dalma', 'Chhena Poda', 'Pakhala Bhata'], meat: ['Machha Ghanta', 'Mutton Kasa'] },
  'Punjab': { districts: ['Amritsar', 'Ludhiana', 'Patiala', 'Jalandhar'], dishes: ['Dal Makhani', 'Sarson Da Saag', 'Paneer Tikka'], meat: ['Butter Chicken', 'Tandoori Chicken'] },
  'Rajasthan': { districts: ['Jaipur', 'Udaipur', 'Jodhpur', 'Bikaner'], dishes: ['Dal Baati Churma', 'Gatte Ki Sabzi', 'Pyaz Kachori'], meat: ['Laal Maas', 'Jungli Maas'] },
  'Sikkim': { districts: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'], dishes: ['Phagshapa', 'Gundruk', 'Sael Roti'], meat: ['Sikkimese Momo', 'Kinema'] },
  'Tamil Nadu': { districts: ['Chennai', 'Madurai', 'Coimbatore', 'Salem'], dishes: ['Masala Dosa', 'Idli Sambar', 'Pongal'], meat: ['Chettinad Chicken', 'Chicken 65'] },
  'Telangana': { districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'], dishes: ['Sarva Pindi', 'Pachi Pulusu', 'Sakinalu'], meat: ['Hyderabadi Biryani', 'Haleem'] },
  'Tripura': { districts: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar'], dishes: ['Mui Borok', 'Chakhwi', 'Berma'], meat: ['Wahan Mosdeng', 'Pork Mosdeng'] },
  'Uttar Pradesh': { districts: ['Lucknow', 'Varanasi', 'Agra', 'Kanpur'], dishes: ['Bedmi Poori', 'Petha', 'Banarasi Chaat'], meat: ['Galouti Kebab', 'Lucknowi Biryani'] },
  'Uttarakhand': { districts: ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital'], dishes: ['Kafuli', 'Bhaanij', 'Alloo Ke Gutke'], meat: ['Garhwali Mutton', 'Kumaoni Chicken'] },
  'West Bengal': { districts: ['Kolkata', 'Darjeeling', 'Howrah', 'Siliguri'], dishes: ['Rosogolla', 'Mishti Doi', 'Luchi Alur Dom'], meat: ['Kosha Mangsho', 'Macher Jhol'] },
  'Delhi': { districts: ['Old Delhi', 'South Delhi', 'Chandni Chowk', 'West Delhi'], dishes: ['Chole Bhature', 'Aloo Tikki', 'Rabri Falooda'], meat: ['Moti Mahal Butter Chicken', 'Karim\'s Mutton'] }
};

// Normalize keys to allow case-insensitive lookup
const STATE_CUISINES = {};
Object.keys(RAW_STATE_DATA).forEach(k => { STATE_CUISINES[k.toUpperCase()] = RAW_STATE_DATA[k]; });

const ALL_STATES_ALPHABETICAL = Object.keys(RAW_STATE_DATA).sort();

const REGIONS = {
  'North Indian': ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'],
  'South Indian': ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana'],
  'East Indian': ['Arunachal Pradesh', 'Assam', 'Bihar', 'Jharkhand', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Sikkim', 'Tripura', 'West Bengal'],
  'West Indian': ['Goa', 'Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Chhattisgarh']
};

let apiPool = [];

// ─── API FETCH (Fetching REAL data from TheMealDB) ───
const fetchApiData = () => {
    https.get('https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian', (res) => {
        let data = ''; res.on('data', c => data += c);
        res.on('end', () => {
            const r = JSON.parse(data);
            if (r.meals) {
                r.meals.forEach(m => {
                    https.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`, (res2) => {
                        let d2 = ''; res2.on('data', c => d2 += c);
                        res2.on('end', () => {
                            const r2 = JSON.parse(d2);
                            if (r2.meals && r2.meals[0]) apiPool.push(r2.meals[0]);
                        });
                    });
                });
            }
        });
    });
};
fetchApiData();

// ─── GENERATOR ───
const generateIndianMenu = (stateName, count = 60) => {
  const items = [];
  const normalizedKey = stateName.toUpperCase();
  const sInfo = STATE_CUISINES[normalizedKey] || RAW_STATE_DATA['Delhi'];
  const actualStateName = Object.keys(RAW_STATE_DATA).find(k => k.toUpperCase() === normalizedKey) || 'Delhi';
  
  for (let i = 0; i < count; i++) {
    const apiItem = apiPool.length > 0 ? apiPool[Math.floor(Math.random() * apiPool.length)] : null;
    const dist = sInfo.districts[i % sInfo.districts.length];
    const isVeg = i % 2 === 0;
    const baseDish = isVeg ? sInfo.dishes[i % sInfo.dishes.length] : sInfo.meat[i % sInfo.meat.length];
    
    const prefixes = ['Traditional', 'Authentic', 'Hand-Crafted', 'Bazaar-Style', 'Signature', 'Royal', 'Homestyle', 'Grandmother\'s', 'Village-Style'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const name = (apiItem && Math.random() > 0.7) ? `${prefix} ${apiItem.strMeal}` : `${prefix} ${dist} ${baseDish}`;
    const img = apiItem ? apiItem.strMealThumb : `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500`;

    items.push({
      id: `mnd-${actualStateName.slice(0,2)}-${dist.slice(0,2)}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      name: name,
      img: img,
      price: 180 + Math.floor(Math.random() * 260),
      currency: '₹',
      origin: `${dist}, ${actualStateName}`,
      desc: apiItem?.strInstructions?.slice(0, 140) || `Experience the rich, spice-infused flavors of ${dist}, ${actualStateName}. This ${isVeg ? 'Vegetarian' : 'Non-Vegetarian'} highlight is a true regional masterpiece.`,
      cuisine: 'Indian',
      state: actualStateName,
      district: dist,
      isVeg: isVeg,
      rating: (4.1 + Math.random() * 0.8).toFixed(1),
      isTrending: Math.random() > 0.85,
      isStocked: true,
      stockCount: 40 + Math.floor(Math.random() * 40)
    });
  }
  return items;
};

// ─── ROUTES ───

router.get('/states', (req, res) => res.json(ALL_STATES_ALPHABETICAL));

router.get('/by-state/:state', (req, res) => res.json(generateIndianMenu(req.params.state, 80)));

router.get('/search/:q', (req, res) => {
  const q = req.params.q.toLowerCase();
  const all = [];
  ALL_STATES_ALPHABETICAL.slice(0, 15).forEach(s => all.push(...generateIndianMenu(s, 15)));
  res.json(all.filter(it => it.name.toLowerCase().includes(q) || it.state.toLowerCase().includes(q) || it.district.toLowerCase().includes(q)));
});

router.get('/', (req, res) => {
  res.json({
    categories: Object.keys(REGIONS).map(r => ({
      name: r,
      thumb: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100',
      desc: `Discover the ${r} culinary legacy.`
    }))
  });
});

router.get('/:category', (req, res) => {
  const cat = req.params.category;
  // Case-Insensitive State Check
  const matchedState = ALL_STATES_ALPHABETICAL.find(s => s.toLowerCase() === cat.toLowerCase());
  if (matchedState) return res.json(generateIndianMenu(matchedState, 80));

  const sInR = REGIONS[cat];
  if (sInR) {
    const items = [];
    sInR.slice(0, 8).forEach(s => items.push(...generateIndianMenu(s, 15)));
    return res.json(items);
  }
  res.json(generateIndianMenu('Delhi', 50));
});

module.exports = router;

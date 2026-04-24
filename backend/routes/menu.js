const router = require('express').Router();
const { REGIONS, REGION_THUMBS, allDishes, ALL_STATES, SPECIAL_CATS } = require('../data/menuData');

// ─── ROUTES ───
router.get('/', (req, res) => {
  const categories = [
    ...Object.keys(REGIONS).map(r => ({
      name: r, thumb: REGION_THUMBS[r],
      desc: `Discover the rich ${r} culinary heritage across ${REGIONS[r].length} states.`,
      count: allDishes.filter(d => REGIONS[r].includes(d.state)).length,
    })),
    ...Object.keys(SPECIAL_CATS).map(c => ({
      name: c, thumb: REGION_THUMBS[c],
      desc: `Browse our curated ${c.toLowerCase()} collection.`,
      count: SPECIAL_CATS[c].length,
    })),
  ];
  res.json({ categories });
});

router.get('/states', (req, res) => res.json(ALL_STATES));
router.get('/by-state/:state', (req, res) => {
  const matches = allDishes.filter(d => d.state.toLowerCase() === req.params.state.toLowerCase());
  res.json(matches.length > 0 ? matches : allDishes.filter(d => d.state === 'Delhi'));
});

router.get('/search/:q', (req, res) => {
  const q = req.params.q.toLowerCase();
  res.json(allDishes.filter(d =>
    d.name.toLowerCase().includes(q) || d.hindiName.includes(q) ||
    d.state.toLowerCase().includes(q) || d.district.toLowerCase().includes(q) ||
    d.desc.toLowerCase().includes(q) || d.ingredients.some(ing => ing.toLowerCase().includes(q))
  ));
});

router.get('/spice/:level', (req, res) => res.json(allDishes.filter(d => d.spice.toLowerCase() === req.params.level.toLowerCase())));
router.get('/trending', (req, res) => res.json(allDishes.filter(d => d.isTrending).slice(0, 20)));

router.get('/recommend/:dishId', (req, res) => {
  const dish = allDishes.find(d => d.id === req.params.dishId);
  if (!dish) return res.json([]);
  res.json(allDishes.filter(d => d.id !== dish.id && (d.state === dish.state || d.isVeg === dish.isVeg || d.spice === dish.spice)).slice(0, 8));
});

router.get('/:category', (req, res) => {
  const cat = req.params.category;
  if (SPECIAL_CATS[cat]) return res.json(SPECIAL_CATS[cat]);
  const stateMatch = ALL_STATES.find(s => s.toLowerCase() === cat.toLowerCase());
  if (stateMatch) return res.json(allDishes.filter(d => d.state === stateMatch));
  if (REGIONS[cat]) return res.json(allDishes.filter(d => REGIONS[cat].includes(d.state)));
  res.json(allDishes);
});

module.exports = router;

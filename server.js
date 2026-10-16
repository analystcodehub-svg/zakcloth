const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load in-memory products from data/products.json
let products = [];
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
  products = JSON.parse(rawData);
  console.log(`[INFO] Loaded ${products.length} products successfully.`);
} catch (err) {
  console.error('[ERROR] Failed to load products.json:', err.message);
  products = [];
}

// In-memory cart and wishlist stores (keyed by session or default client)
let inMemoryCart = [];
let inMemoryWishlist = [];

/**
 * Helper to filter & sort product dataset
 */
function queryProducts(queryParams) {
  let { category, brand, search, minPrice, maxPrice, minDiscount, sort } = queryParams;
  let results = [...products];

  // 1. Category filter
  if (category && category.toLowerCase() !== 'all') {
    const categories = category.split(',').map(c => c.trim().toLowerCase());
    results = results.filter(p => {
      if (categories.includes('sale') || categories.includes('offers')) {
        return p.discountPercentage >= 50;
      }
      const catLower = (p.category || '').toLowerCase();
      const subCatLower = (p.subCategory || '').toLowerCase();
      const tagLower = (p.tag || '').toLowerCase();

      return categories.some(c => {
        if (c === 'women' || c === 'ladies') return true;
        return catLower.includes(c) || 
               subCatLower.includes(c) || 
               c.includes(catLower) || 
               c.includes(subCatLower) ||
               tagLower.includes(c);
      });
    });
  }

  // 2. Brand filter
  if (brand) {
    const brands = brand.split(',').map(b => b.trim().toLowerCase());
    results = results.filter(p => brands.includes(p.brand.toLowerCase()));
  }

  // 3. Search query
  if (search && search.trim() !== '') {
    const query = search.trim().toLowerCase();
    results = results.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.subCategory.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // 4. Price range filter
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) results = results.filter(p => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) results = results.filter(p => p.price <= max);
  }

  // 5. Discount filter
  if (minDiscount) {
    const disc = parseFloat(minDiscount);
    if (!isNaN(disc)) results = results.filter(p => p.discountPercentage >= disc);
  }

  // 6. Sorting
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount':
      results.sort((a, b) => b.discountPercentage - a.discountPercentage);
      break;
    case 'newest':
      results.sort((a, b) => b.id - a.id);
      break;
    case 'popularity':
    default:
      // Default / recommended sort: by rating and id
      results.sort((a, b) => (b.rating * 10 + (b.discountPercentage / 10)) - (a.rating * 10 + (a.discountPercentage / 10)));
      break;
  }

  return results;
}

// ==========================================
// ROUTES
// ==========================================

// GET / : Main Fashion Store Catalog
app.get('/', (req, res) => {
  const filteredProducts = queryProducts(req.query);
  const activeCategory = req.query.category || 'all';
  const activeSort = req.query.sort || 'popularity';
  
  // Extract unique brands for filter options
  const allBrands = [...new Set(products.map(p => p.brand))].sort();

  res.render('index', {
    products: filteredProducts,
    totalProducts: filteredProducts.length,
    allBrands,
    activeCategory,
    activeSort,
    activeSearch: req.query.search || '',
    activeBrand: req.query.brand || '',
    activeMinPrice: req.query.minPrice || '',
    activeMaxPrice: req.query.maxPrice || '',
    activeMinDiscount: req.query.minDiscount || ''
  });
});

// GET /studio : Studio Fashion Lookbook & Trends (Pure CSS Patterns)
app.get('/studio', (req, res) => {
  res.render('studio');
});

// GET /api/products : JSON API for client-side search, filtering, and sorting
app.get('/api/products', (req, res) => {
  try {
    const results = queryProducts(req.query);
    res.json({
      success: true,
      count: results.length,
      products: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id : Single product details
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// Start Server
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🛍️  Style Your Mood Fashion App running at http://localhost:${PORT}`);
  console.log(`✨  Mode: Mobile-First Responsive Design`);
  console.log(`🎨  Pure CSS Patterns for Hero Banners & Categories`);
  console.log(`======================================================`);
});


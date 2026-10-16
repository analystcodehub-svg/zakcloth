/**
 * Style Your Mood (SYM) Fashion App - Client-Side Interactivity Engine
 * Features: Live Filter & Sort, LocalStorage Cart & Wishlist, Size Selector Modal,
 * Slide-Over Drawers, Light Blue Hero Carousel, Countdown Timer, Coupons & Toasts.
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('sym_cart') || localStorage.getItem('myntra_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('sym_wishlist') || localStorage.getItem('myntra_wishlist') || '[]');
let activeCategory = 'all';
let activeSort = 'popularity';
let selectedSizeProduct = null;
let selectedSizeValue = null;
let appliedCouponCode = null;
let heroSlideIndex = 0;
let heroInterval = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  fetchInitialProducts();
  updateWishlistUI();
  updateCartUI();
  initHeroCarousel();
  initCountdownTimer();
  initEventListeners();
});

/**
 * Fetch products from API to ensure in-memory client state is hydrated
 */
async function fetchInitialProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      allProducts = data.products;
    }
  } catch (err) {
    console.error('Error loading products list:', err);
  }
}

/**
 * Global Event Listeners Setup
 */
function initEventListeners() {
  // Search input live search
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', val.length === 0);
      }
      debounce(filterProductsLive, 250)();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        filterProductsLive();
      }
    });
  }

  // Story scroller category click events
  const categoryButtons = document.querySelectorAll('.category-item');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      applyCategoryFilter(cat);
    });
  });

  // Drawer triggers
  const wishlistTrigger = document.getElementById('wishlistTriggerBtn');
  if (wishlistTrigger) wishlistTrigger.addEventListener('click', openWishlistDrawer);

  const cartTrigger = document.getElementById('cartTriggerBtn');
  if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);

  const confirmAddBagBtn = document.getElementById('confirmAddBagBtn');
  if (confirmAddBagBtn) confirmAddBagBtn.addEventListener('click', confirmAddBag);
}

// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// HERO CAROUSEL & COUNTDOWN
// ==========================================
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  function showSlide(index) {
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.remove('opacity-0', 'pointer-events-none');
        slide.classList.add('opacity-100', 'z-10');
      } else {
        slide.classList.remove('opacity-100', 'z-10');
        slide.classList.add('opacity-0', 'pointer-events-none');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.remove('w-2', 'bg-white/40');
        dot.classList.add('w-6', 'bg-white');
      } else {
        dot.classList.remove('w-6', 'bg-white');
        dot.classList.add('w-2', 'bg-white/40');
      }
    });
    heroSlideIndex = index;
  }

  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newIdx = (heroSlideIndex - 1 + slides.length) % slides.length;
      showSlide(newIdx);
      resetHeroInterval();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const newIdx = (heroSlideIndex + 1) % slides.length;
      showSlide(newIdx);
      resetHeroInterval();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIdx = parseInt(dot.getAttribute('data-slide'));
      showSlide(slideIdx);
      resetHeroInterval();
    });
  });

  function resetHeroInterval() {
    clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      const newIdx = (heroSlideIndex + 1) % slides.length;
      showSlide(newIdx);
    }, 4500);
  }

  resetHeroInterval();
}

function initCountdownTimer() {
  const timerElem = document.getElementById('countdownTimer');
  if (!timerElem) return;

  let totalSeconds = 8 * 3600 + 42 * 60 + 19;
  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 24 * 3600;
    totalSeconds--;
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    timerElem.textContent = `${h}h : ${m}m : ${s}s`;
  }, 1000);
}

// ==========================================
// FILTERING & SORTING LOGIC
// ==========================================
function selectShopCategory(category) {
  applyCategoryFilter(category);
  const catalogElem = document.getElementById('productsCatalog');
  if (catalogElem) {
    catalogElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function applyCategoryFilter(category) {
  activeCategory = category;

  // Update story scroller visual highlight
  document.querySelectorAll('.category-item').forEach(item => {
    const itemCat = item.getAttribute('data-category');
    if (itemCat === category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Dynamic Catalog Title update
  const titleMap = {
    'all': "TRENDING FASHION",
    'kurtas': "KURTAS & SUITS",
    'sarees': "SAREES & DRAPES",
    'dresses': "WESTERN DRESSES",
    'tops': "TOPS & SHIRTS",
    'ethnic': "FESTIVE LEHENGAS & ETHNIC",
    'co-ords': "CO-ORD SETS",
    'footwear': "HEELS & FOOTWEAR",
    'bags': "HANDBAGS & CLUTCHES",
    'sale': "SPECIAL OFFERS & DEALS"
  };
  const catalogTitle = document.getElementById('catalogTitle');
  if (catalogTitle && titleMap[category.toLowerCase()]) {
    catalogTitle.textContent = titleMap[category.toLowerCase()];
  }

  filterProductsLive();
}

function onSortChange(sortVal) {
  activeSort = sortVal;
  closeSortModal();
  filterProductsLive();
}

async function filterProductsLive() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.trim() : '';

  // Gather filter checks from bottom sheet / sidebar
  const checkedCategories = Array.from(document.querySelectorAll('input[name="filterCategory"]:checked')).map(cb => cb.value);
  const checkedBrands = Array.from(document.querySelectorAll('input[name="filterBrand"]:checked')).map(cb => cb.value);
  const priceRadio = document.querySelector('input[name="filterPrice"]:checked')?.value || 'all';
  const discountRadio = document.querySelector('input[name="filterDiscount"]:checked')?.value || '0';

  // Construct query parameters
  const params = new URLSearchParams();
  
  if (checkedCategories.length > 0) {
    params.set('category', checkedCategories.join(','));
  } else if (activeCategory && activeCategory !== 'all') {
    params.set('category', activeCategory);
  }

  if (checkedBrands.length > 0) {
    params.set('brand', checkedBrands.join(','));
  }

  if (query) {
    params.set('search', query);
  }

  if (priceRadio !== 'all') {
    const [min, max] = priceRadio.split('-');
    if (min) params.set('minPrice', min);
    if (max) params.set('maxPrice', max);
  }

  if (discountRadio !== '0') {
    params.set('minDiscount', discountRadio);
  }

  if (activeSort) {
    params.set('sort', activeSort);
  }

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      renderProductsGrid(data.products);
      updateActiveFilterBadge();
    }
  } catch (err) {
    console.error('Error filtering products:', err);
  }
}

function updateActiveFilterBadge() {
  const badge = document.getElementById('activeFilterBadge');
  if (!badge) return;

  const hasCat = document.querySelectorAll('input[name="filterCategory"]:checked').length > 0;
  const hasBrand = document.querySelectorAll('input[name="filterBrand"]:checked').length > 0;
  const hasPrice = (document.querySelector('input[name="filterPrice"]:checked')?.value || 'all') !== 'all';
  const hasDisc = (document.querySelector('input[name="filterDiscount"]:checked')?.value || '0') !== '0';

  if (hasCat || hasBrand || hasPrice || hasDisc) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderProductsGrid(products) {
  const grid = document.getElementById('productsGrid');
  const countDisplay = document.getElementById('productsCountDisplay');
  const noProductsView = document.getElementById('noProductsView');

  if (countDisplay) {
    countDisplay.textContent = `${products.length} items`;
  }

  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '';
    if (noProductsView) noProductsView.classList.remove('hidden');
    return;
  }

  if (noProductsView) noProductsView.classList.add('hidden');

  grid.innerHTML = products.map(product => {
    const isWishlisted = wishlist.includes(product.id);
    const tagHtml = product.tag ? `
      <div class="absolute top-2 left-2 z-10">
        <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs ${product.tag.includes('Best') ? 'bg-amber-400 text-amber-950' : 'bg-white/95 backdrop-blur-xs text-[#0284c7] border border-sky-100'}">
          ${product.tag}
        </span>
      </div>` : '';

    return `
      <article 
        class="product-card group relative bg-white rounded-lg border border-slate-100 overflow-hidden flex flex-col justify-between shadow-2xs hover:border-sky-200"
        data-id="${product.id}"
      >
        <!-- Top 3:4 Aspect Ratio Image Container -->
        <div class="relative w-full aspect-3-4 bg-sky-50/40 overflow-hidden cursor-pointer" onclick="openSizeModal(${product.id})">
          <img 
            src="${product.imageUrl}" 
            alt="${product.brand} - ${product.title}" 
            loading="lazy"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'533\\' viewBox=\\'0 0 400 533\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23f0f9ff\\'/><rect x=\\'20\\' y=\\'20\\' width=\\'360\\' height=\\'493\\' rx=\\'10\\' fill=\\'none\\' stroke=\\'%23bae6fd\\' stroke-dasharray=\\'6,6\\'/><circle cx=\\'200\\' cy=\\'220\\' r=\\'45\\' fill=\\'%23e0f2fe\\'/><path d=\\'M170 340 L200 280 L230 340 Z\\' fill=\\'%23bae6fd\\' opacity=\\'0.7\\'/><text x=\\'50%\\' y=\\'72%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'16\\' font-weight=\\'bold\\' fill=\\'%230284c7\\'>${encodeURIComponent(product.brand)}</text><text x=\\'50%\\' y=\\'78%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'12\\' fill=\\'%2364748b\\'>${encodeURIComponent(product.category)}</text></svg>';"
          />

          ${tagHtml}

          <!-- Floating Wishlist Heart Toggle Icon -->
          <button 
            type="button" 
            class="wishlist-btn absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center focus:outline-none ${isWishlisted ? 'active' : ''}"
            aria-label="Wishlist toggle"
            onclick="event.stopPropagation(); toggleWishlist(${product.id})"
            data-wishlist-id="${product.id}"
          >
            <svg class="w-4 h-4 text-slate-400 hover:text-[#0284c7] transition-colors ${isWishlisted ? 'fill-[#0ea5e9] text-[#0ea5e9]' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <!-- Floating Rating Pill -->
          <div class="absolute bottom-2 left-2 z-10">
            <div class="rating-pill">
              <span>${product.rating}</span>
              <span class="rating-star-icon">★</span>
              <span class="text-slate-300 font-normal">|</span>
              <span class="text-[10px] text-slate-500 font-medium">${product.ratingCount}</span>
            </div>
          </div>

          <!-- Desktop Quick Add-to-Bag on Hover -->
          <div class="hidden md:flex absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xs p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 items-center justify-center border-t border-sky-100">
            <button 
              type="button" 
              onclick="event.stopPropagation(); openSizeModal(${product.id})"
              class="w-full py-1.5 px-3 bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold rounded tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>ADD TO BAG</span>
            </button>
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-2 sm:p-2.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate leading-tight uppercase">
              ${product.brand}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500 truncate font-normal mt-0.5" title="${product.title}">
              ${product.title}
            </p>
          </div>

          <div class="mt-1.5 sm:mt-2">
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-xs sm:text-sm font-black text-slate-900">
                ₹${product.price.toLocaleString('en-IN')}
              </span>
              <span class="text-[10px] sm:text-xs text-slate-400 line-through">
                ₹${product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span class="text-[10px] sm:text-xs font-bold text-[#0284c7]">
                (${product.discountPercentage}% OFF)
              </span>
            </div>

            <!-- Mobile Add-to-Bag Button -->
            <button 
              type="button" 
              onclick="openSizeModal(${product.id})" 
              class="md:hidden mt-2 w-full py-1 text-[11px] font-bold text-[#0284c7] hover:bg-sky-50 border border-sky-200 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ==========================================
// WISHLIST MANAGEMENT
// ==========================================
function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Removed from Wishlist', 'info');
  } else {
    wishlist.push(productId);
    isAdded = true;
    showToast('Saved to Wishlist! ❤️', 'success');
  }

  localStorage.setItem('sym_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('myntra_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  const badge = document.getElementById('wishlistBadge');
  const navBadge = document.getElementById('mobileWishlistNavBadge');
  const countHeader = document.getElementById('wishlistCountHeader');

  const count = wishlist.length;

  [badge, navBadge].forEach(b => {
    if (b) {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('scale-0');
        b.classList.add('scale-100');
      } else {
        b.classList.remove('scale-100');
        b.classList.add('scale-0');
      }
    }
  });

  if (countHeader) countHeader.textContent = count;

  // Update heart buttons on current product cards
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const pId = parseInt(btn.getAttribute('data-wishlist-id'));
    const svg = btn.querySelector('svg');
    if (wishlist.includes(pId)) {
      btn.classList.add('active');
      if (svg) {
        svg.classList.add('fill-[#0ea5e9]', 'text-[#0ea5e9]');
      }
    } else {
      btn.classList.remove('active');
      if (svg) {
        svg.classList.remove('fill-[#0ea5e9]', 'text-[#0ea5e9]');
      }
    }
  });

  renderWishlistDrawerItems();
}

function renderWishlistDrawerItems() {
  const container = document.getElementById('wishlistItemsList');
  const emptyView = document.getElementById('emptyWishlistView');
  if (!container) return;

  const items = allProducts.filter(p => wishlist.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyView) emptyView.classList.remove('hidden');
    return;
  }

  if (emptyView) emptyView.classList.add('hidden');

  container.innerHTML = items.map(item => `
    <div class="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 relative group">
      <div class="w-16 h-20 rounded bg-white overflow-hidden aspect-3-4 flex-shrink-0">
        <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x533/f0f9ff/0284c7?text=${encodeURIComponent(item.brand)}'"/>
      </div>
      <div class="flex-1 min-w-0">
        <h5 class="text-xs font-black text-[#0f172a] uppercase truncate">${item.brand}</h5>
        <p class="text-[11px] text-gray-500 truncate">${item.title}</p>
        <div class="flex items-baseline gap-1.5 mt-1">
          <span class="text-xs font-black text-[#0f172a]">₹${item.price.toLocaleString('en-IN')}</span>
          <span class="text-[10px] text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
          <span class="text-[10px] font-bold text-[#0284c7]">(${item.discountPercentage}% OFF)</span>
        </div>
        <button 
          type="button" 
          onclick="closeWishlistDrawer(); openSizeModal(${item.id});" 
          class="mt-2 text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] px-3 py-1 rounded shadow-xs"
        >
          MOVE TO BAG
        </button>
      </div>
      <button 
        type="button" 
        onclick="toggleWishlist(${item.id})" 
        class="text-gray-400 hover:text-red-500 p-1.5 self-start"
        aria-label="Remove from wishlist"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
}

// ==========================================
// SIZE SELECTION MODAL
// ==========================================
function openSizeModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  selectedSizeProduct = product;
  selectedSizeValue = null;

  document.getElementById('sizeModalImg').src = product.imageUrl;
  document.getElementById('sizeModalBrand').textContent = product.brand;
  document.getElementById('sizeModalTitle').textContent = product.title;
  document.getElementById('sizeModalPrice').textContent = `₹${product.price.toLocaleString('en-IN')}`;
  document.getElementById('sizeModalOriginalPrice').textContent = `₹${product.originalPrice.toLocaleString('en-IN')}`;
  document.getElementById('sizeModalDiscount').textContent = `(${product.discountPercentage}% OFF)`;

  const errorMsg = document.getElementById('sizeErrorMsg');
  if (errorMsg) errorMsg.classList.add('hidden');

  // Render size options
  const list = document.getElementById('sizeOptionsList');
  list.innerHTML = (product.sizes || ['S', 'M', 'L', 'XL']).map(size => `
    <button 
      type="button" 
      class="size-pill w-11 h-11 rounded-full border-2 border-gray-300 text-xs font-bold text-gray-800 hover:border-[#0284c7] flex items-center justify-center transition-all focus:outline-none"
      onclick="selectSizeValue('${size}', this)"
    >
      ${size}
    </button>
  `).join('');

  // Default select first size
  const firstPill = list.querySelector('.size-pill');
  if (firstPill) {
    selectSizeValue(product.sizes[0], firstPill);
  }

  // Open modal
  const modal = document.getElementById('sizeModal');
  const sheet = document.getElementById('sizeSheet');
  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  sheet.classList.remove('translate-y-full');
}

function selectSizeValue(size, buttonElem) {
  selectedSizeValue = size;
  const errorMsg = document.getElementById('sizeErrorMsg');
  if (errorMsg) errorMsg.classList.add('hidden');

  document.querySelectorAll('.size-pill').forEach(btn => {
    btn.classList.remove('border-[#0284c7]', 'bg-sky-50', 'text-[#0284c7]');
    btn.classList.add('border-gray-300', 'text-gray-800');
  });

  if (buttonElem) {
    buttonElem.classList.remove('border-gray-300', 'text-gray-800');
    buttonElem.classList.add('border-[#0284c7]', 'bg-sky-50', 'text-[#0284c7]');
  }
}

function closeSizeModal() {
  const modal = document.getElementById('sizeModal');
  const sheet = document.getElementById('sizeSheet');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0', 'pointer-events-none');
  sheet.classList.add('translate-y-full');
  selectedSizeProduct = null;
  selectedSizeValue = null;
}

function confirmAddBag() {
  if (!selectedSizeProduct) return;
  if (!selectedSizeValue) {
    const errorMsg = document.getElementById('sizeErrorMsg');
    if (errorMsg) errorMsg.classList.remove('hidden');
    return;
  }

  // Check if item with same ID and size exists
  const existingIndex = cart.findIndex(item => item.id === selectedSizeProduct.id && item.size === selectedSizeValue);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      cartItemId: `${selectedSizeProduct.id}-${selectedSizeValue}-${Date.now()}`,
      id: selectedSizeProduct.id,
      brand: selectedSizeProduct.brand,
      title: selectedSizeProduct.title,
      price: selectedSizeProduct.price,
      originalPrice: selectedSizeProduct.originalPrice,
      discountPercentage: selectedSizeProduct.discountPercentage,
      imageUrl: selectedSizeProduct.imageUrl,
      size: selectedSizeValue,
      quantity: 1
    });
  }

  localStorage.setItem('sym_cart', JSON.stringify(cart));
  localStorage.setItem('myntra_cart', JSON.stringify(cart));
  updateCartUI();
  closeSizeModal();
  showToast(`Added to Bag (Size ${selectedSizeValue})! 🛍️`, 'success');
  openCartDrawer();
}

// ==========================================
// SHOPPING BAG (CART) MANAGEMENT
// ==========================================
function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const navBadge = document.getElementById('mobileCartNavBadge');
  const countHeader = document.getElementById('cartCountHeader');

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  [badge, navBadge].forEach(b => {
    if (b) {
      b.textContent = totalQuantity;
      if (totalQuantity > 0) {
        b.classList.remove('scale-0');
        b.classList.add('scale-100');
      } else {
        b.classList.remove('scale-100');
        b.classList.add('scale-0');
      }
    }
  });

  if (countHeader) countHeader.textContent = totalQuantity;

  renderCartDrawerItems();
  calculatePriceBreakup();
}

function renderCartDrawerItems() {
  const container = document.getElementById('cartItemsList');
  const emptyView = document.getElementById('emptyCartView');
  const couponSection = document.getElementById('couponSection');
  const priceDetailsSection = document.getElementById('priceDetailsSection');
  const cartFooterCTA = document.getElementById('cartFooterCTA');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyView) emptyView.classList.remove('hidden');
    if (couponSection) couponSection.classList.add('hidden');
    if (priceDetailsSection) priceDetailsSection.classList.add('hidden');
    if (cartFooterCTA) cartFooterCTA.classList.add('hidden');
    return;
  }

  if (emptyView) emptyView.classList.add('hidden');
  if (couponSection) couponSection.classList.remove('hidden');
  if (priceDetailsSection) priceDetailsSection.classList.remove('hidden');
  if (cartFooterCTA) cartFooterCTA.classList.remove('hidden');

  container.innerHTML = cart.map(item => `
    <div class="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
      <div class="w-16 h-20 rounded bg-gray-50 overflow-hidden aspect-3-4 flex-shrink-0">
        <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x533/f0f9ff/0284c7?text=${encodeURIComponent(item.brand)}'"/>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div>
            <h5 class="text-xs font-black text-[#0f172a] uppercase truncate">${item.brand}</h5>
            <p class="text-[11px] text-gray-500 truncate max-w-[180px]">${item.title}</p>
          </div>
          <button 
            type="button" 
            onclick="removeCartItem('${item.cartItemId || item.id}')" 
            class="text-gray-400 hover:text-red-500 p-1"
            aria-label="Remove item"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Size: ${item.size}</span>
          <div class="flex items-center border border-gray-200 rounded">
            <button type="button" onclick="modifyCartQty('${item.cartItemId || item.id}', -1)" class="w-5 h-5 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100">-</button>
            <span class="px-2 text-xs font-bold text-gray-800">${item.quantity}</span>
            <button type="button" onclick="modifyCartQty('${item.cartItemId || item.id}', 1)" class="w-5 h-5 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100">+</button>
          </div>
        </div>

        <div class="flex items-baseline gap-1.5 mt-2">
          <span class="text-xs font-black text-[#0f172a]">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          <span class="text-[10px] text-gray-400 line-through">₹${(item.originalPrice * item.quantity).toLocaleString('en-IN')}</span>
          <span class="text-[10px] font-bold text-[#0284c7]">(${item.discountPercentage}% OFF)</span>
        </div>
      </div>
    </div>
  `).join('');
}

function modifyCartQty(cartItemId, delta) {
  const index = cart.findIndex(i => (i.cartItemId === cartItemId || String(i.id) === String(cartItemId)));
  if (index === -1) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
    showToast('Item removed from Bag', 'info');
  }

  localStorage.setItem('sym_cart', JSON.stringify(cart));
  localStorage.setItem('myntra_cart', JSON.stringify(cart));
  updateCartUI();
}

function removeCartItem(cartItemId) {
  cart = cart.filter(i => (i.cartItemId !== cartItemId && String(i.id) !== String(cartItemId)));
  localStorage.setItem('sym_cart', JSON.stringify(cart));
  localStorage.setItem('myntra_cart', JSON.stringify(cart));
  updateCartUI();
  showToast('Item removed from Bag', 'info');
}

function calculatePriceBreakup() {
  const totalMRP = cart.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscountedPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountOnMRP = totalMRP - totalDiscountedPrice;

  let couponDiscount = 0;
  if ((appliedCouponCode === 'MOOD300' || appliedCouponCode === 'STYLE300' || appliedCouponCode === 'MYNTRA300') && totalDiscountedPrice >= 999) {
    couponDiscount = 300;
  } else if (appliedCouponCode === 'MOOD100' || appliedCouponCode === 'STYLE100' || appliedCouponCode === 'MYNTRA100') {
    couponDiscount = Math.round(totalDiscountedPrice * 0.10);
  }

  const finalPayable = Math.max(0, totalDiscountedPrice - couponDiscount);

  // Update DOM elements
  const elemTotalMRP = document.getElementById('summaryTotalMRP');
  const elemDiscountMRP = document.getElementById('summaryDiscountMRP');
  const elemCouponDiscount = document.getElementById('summaryCouponDiscount');
  const elemPayableTotal = document.getElementById('summaryPayableTotal');
  const elemFooterTotal = document.getElementById('cartFooterTotal');

  if (elemTotalMRP) elemTotalMRP.textContent = `₹${totalMRP.toLocaleString('en-IN')}`;
  if (elemDiscountMRP) elemDiscountMRP.textContent = `- ₹${discountOnMRP.toLocaleString('en-IN')}`;
  if (elemCouponDiscount) elemCouponDiscount.textContent = `- ₹${couponDiscount.toLocaleString('en-IN')}`;
  if (elemPayableTotal) elemPayableTotal.textContent = `₹${finalPayable.toLocaleString('en-IN')}`;
  if (elemFooterTotal) elemFooterTotal.textContent = `₹${finalPayable.toLocaleString('en-IN')}`;
}

function setPromoAndApply(code) {
  const input = document.getElementById('couponInput');
  if (input) input.value = code;
  applyPromoCoupon();
}

function copyPromoCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Coupon code ${code} copied!`, 'success');
  }).catch(() => {
    showToast(`Code: ${code}`, 'info');
  });
}

function applyPromoCoupon() {
  const input = document.getElementById('couponInput');
  const code = input ? input.value.trim().toUpperCase() : '';
  const badge = document.getElementById('couponAppliedBadge');

  if (!code) {
    showToast('Please enter a coupon code', 'error');
    return;
  }

  const valid300 = ['MOOD300', 'STYLE300', 'MYNTRA300'];
  const valid100 = ['MOOD100', 'STYLE100', 'MYNTRA100'];

  if (valid300.includes(code) || valid100.includes(code)) {
    appliedCouponCode = code;
    if (badge) badge.classList.remove('hidden');
    calculatePriceBreakup();
    showToast(`Promo ${code} applied successfully! 🎉`, 'success');
  } else {
    showToast('Invalid coupon code. Try MOOD300', 'error');
  }
}

function proceedToCheckout() {
  if (cart.length === 0) return;

  showToast('🎉 Order Placed Successfully! Your delivery is on the way!', 'success');
  
  // Clear cart
  cart = [];
  appliedCouponCode = null;
  localStorage.setItem('sym_cart', JSON.stringify([]));
  localStorage.setItem('myntra_cart', JSON.stringify([]));
  updateCartUI();

  setTimeout(() => {
    closeCartDrawer();
  }, 1800);
}

// ==========================================
// MODAL & DRAWER TOGGLES
// ==========================================
function openSortModal() {
  const modal = document.getElementById('sortModal');
  const sheet = document.getElementById('sortSheet');
  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  sheet.classList.remove('translate-y-full');
}

function closeSortModal() {
  const modal = document.getElementById('sortModal');
  const sheet = document.getElementById('sortSheet');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0', 'pointer-events-none');
  sheet.classList.add('translate-y-full');
}

function openFilterModal() {
  const modal = document.getElementById('filterModal');
  const sheet = document.getElementById('filterSheet');
  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  sheet.classList.remove('translate-y-full', 'md:translate-x-full');
}

function closeFilterModal() {
  const modal = document.getElementById('filterModal');
  const sheet = document.getElementById('filterSheet');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0', 'pointer-events-none');
  sheet.classList.add('translate-y-full', 'md:translate-x-full');
}

function switchFilterTab(tabName) {
  // Update left tab buttons
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.classList.remove('active', 'border-[#0284c7]', 'bg-white', 'text-[#0284c7]');
    btn.classList.add('border-transparent', 'text-gray-600');
  });

  event.currentTarget.classList.add('active', 'border-[#0284c7]', 'bg-white', 'text-[#0284c7]');
  event.currentTarget.classList.remove('border-transparent', 'text-gray-600');

  // Toggle right panels
  document.querySelectorAll('.filter-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`panel-${tabName}`);
  if (activePanel) activePanel.classList.remove('hidden');
}

function clearAllFilters() {
  document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="filterBrand"]').forEach(cb => cb.checked = false);
  
  const priceDefault = document.querySelector('input[name="filterPrice"][value="all"]');
  if (priceDefault) priceDefault.checked = true;

  const discDefault = document.querySelector('input[name="filterDiscount"][value="0"]');
  if (discDefault) discDefault.checked = true;

  activeCategory = 'all';
  document.querySelectorAll('.category-item').forEach(i => {
    if (i.getAttribute('data-category') === 'all') i.classList.add('active');
    else i.classList.remove('active');
  });

  filterProductsLive();
  closeFilterModal();
  showToast('Filters cleared', 'info');
}

function applySelectedFilters() {
  filterProductsLive();
  closeFilterModal();
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const panel = document.getElementById('cartPanel');
  drawer.classList.remove('pointer-events-none', 'opacity-0');
  drawer.classList.add('opacity-100');
  panel.classList.remove('translate-x-full');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const panel = document.getElementById('cartPanel');
  if (!drawer) return;
  drawer.classList.remove('opacity-100');
  drawer.classList.add('opacity-0', 'pointer-events-none');
  panel.classList.add('translate-x-full');
}

function openWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const panel = document.getElementById('wishlistPanel');
  drawer.classList.remove('pointer-events-none', 'opacity-0');
  drawer.classList.add('opacity-100');
  panel.classList.remove('translate-x-full');
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const panel = document.getElementById('wishlistPanel');
  if (!drawer) return;
  drawer.classList.remove('opacity-100');
  drawer.classList.add('opacity-0', 'pointer-events-none');
  panel.classList.add('translate-x-full');
}

function openMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const panel = document.getElementById('mobileMenuPanel');
  menu.classList.remove('pointer-events-none', 'opacity-0');
  menu.classList.add('opacity-100');
  panel.classList.remove('-translate-x-full');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const panel = document.getElementById('mobileMenuPanel');
  if (!menu) return;
  menu.classList.remove('opacity-100');
  menu.classList.add('opacity-0', 'pointer-events-none');
  panel.classList.add('-translate-x-full');
}

function showSizeChartToast() {
  showToast('Standard Asian Sizing: S(38), M(40), L(42), XL(44)', 'info');
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-[#0f172a] text-white border-l-4 border-emerald-400' : 
                  type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0f172a] text-white border-l-4 border-[#0284c7]';

  toast.className = `${bgClass} px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold tracking-wide flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Animate out & remove
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}


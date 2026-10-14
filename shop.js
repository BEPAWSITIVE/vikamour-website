/**
 * VIKAMOUR Atelier - Shop & Collection Page Logic
 * Provides comprehensive e-commerce filters: Category, Price Slider,
 * Color Palette, Sizes, Fabrics, Occasions, Sorting, In-Shop Search,
 * Active Filter Chips, Quick View Modal, Cart Drawer, Wishlist, and Checkout.
 */

// Global Shop State
const shopState = {
  products: [...VIKAMOUR_PRODUCTS],
  filteredProducts: [...VIKAMOUR_PRODUCTS],
  filters: {
    category: 'all',
    priceMin: 999,
    priceMax: 6000,
    priceBracket: 'all',
    sizes: [],
    colors: [],
    fabrics: [],
    occasions: [],
    discount: 'all',
    searchQuery: '',
    sortBy: 'featured',
    gridCols: 3
  },
  currency: localStorage.getItem('vikamour_currency') || 'INR',
  cart: JSON.parse(localStorage.getItem('vikamour_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('vikamour_wishlist')) || [],
  promoCode: null,
  activeModalProduct: null,
  modalSelectedSize: null,
  modalSelectedColor: null,
  modalActiveImageIndex: 0,
  checkoutStep: 1
};

// Available Promo Codes (INR based)
const VALID_PROMOS = {
  'VIKA10': { type: 'percent', value: 10, label: '10% First Order Privilege' },
  'WELCOME20': { type: 'percent', value: 20, label: '20% Welcome Privilege' },
  'ATELIER2500': { type: 'flat', value: 2500, minOrder: 20000, label: '₹2,500 Atelier VIP Credit' }
};

// -----------------------------------------------------------------------------
// Currency Formatting Utility
// -----------------------------------------------------------------------------
function formatPrice(amountInINR) {
  if (amountInINR === null || amountInINR === undefined) return '';
  const curr = CURRENCIES[shopState.currency] || CURRENCIES.INR;
  const converted = amountInINR * curr.rate;
  
  if (shopState.currency === 'INR') {
    return `${curr.symbol} ${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${curr.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initCurrencySelector();
  initHeaderScroll();
  parseUrlFilters();
  initSidebarCategoryFilters();
  initPriceFilters();
  initColorFilters();
  initSizeFilters();
  initFabricFilters();
  initOccasionFilters();
  initDiscountFilters();
  initShopSearch();
  initShopSorting();
  initGridSwitcher();
  initMobileFilterDrawer();
  applyFilters();
  updateCartCounters();
  updateWishlistCounters();
  setupDrawersAndModals();
  setupCheckoutFlow();
  setupAiStylistShop();
});

// -----------------------------------------------------------------------------
// URL Query Parameter Parsing
// -----------------------------------------------------------------------------
function parseUrlFilters() {
  const params = new URLSearchParams(window.location.search);

  // Category (e.g. ?category=sale999, kurtas, dresses)
  const cat = params.get('category');
  if (cat) {
    shopState.filters.category = cat;
  }

  // Search query
  const q = params.get('search');
  if (q) {
    shopState.filters.searchQuery = q.toLowerCase();
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
      searchInput.value = q;
      document.getElementById('shopSearchClear').classList.add('visible');
    }
  }

  // Fabric
  const fabric = params.get('fabric');
  if (fabric) {
    shopState.filters.fabrics = [fabric];
  }

  // Occasion
  const occasion = params.get('occasion');
  if (occasion) {
    shopState.filters.occasions = [occasion];
  }

  // Shade / Color
  const color = params.get('color');
  if (color) {
    shopState.filters.colors = [color.toLowerCase()];
  }

  // Max Price
  const maxP = params.get('maxPrice');
  if (maxP) {
    shopState.filters.priceMax = Number(maxP);
  }
}

// -----------------------------------------------------------------------------
// Header & Navigation Handlers
// -----------------------------------------------------------------------------
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileClose = document.getElementById('mobileDrawerClose');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      if (drawerBackdrop) drawerBackdrop.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeAllDrawers);
  }
}

function initCurrencySelector() {
  const select = document.getElementById('currencySelect');
  if (!select) return;

  select.value = shopState.currency;
  select.addEventListener('change', (e) => {
    shopState.currency = e.target.value;
    localStorage.setItem('vikamour_currency', shopState.currency);
    renderProducts();
    renderCart();
    renderWishlist();
    if (shopState.activeModalProduct) {
      renderModalDetails(shopState.activeModalProduct);
    }
    showToast(`Currency updated to ${shopState.currency}`, 'info');
  });
}

// -----------------------------------------------------------------------------
// Filter Controls Initializers
// -----------------------------------------------------------------------------
function initSidebarCategoryFilters() {
  // Sync Category Radio Buttons (Desktop & Mobile Drawer)
  const radioInputs = document.querySelectorAll('input[name="categoryFilter"], input[name="categoryFilterMobile"]');
  radioInputs.forEach(input => {
    if (input.value === shopState.filters.category) {
      input.checked = true;
    }
    input.addEventListener('change', () => {
      shopState.filters.category = input.value;
      syncCategoryUI();
      applyFilters();
    });
  });

  // Sync Category Pill Buttons in Hero
  const pillBtns = document.querySelectorAll('.shop-pill-btn');
  pillBtns.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      shopState.filters.category = pill.dataset.category;
      syncCategoryUI();
      applyFilters();
    });
  });

  syncCategoryUI();
}

function syncCategoryUI() {
  // Update Pills
  document.querySelectorAll('.shop-pill-btn').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === shopState.filters.category);
  });

  // Update Radios in desktop and mobile drawer
  document.querySelectorAll('input[name="categoryFilter"], input[name="categoryFilterMobile"]').forEach(input => {
    input.checked = (input.value === shopState.filters.category);
  });

  // Update Hero Titles dynamically
  const titleEl = document.getElementById('shopHeroTitle');
  const breadcrumbCurrent = document.getElementById('shopBreadcrumbCurrent');
  const catNames = {
    'all': 'All Festive & Everyday Creations',
    'sale999': '🔥 Flat ₹999 Festive Sale Deals',
    'kurtas': 'Kurtas & Kurtis Collection',
    'ethnic-sets-dupatta': 'Ethnic Sets with Dupatta',
    'ethnic-sets': 'Ethnic Sets (Kurta + Bottom)',
    'co-ords': 'Contemporary Indo-Western Co-Ords',
    'dresses': 'Festive Maxi Dresses & Anarkalis'
  };

  const currentLabel = catNames[shopState.filters.category] || 'Curated Collection';
  if (titleEl) titleEl.textContent = currentLabel;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = currentLabel;
}

function initPriceFilters() {
  const slider = document.getElementById('priceRangeSlider');
  const currentIndicator = document.getElementById('currentPriceCap');
  const bracketBtns = document.querySelectorAll('.price-bracket-btn');

  if (slider) {
    slider.value = shopState.filters.priceMax;
    if (currentIndicator) currentIndicator.textContent = formatPrice(shopState.filters.priceMax);

    slider.addEventListener('input', (e) => {
      shopState.filters.priceMax = Number(e.target.value);
      shopState.filters.priceBracket = 'custom';
      if (currentIndicator) currentIndicator.textContent = formatPrice(shopState.filters.priceMax);
      bracketBtns.forEach(b => b.classList.remove('active'));
      applyFilters();
    });
  }

  // Quick Price Brackets
  bracketBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bracketBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const bracket = btn.dataset.bracket;
      shopState.filters.priceBracket = bracket;

      if (bracket === 'all') {
        shopState.filters.priceMin = 999;
        shopState.filters.priceMax = 6000;
      } else if (bracket === 'under1000') {
        shopState.filters.priceMin = 0;
        shopState.filters.priceMax = 1000;
      } else if (bracket === '1000-2000') {
        shopState.filters.priceMin = 1000;
        shopState.filters.priceMax = 2000;
      } else if (bracket === '2000-3500') {
        shopState.filters.priceMin = 2000;
        shopState.filters.priceMax = 3500;
      } else if (bracket === 'above3500') {
        shopState.filters.priceMin = 3500;
        shopState.filters.priceMax = 10000;
      }

      if (slider) {
        slider.value = Math.min(6000, shopState.filters.priceMax);
        if (currentIndicator) currentIndicator.textContent = formatPrice(shopState.filters.priceMax);
      }

      applyFilters();
    });
  });
}

function initColorFilters() {
  const swatchRows = document.querySelectorAll('.color-swatch-row');
  swatchRows.forEach(row => {
    const color = row.dataset.color.toLowerCase();
    if (shopState.filters.colors.includes(color)) {
      row.classList.add('active');
    }

    row.addEventListener('click', () => {
      const idx = shopState.filters.colors.indexOf(color);
      if (idx > -1) {
        shopState.filters.colors.splice(idx, 1);
        row.classList.remove('active');
      } else {
        shopState.filters.colors.push(color);
        row.classList.add('active');
      }
      applyFilters();
    });
  });
}

function initSizeFilters() {
  const sizeBtns = document.querySelectorAll('.filter-size-toggle-btn');
  sizeBtns.forEach(btn => {
    const size = btn.dataset.size;
    if (shopState.filters.sizes.includes(size)) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      const idx = shopState.filters.sizes.indexOf(size);
      if (idx > -1) {
        shopState.filters.sizes.splice(idx, 1);
        btn.classList.remove('selected');
      } else {
        shopState.filters.sizes.push(size);
        btn.classList.add('selected');
      }
      applyFilters();
    });
  });
}

function initFabricFilters() {
  const fabricCheckboxes = document.querySelectorAll('input[name="fabricFilter"]');
  fabricCheckboxes.forEach(cb => {
    if (shopState.filters.fabrics.includes(cb.value)) {
      cb.checked = true;
    }
    cb.addEventListener('change', () => {
      if (cb.checked) {
        shopState.filters.fabrics.push(cb.value);
      } else {
        shopState.filters.fabrics = shopState.filters.fabrics.filter(f => f !== cb.value);
      }
      applyFilters();
    });
  });
}

function initOccasionFilters() {
  const occasionCheckboxes = document.querySelectorAll('input[name="occasionFilter"]');
  occasionCheckboxes.forEach(cb => {
    if (shopState.filters.occasions.includes(cb.value)) {
      cb.checked = true;
    }
    cb.addEventListener('change', () => {
      if (cb.checked) {
        shopState.filters.occasions.push(cb.value);
      } else {
        shopState.filters.occasions = shopState.filters.occasions.filter(o => o !== cb.value);
      }
      applyFilters();
    });
  });
}

function initDiscountFilters() {
  const discountRadios = document.querySelectorAll('input[name="discountFilter"]');
  discountRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      shopState.filters.discount = radio.value;
      applyFilters();
    });
  });
}

function initShopSearch() {
  const searchInput = document.getElementById('shopSearchInput');
  const clearBtn = document.getElementById('shopSearchClear');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      shopState.filters.searchQuery = e.target.value.trim().toLowerCase();
      clearBtn.classList.toggle('visible', shopState.filters.searchQuery.length > 0);
      applyFilters();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      shopState.filters.searchQuery = '';
      clearBtn.classList.remove('visible');
      applyFilters();
    });
  }
}

function initShopSorting() {
  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) {
    sortSelect.value = shopState.filters.sortBy;
    sortSelect.addEventListener('change', (e) => {
      shopState.filters.sortBy = e.target.value;
      applyFilters();
    });
  }
}

function initGridSwitcher() {
  const gridBtns = document.querySelectorAll('.grid-col-btn');
  const grid = document.getElementById('shopProductsGrid');

  gridBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gridBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cols = Number(btn.dataset.cols);
      shopState.filters.gridCols = cols;

      if (grid) {
        grid.classList.toggle('grid-4-cols', cols === 4);
        grid.classList.toggle('grid-2-cols', cols === 2);
      }
    });
  });
}

function initMobileFilterDrawer() {
  const openBtn = document.getElementById('mobileFilterOpenBtn');
  const closeBtn = document.getElementById('mobileFilterCloseBtn');
  const applyBtn = document.getElementById('mobileFilterApplyBtn');
  const drawer = document.getElementById('mobileFilterDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  if (openBtn && drawer) {
    openBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (applyBtn) applyBtn.addEventListener('click', closeDrawer);
}

// -----------------------------------------------------------------------------
// Core Filtering Engine
// -----------------------------------------------------------------------------
function applyFilters() {
  let list = [...shopState.products];

  // 1. Category Filter
  if (shopState.filters.category !== 'all') {
    if (shopState.filters.category === 'sale999') {
      list = list.filter(item => item.isSale999 === true || item.price <= 999);
    } else {
      list = list.filter(item => item.category === shopState.filters.category);
    }
  }

  // 2. Price Bracket / Slider Filter
  list = list.filter(item => {
    return item.price >= shopState.filters.priceMin && item.price <= shopState.filters.priceMax;
  });

  // 3. Sizes Filter (Multi-select: item must include any of selected sizes)
  if (shopState.filters.sizes.length > 0) {
    list = list.filter(item => 
      shopState.filters.sizes.some(sz => item.sizes.includes(sz))
    );
  }

  // 4. Colors Filter (Multi-select)
  if (shopState.filters.colors.length > 0) {
    list = list.filter(item => 
      item.colors.some(c => 
        shopState.filters.colors.some(targetColor => 
          c.name.toLowerCase().includes(targetColor)
        )
      )
    );
  }

  // 5. Fabric Filter (Multi-select)
  if (shopState.filters.fabrics.length > 0) {
    list = list.filter(item => 
      shopState.filters.fabrics.includes(item.fabric)
    );
  }

  // 6. Occasion Filter (Multi-select)
  if (shopState.filters.occasions.length > 0) {
    list = list.filter(item => 
      shopState.filters.occasions.includes(item.occasion)
    );
  }

  // 7. Discount Filter
  if (shopState.filters.discount !== 'all') {
    if (shopState.filters.discount === 'sale999') {
      list = list.filter(item => item.isSale999 || item.price <= 999);
    } else {
      const minDisc = Number(shopState.filters.discount);
      list = list.filter(item => {
        const disc = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        return disc >= minDisc;
      });
    }
  }

  // 8. Search Query
  if (shopState.filters.searchQuery) {
    const q = shopState.filters.searchQuery;
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.fabricLabel.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  // 9. Sorting
  switch (shopState.filters.sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'discount':
      list.sort((a, b) => {
        const discA = ((a.originalPrice - a.price) / a.originalPrice);
        const discB = ((b.originalPrice - b.price) / b.originalPrice);
        return discB - discA;
      });
      break;
    case 'featured':
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  shopState.filteredProducts = list;
  renderProducts();
  renderActiveFilterChips();
  updateSidebarCounts();
}

// -----------------------------------------------------------------------------
// Active Filter Chips & Clear All
// -----------------------------------------------------------------------------
function renderActiveFilterChips() {
  const container = document.getElementById('shopActiveChipsStrip');
  if (!container) return;

  const chips = [];

  // Category
  if (shopState.filters.category !== 'all') {
    const catLabel = shopState.filters.category === 'sale999' ? '🔥 Flat ₹999 Sale' : `Category: ${shopState.filters.category}`;
    chips.push({
      label: catLabel,
      clear: () => {
        shopState.filters.category = 'all';
        syncCategoryUI();
        applyFilters();
      }
    });
  }

  // Price Bracket / Slider
  if (shopState.filters.priceMax < 6000 || shopState.filters.priceMin > 999) {
    chips.push({
      label: `Price: ${formatPrice(shopState.filters.priceMin)} - ${formatPrice(shopState.filters.priceMax)}`,
      clear: () => {
        shopState.filters.priceMin = 999;
        shopState.filters.priceMax = 6000;
        shopState.filters.priceBracket = 'all';
        const slider = document.getElementById('priceRangeSlider');
        if (slider) slider.value = 6000;
        const ind = document.getElementById('currentPriceCap');
        if (ind) ind.textContent = formatPrice(6000);
        document.querySelectorAll('.price-bracket-btn').forEach(b => b.classList.toggle('active', b.dataset.bracket === 'all'));
        applyFilters();
      }
    });
  }

  // Sizes
  shopState.filters.sizes.forEach(sz => {
    chips.push({
      label: `Size: ${sz}`,
      clear: () => {
        shopState.filters.sizes = shopState.filters.sizes.filter(s => s !== sz);
        document.querySelectorAll(`.filter-size-toggle-btn[data-size="${sz}"]`).forEach(b => b.classList.remove('selected'));
        applyFilters();
      }
    });
  });

  // Colors
  shopState.filters.colors.forEach(col => {
    chips.push({
      label: `Shade: ${col.toUpperCase()}`,
      clear: () => {
        shopState.filters.colors = shopState.filters.colors.filter(c => c !== col);
        document.querySelectorAll(`.color-swatch-row[data-color="${col}"]`).forEach(r => r.classList.remove('active'));
        applyFilters();
      }
    });
  });

  // Fabrics
  shopState.filters.fabrics.forEach(fab => {
    chips.push({
      label: `Fabric: ${fab.replace('-', ' ').toUpperCase()}`,
      clear: () => {
        shopState.filters.fabrics = shopState.filters.fabrics.filter(f => f !== fab);
        document.querySelectorAll(`input[name="fabricFilter"][value="${fab}"]`).forEach(cb => cb.checked = false);
        applyFilters();
      }
    });
  });

  // Occasions
  shopState.filters.occasions.forEach(occ => {
    chips.push({
      label: `Occasion: ${occ.toUpperCase()}`,
      clear: () => {
        shopState.filters.occasions = shopState.filters.occasions.filter(o => o !== occ);
        document.querySelectorAll(`input[name="occasionFilter"][value="${occ}"]`).forEach(cb => cb.checked = false);
        applyFilters();
      }
    });
  });

  // Discount
  if (shopState.filters.discount !== 'all') {
    chips.push({
      label: `Discount: ${shopState.filters.discount}%+`,
      clear: () => {
        shopState.filters.discount = 'all';
        document.querySelectorAll('input[name="discountFilter"]').forEach(r => r.checked = (r.value === 'all'));
        applyFilters();
      }
    });
  }

  // Search
  if (shopState.filters.searchQuery) {
    chips.push({
      label: `Search: "${shopState.filters.searchQuery}"`,
      clear: () => {
        shopState.filters.searchQuery = '';
        const input = document.getElementById('shopSearchInput');
        if (input) input.value = '';
        document.getElementById('shopSearchClear').classList.remove('visible');
        applyFilters();
      }
    });
  }

  // Update badge count
  const badge = document.getElementById('activeFiltersCountBadge');
  if (badge) {
    badge.textContent = chips.length;
    badge.style.display = chips.length > 0 ? 'inline-block' : 'none';
  }

  if (chips.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = chips.map((c, i) => `
    <span class="shop-chip-tag">
      ${c.label}
      <button class="shop-chip-remove-btn" data-chip-idx="${i}" title="Remove filter">&times;</button>
    </span>
  `).join('') + `
    <button class="shop-clear-all-text-btn" id="shopClearAllBtn">Clear All</button>
  `;

  // Attach individual chip listeners
  container.querySelectorAll('button[data-chip-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.chipIdx);
      if (chips[idx]) chips[idx].clear();
    });
  });

  const clearAllBtn = document.getElementById('shopClearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', resetAllShopFilters);
  }

  // Sidebar Clear Button
  const sidebarClear = document.getElementById('sidebarClearBtn');
  if (sidebarClear) {
    sidebarClear.onclick = resetAllShopFilters;
  }
}

function resetAllShopFilters() {
  shopState.filters = {
    category: 'all',
    priceMin: 999,
    priceMax: 6000,
    priceBracket: 'all',
    sizes: [],
    colors: [],
    fabrics: [],
    occasions: [],
    discount: 'all',
    searchQuery: '',
    sortBy: 'featured',
    gridCols: shopState.filters.gridCols
  };

  syncCategoryUI();

  // Reset sliders
  const slider = document.getElementById('priceRangeSlider');
  if (slider) slider.value = 6000;
  const ind = document.getElementById('currentPriceCap');
  if (ind) ind.textContent = formatPrice(6000);
  document.querySelectorAll('.price-bracket-btn').forEach(b => b.classList.toggle('active', b.dataset.bracket === 'all'));

  // Reset toggles
  document.querySelectorAll('.filter-size-toggle-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.color-swatch-row').forEach(r => r.classList.remove('active'));
  document.querySelectorAll('input[name="fabricFilter"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="occasionFilter"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="discountFilter"]').forEach(r => r.checked = (r.value === 'all'));

  // Reset search & sort
  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) searchInput.value = '';
  const searchClear = document.getElementById('shopSearchClear');
  if (searchClear) searchClear.classList.remove('visible');
  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  applyFilters();
  showToast('All filters have been reset', 'info');
}

function updateSidebarCounts() {
  // Update category counts
  const catCounts = {
    all: shopState.products.length,
    sale999: shopState.products.filter(p => p.isSale999 || p.price <= 999).length,
    kurtas: shopState.products.filter(p => p.category === 'kurtas').length,
    'ethnic-sets-dupatta': shopState.products.filter(p => p.category === 'ethnic-sets-dupatta').length,
    'ethnic-sets': shopState.products.filter(p => p.category === 'ethnic-sets').length,
    'co-ords': shopState.products.filter(p => p.category === 'co-ords').length,
    dresses: shopState.products.filter(p => p.category === 'dresses').length
  };

  for (const [cat, count] of Object.entries(catCounts)) {
    const countEl = document.getElementById(`catCount-${cat}`);
    if (countEl) countEl.textContent = `(${count})`;
  }
}

// -----------------------------------------------------------------------------
// Product Card Rendering
// -----------------------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById('shopProductsGrid');
  const countEl = document.getElementById('shopResultsCount');
  const emptyState = document.getElementById('shopEmptyState');

  if (!grid) return;

  if (countEl) {
    countEl.textContent = shopState.filteredProducts.length;
  }

  if (shopState.filteredProducts.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = shopState.filteredProducts.map(product => {
    const isWishlisted = shopState.wishlist.some(id => id === product.id);
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return `
      <article class="product-card" data-product-id="${product.id}">
        
        <!-- Media Wrap -->
        <div class="product-image-container" onclick="openProductModal('${product.id}')">
          <img class="product-image-primary" src="${product.images[0]}" alt="${product.name}" loading="lazy" />
          ${product.images[1] ? `<img class="product-image-secondary" src="${product.images[1]}" alt="${product.name} back angle" loading="lazy" />` : ''}
          
          <!-- Badges -->
          <div class="product-badges-cluster">
            ${product.isSale999 
              ? `<span class="product-badge-tag sale-tag">FLAT ₹999</span>` 
              : product.badge 
                ? `<span class="product-badge-tag">${product.badge}</span>` 
                : ''}
            ${discountPercent > 0 ? `<span class="product-badge-tag discount-tag">${discountPercent}% OFF</span>` : ''}
          </div>

          <!-- Quick Action Wishlist -->
          <button class="product-wishlist-toggle ${isWishlisted ? 'active' : ''}" 
                  onclick="event.stopPropagation(); toggleWishlist('${product.id}')" 
                  aria-label="Save to Wishlist" 
                  title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <!-- Quick View Pill Overlay -->
          <button class="card-quick-view-btn" onclick="event.stopPropagation(); openProductModal('${product.id}')">
            Quick View
          </button>
        </div>

        <!-- Product Information Body -->
        <div class="product-info-body">
          <div class="product-brand-kicker">${product.fabricLabel} • ${product.occasionLabel}</div>
          
          <h3 class="product-title" onclick="openProductModal('${product.id}')" title="${product.name}">
            ${product.name}
          </h3>
          
          <p class="product-subtitle">${product.subtitle}</p>

          <!-- Price Row -->
          <div class="product-price-row">
            <span class="product-current-price">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="product-original-price">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>

          <!-- Rating Stars -->
          <div class="product-rating-line">
            <span class="star-filled">★</span>
            <span class="rating-val">${product.rating}</span>
            <span class="rating-sep">•</span>
            <span class="review-total">(${product.reviewCount} verified)</span>
          </div>

          <!-- Card Swatches & Direct Add -->
          <div class="product-card-footer">
            <div class="card-swatches-strip">
              ${product.colors.map(c => `
                <span class="card-swatch-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
              `).join('')}
            </div>

            <button class="card-add-to-bag-btn" onclick="quickAddToCart('${product.id}')" aria-label="Add ${product.name} to bag">
              Add to Bag
            </button>
          </div>

        </div>

      </article>
    `;
  }).join('');
}

// -----------------------------------------------------------------------------
// Cart & Wishlist Shared Utilities
// -----------------------------------------------------------------------------
function quickAddToCart(productId) {
  const product = shopState.products.find(p => p.id === productId);
  if (!product) return;

  const defaultSize = product.sizes[0] || 'M';
  const defaultColor = product.colors[0] || { name: 'Standard', hex: '#111' };

  addToCart(product, defaultSize, defaultColor, 1);
}

function addToCart(product, size, color, quantity = 1) {
  const existingIdx = shopState.cart.findIndex(item => 
    item.productId === product.id && item.size === size && item.color.name === color.name
  );

  if (existingIdx > -1) {
    shopState.cart[existingIdx].quantity += quantity;
  } else {
    shopState.cart.push({
      cartItemId: `${product.id}-${size}-${color.name}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: size,
      color: color,
      image: product.images[0],
      quantity: quantity
    });
  }

  saveCart();
  updateCartCounters();
  renderCart();
  showToast(`Added to your shopping bag: ${product.name}`, 'success');
}

function updateCartItemQuantity(cartItemId, delta) {
  const item = shopState.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    shopState.cart = shopState.cart.filter(i => i.cartItemId !== cartItemId);
    showToast(`Removed from bag`, 'info');
  }

  saveCart();
  updateCartCounters();
  renderCart();
}

function removeCartItem(cartItemId) {
  shopState.cart = shopState.cart.filter(i => i.cartItemId !== cartItemId);
  saveCart();
  updateCartCounters();
  renderCart();
  showToast('Garment removed from bag', 'info');
}

function saveCart() {
  localStorage.setItem('vikamour_cart', JSON.stringify(shopState.cart));
}

function updateCartCounters() {
  const count = shopState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadgeCount');
  if (badge) {
    badge.textContent = count;
    badge.classList.add('pulse');
    setTimeout(() => badge.classList.remove('pulse'), 400);
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const emptyState = document.getElementById('cartEmptyState');
  const footer = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotalAmount');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountVal = document.getElementById('cartDiscountValue');
  const shippingVal = document.getElementById('cartShippingValue');
  const taxVal = document.getElementById('cartTaxValue');
  const totalVal = document.getElementById('cartTotalAmount');
  const shippingProgressBar = document.getElementById('shippingProgressBar');
  const shippingMeterText = document.getElementById('shippingMeterText');

  if (!container) return;

  if (shopState.cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (footer) footer.style.display = 'block';

  // Render items
  container.innerHTML = shopState.cart.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-thumb">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="cart-item-details">
        <div class="cart-item-header">
          <h4 class="cart-item-title">${item.name}</h4>
          <button class="cart-item-remove-btn" onclick="removeCartItem('${item.cartItemId}')" title="Remove">&times;</button>
        </div>
        <div class="cart-item-meta">
          <span>Size: ${item.size}</span>
          <span>•</span>
          <span>Shade: ${item.color.name}</span>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)">&minus;</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)">&plus;</button>
          </div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = shopState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;

  if (shopState.promoCode) {
    if (shopState.promoCode.type === 'percent') {
      discountAmount = rawSubtotal * (shopState.promoCode.value / 100);
    } else if (shopState.promoCode.type === 'flat') {
      discountAmount = shopState.promoCode.value;
    }
  }

  const freeShippingThresholdINR = 1499;
  const isFreeShipping = rawSubtotal >= freeShippingThresholdINR;
  const shippingCost = isFreeShipping ? 0 : 99;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const tax = taxableAmount * 0.12;
  const grandTotal = taxableAmount + shippingCost + tax;

  // Free Shipping Progress
  if (shippingProgressBar && shippingMeterText) {
    const percent = Math.min(100, Math.round((rawSubtotal / freeShippingThresholdINR) * 100));
    shippingProgressBar.style.width = `${percent}%`;

    if (isFreeShipping) {
      shippingProgressBar.classList.add('completed');
      shippingMeterText.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <strong>Complimentary Express Shipping Unlocked!</strong>
      `;
    } else {
      shippingProgressBar.classList.remove('completed');
      const diff = freeShippingThresholdINR - rawSubtotal;
      shippingMeterText.innerHTML = `
        Add <strong>${formatPrice(diff)}</strong> more for Complimentary Express Shipping!
      `;
    }
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);
  if (discountRow && discountVal) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountVal.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (shippingVal) shippingVal.textContent = isFreeShipping ? 'FREE' : formatPrice(shippingCost);
  if (taxVal) taxVal.textContent = formatPrice(tax);
  if (totalVal) totalVal.textContent = formatPrice(grandTotal);
}

// -----------------------------------------------------------------------------
// Wishlist System
// -----------------------------------------------------------------------------
function toggleWishlist(productId) {
  const idx = shopState.wishlist.indexOf(productId);
  if (idx > -1) {
    shopState.wishlist.splice(idx, 1);
    showToast('Removed from your wishlist', 'info');
  } else {
    shopState.wishlist.push(productId);
    showToast('Saved to your wishlist', 'success');
  }

  saveWishlist();
  updateWishlistCounters();
  renderProducts();
  renderWishlist();
}

function saveWishlist() {
  localStorage.setItem('vikamour_wishlist', JSON.stringify(shopState.wishlist));
}

function updateWishlistCounters() {
  const count = shopState.wishlist.length;
  const badge = document.getElementById('wishlistBadgeCount');
  if (badge) {
    badge.textContent = count;
  }
}

function renderWishlist() {
  const container = document.getElementById('wishlistItemsList');
  const emptyState = document.getElementById('wishlistEmptyState');
  if (!container) return;

  if (shopState.wishlist.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const items = shopState.products.filter(p => shopState.wishlist.includes(p.id));
  container.innerHTML = items.map(product => `
    <div class="cart-item-card">
      <div class="cart-item-thumb" onclick="openProductModal('${product.id}')">
        <img src="${product.images[0]}" alt="${product.name}" />
      </div>
      <div class="cart-item-details">
        <div class="cart-item-header">
          <h4 class="cart-item-title">${product.name}</h4>
          <button class="cart-item-remove-btn" onclick="toggleWishlist('${product.id}')" title="Remove">&times;</button>
        </div>
        <div class="cart-item-meta">
          <span>${product.fabricLabel}</span>
        </div>
        <div class="cart-item-bottom">
          <div class="cart-item-price">${formatPrice(product.price)}</div>
          <button class="btn btn-outline" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="quickAddToCart('${product.id}')">
            Move to Bag
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// Drawers & Modals Setup
// -----------------------------------------------------------------------------
function setupDrawersAndModals() {
  const cartTrigger = document.getElementById('cartTriggerBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartDrawerClose');

  const wishlistTrigger = document.getElementById('wishlistTriggerBtn');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistClose = document.getElementById('wishlistDrawerClose');

  const backdrop = document.getElementById('drawerBackdrop');

  if (cartTrigger) {
    cartTrigger.addEventListener('click', () => {
      closeAllDrawers();
      if (cartDrawer) cartDrawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('modal-open');
      renderCart();
    });
  }

  if (wishlistTrigger) {
    wishlistTrigger.addEventListener('click', () => {
      closeAllDrawers();
      if (wishlistDrawer) wishlistDrawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('modal-open');
      renderWishlist();
    });
  }

  if (cartClose) cartClose.addEventListener('click', closeAllDrawers);
  if (wishlistClose) wishlistClose.addEventListener('click', closeAllDrawers);
  if (backdrop) backdrop.addEventListener('click', closeAllDrawers);

  // Quick View Modal
  const modalClose = document.getElementById('modalCloseBtn');
  const modal = document.getElementById('productQuickViewModal');
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  }

  // Promo code button
  const promoBtn = document.getElementById('promoApplyBtn');
  const promoInput = document.getElementById('promoInput');
  const promoBadge = document.getElementById('promoAppliedBadge');
  const promoText = document.getElementById('promoAppliedText');
  const removePromoBtn = document.getElementById('removePromoBtn');

  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      if (VALID_PROMOS[code]) {
        shopState.promoCode = VALID_PROMOS[code];
        if (promoBadge && promoText) {
          promoBadge.style.display = 'flex';
          promoText.textContent = `${code} Applied: ${VALID_PROMOS[code].label}`;
        }
        renderCart();
        showToast(`Privilege code ${code} activated!`, 'success');
      } else {
        showToast('Invalid privilege code. Try VIKA10 for 10% off.', 'error');
      }
    });
  }

  if (removePromoBtn) {
    removePromoBtn.addEventListener('click', () => {
      shopState.promoCode = null;
      if (promoBadge) promoBadge.style.display = 'none';
      if (promoInput) promoInput.value = '';
      renderCart();
      showToast('Promo code removed', 'info');
    });
  }
}

function closeAllDrawers() {
  document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
  const mobileDrawer = document.getElementById('mobileFilterDrawer');
  if (mobileDrawer) mobileDrawer.classList.remove('open');
  const backdrop = document.getElementById('drawerBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// -----------------------------------------------------------------------------
// Product Quick View Deep Details Modal
// -----------------------------------------------------------------------------
function openProductModal(productId) {
  const product = shopState.products.find(p => p.id === productId);
  if (!product) return;

  shopState.activeModalProduct = product;
  shopState.modalSelectedSize = product.sizes[0] || 'M';
  shopState.modalSelectedColor = product.colors[0] || { name: 'Standard', hex: '#111' };
  shopState.modalActiveImageIndex = 0;

  renderModalDetails(product);

  const modal = document.getElementById('productQuickViewModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function renderModalDetails(product) {
  const kicker = document.getElementById('modalProductKicker');
  const title = document.getElementById('modalProductTitle');
  const priceBox = document.getElementById('modalPriceBox');
  const mainImg = document.getElementById('modalMainImage');
  const thumbsStrip = document.getElementById('modalThumbnails');
  const colorName = document.getElementById('modalSelectedColorName');
  const colorSwatches = document.getElementById('modalColorSwatches');
  const sizeOptions = document.getElementById('modalSizeOptions');
  const desc = document.getElementById('modalProductDesc');
  const origin = document.getElementById('modalOriginDetail');
  const composition = document.getElementById('modalCompositionDetail');
  const care = document.getElementById('modalCareDetail');
  const addToBagBtn = document.getElementById('modalAddToBagBtn');

  if (kicker) kicker.textContent = `${product.fabricLabel} • ${product.occasionLabel}`;
  if (title) title.textContent = product.name;
  if (mainImg) mainImg.src = product.images[shopState.modalActiveImageIndex] || product.images[0];

  if (priceBox) {
    priceBox.innerHTML = `
      <span class="modal-price-current">${formatPrice(product.price)}</span>
      ${product.originalPrice ? `<span class="modal-price-original">${formatPrice(product.originalPrice)}</span>` : ''}
    `;
  }

  // Thumbnails
  if (thumbsStrip) {
    thumbsStrip.innerHTML = product.images.map((img, idx) => `
      <button class="modal-thumb-btn ${idx === shopState.modalActiveImageIndex ? 'active' : ''}" onclick="switchModalImage(${idx})">
        <img src="${img}" alt="${product.name} angle ${idx + 1}" />
      </button>
    `).join('');
  }

  // Color Swatches
  if (colorName) colorName.textContent = shopState.modalSelectedColor.name;
  if (colorSwatches) {
    colorSwatches.innerHTML = product.colors.map(c => `
      <button class="modal-color-swatch-btn ${c.name === shopState.modalSelectedColor.name ? 'active' : ''}" 
              style="background-color: ${c.hex};" 
              onclick="selectModalColor('${c.name}', '${c.hex}')" 
              title="${c.name}"></button>
    `).join('');
  }

  // Size Options
  if (sizeOptions) {
    sizeOptions.innerHTML = product.sizes.map(s => `
      <button class="modal-size-pill ${s === shopState.modalSelectedSize ? 'active' : ''}" onclick="selectModalSize('${s}')">
        ${s}
      </button>
    `).join('');
  }

  if (desc) desc.textContent = product.description;
  if (origin) origin.textContent = product.origin;
  if (composition) composition.textContent = product.composition;
  if (care) care.textContent = product.care;

  // Wire Add to Bag button
  if (addToBagBtn) {
    addToBagBtn.onclick = () => {
      addToCart(product, shopState.modalSelectedSize, shopState.modalSelectedColor, 1);
      const modal = document.getElementById('productQuickViewModal');
      if (modal) modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    };
  }
}

function switchModalImage(index) {
  shopState.modalActiveImageIndex = index;
  const product = shopState.activeModalProduct;
  if (product) {
    const mainImg = document.getElementById('modalMainImage');
    if (mainImg) mainImg.src = product.images[index];
    document.querySelectorAll('.modal-thumb-btn').forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });
  }
}

function selectModalColor(name, hex) {
  shopState.modalSelectedColor = { name, hex };
  const label = document.getElementById('modalSelectedColorName');
  if (label) label.textContent = name;
  document.querySelectorAll('.modal-color-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('title') === name);
  });
}

function selectModalSize(size) {
  shopState.modalSelectedSize = size;
  document.querySelectorAll('.modal-size-pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === size);
  });
}

// -----------------------------------------------------------------------------
// Checkout Flow
// -----------------------------------------------------------------------------
function setupCheckoutFlow() {
  const checkoutTrigger = document.getElementById('checkoutTriggerBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutClose = document.getElementById('checkoutCloseBtn');

  if (checkoutTrigger) {
    checkoutTrigger.addEventListener('click', () => {
      if (shopState.cart.length === 0) {
        showToast('Your shopping bag is empty', 'info');
        return;
      }
      closeAllDrawers();
      if (checkoutModal) {
        setCheckoutStep(1);
        updateCheckoutSummaryPreviews();
        checkoutModal.classList.add('active');
        document.body.classList.add('modal-open');
      }
    });
  }

  if (checkoutClose && checkoutModal) {
    checkoutClose.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }

  // Step Tabs
  document.querySelectorAll('.checkout-step-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const step = Number(tab.dataset.step);
      setCheckoutStep(step);
    });
  });

  // Step 1 -> 2
  const toStep2 = document.getElementById('toCheckoutStep2');
  if (toStep2) {
    toStep2.addEventListener('click', () => {
      const fullName = document.getElementById('checkoutFullName')?.value.trim();
      const email = document.getElementById('checkoutEmail')?.value.trim();
      const address = document.getElementById('checkoutAddress')?.value.trim();

      if (!fullName || !email || !address) {
        showToast('Please provide your name, email, and address', 'error');
        return;
      }
      setCheckoutStep(2);
    });
  }

  // Step 2 -> 3
  const toStep3 = document.getElementById('toCheckoutStep3');
  if (toStep3) {
    toStep3.addEventListener('click', () => setCheckoutStep(3));
  }

  // Step 3 -> Place Order
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', completeOrder);
  }
}

function setCheckoutStep(stepNumber) {
  shopState.checkoutStep = stepNumber;
  document.querySelectorAll('.checkout-step-tab').forEach(tab => {
    tab.classList.toggle('active', Number(tab.dataset.step) === stepNumber);
  });
  document.querySelectorAll('.checkout-pane').forEach(pane => {
    pane.classList.toggle('active', Number(pane.dataset.paneStep) === stepNumber);
  });
}

function updateCheckoutSummaryPreviews() {
  const previewContainer = document.getElementById('checkoutOrderReview');
  const totalPreview = document.getElementById('checkoutTotalPreview');
  if (!previewContainer) return;

  const rawSubtotal = shopState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;
  if (shopState.promoCode) {
    if (shopState.promoCode.type === 'percent') discountAmount = rawSubtotal * (shopState.promoCode.value / 100);
    else if (shopState.promoCode.type === 'flat') discountAmount = shopState.promoCode.value;
  }
  const isFree = rawSubtotal >= 1499;
  const shipping = isFree ? 0 : 99;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const grandTotal = taxableAmount + shipping + (taxableAmount * 0.12);

  previewContainer.innerHTML = shopState.cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8rem;">
      <span>${item.quantity}x ${item.name} (${item.size})</span>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');

  if (totalPreview) totalPreview.textContent = formatPrice(grandTotal);
}

function completeOrder() {
  const orderId = `VK-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderIdElem = document.getElementById('confirmedOrderId');
  if (orderIdElem) orderIdElem.textContent = orderId;

  setCheckoutStep(4);
  shopState.cart = [];
  saveCart();
  updateCartCounters();
  renderCart();
  showToast(`Order ${orderId} confirmed with compliments!`, 'success');
}

// -----------------------------------------------------------------------------
// Toast Notifications
// -----------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

// -----------------------------------------------------------------------------
// AI Stylist Shop Helper
// -----------------------------------------------------------------------------
function setupAiStylistShop() {
  const triggerBtn = document.getElementById('aiStylistTriggerBtn');
  const modal = document.getElementById('aiStylistModal');
  const closeBtn = document.getElementById('aiStylistCloseBtn');
  const applyBtn = document.getElementById('stylistApplyBtn');

  if (!modal) return;

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  });

  const stylistSelections = {
    occasion: 'festive',
    silhouette: 'ethnic-sets-dupatta',
    shade: 'pink'
  };

  const optionBtns = modal.querySelectorAll('.stylist-option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.dataset.step;
      const val = btn.dataset.value;
      modal.querySelectorAll(`.stylist-option-btn[data-step="${step}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (step === '1') stylistSelections.occasion = val;
      if (step === '2') stylistSelections.silhouette = val;
      if (step === '3') stylistSelections.shade = val;

      updateStylistRecommendation();
    });
  });

  function updateStylistRecommendation() {
    let matched = null;
    if (stylistSelections.occasion === 'budget') {
      matched = shopState.products.find(p => p.isSale999 || p.price <= 999);
    }
    if (!matched) {
      matched = shopState.products.find(p => {
        const catMatch = p.category === stylistSelections.silhouette;
        const shadeMatch = p.colors.some(c => c.name.toLowerCase().includes(stylistSelections.shade));
        return catMatch && shadeMatch;
      });
    }
    if (!matched) matched = shopState.products.find(p => p.category === stylistSelections.silhouette) || shopState.products[0];

    const resultImg = document.getElementById('stylistResultImg');
    const resultTitle = document.getElementById('stylistResultTitle');
    const resultDesc = document.getElementById('stylistResultDesc');
    const resultPrice = document.getElementById('stylistResultPrice');

    if (matched) {
      if (resultImg) resultImg.src = matched.images[0];
      if (resultTitle) resultTitle.textContent = matched.name;
      if (resultDesc) resultDesc.textContent = matched.description ? (matched.description.substring(0, 115) + '...') : matched.subtitle;
      if (resultPrice) resultPrice.textContent = formatPrice(matched.price);

      if (applyBtn) {
        applyBtn.onclick = () => {
          modal.classList.remove('active');
          document.body.classList.remove('modal-open');
          shopState.filters.category = matched.category;
          syncCategoryUI();
          applyFilters();
          setTimeout(() => openProductModal(matched.id), 400);
        };
      }
    }
  }

  updateStylistRecommendation();
}

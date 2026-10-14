/**
 * VIKAMOUR ATELIER - Main Interactive Application Logic
 * Implements catalog filtering, search, cart, wishlist, quick view,
 * checkout multi-step flow, currency conversion, and local storage persistence.
 */

// Application State
const savedCurrency = localStorage.getItem('vikamour_currency');
const initialCurrency = (savedCurrency && savedCurrency !== 'USD') ? savedCurrency : 'INR';
localStorage.setItem('vikamour_currency', initialCurrency);

const state = {
  products: [...VIKAMOUR_PRODUCTS],
  filteredProducts: [...VIKAMOUR_PRODUCTS],
  filters: {
    category: 'all',
    gender: 'all',
    size: null,
    color: null,
    maxPrice: 50000,
    searchQuery: '',
    sortBy: 'featured',
    gridCols: 3
  },
  currency: initialCurrency,
  cart: JSON.parse(localStorage.getItem('vikamour_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('vikamour_wishlist')) || [],
  promoCode: null,
  activeModalProduct: null,
  modalSelectedSize: null,
  modalSelectedColor: null,
  modalActiveImageIndex: 0,
  checkoutStep: 1,
  checkoutData: {
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    shippingMethod: 'standard',
    paymentMethod: 'card'
  }
};

// Available Promo Codes (INR based)
const VALID_PROMOS = {
  'VIKA10': { type: 'percent', value: 10, label: '10% First Order Privilege' },
  'WELCOME20': { type: 'percent', value: 20, label: '20% Welcome Privilege' },
  'ATELIER2500': { type: 'flat', value: 2500, minOrder: 20000, label: '₹2,500 Atelier VIP Credit' }
};

// -----------------------------------------------------------------------------
// Currency Formatting Utility (Indian Rupees & Multi-Currency)
// -----------------------------------------------------------------------------
function formatPrice(amountInINR) {
  if (amountInINR === null || amountInINR === undefined) return '';
  const curr = CURRENCIES[state.currency] || CURRENCIES.INR;
  const converted = amountInINR * curr.rate;
  
  // Format depending on currency
  if (state.currency === 'INR') {
    return `${curr.symbol} ${Math.round(converted).toLocaleString('en-IN')}`;
  } else if (state.currency === 'EUR' || state.currency === 'GBP') {
    return `${curr.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  }
  return `${curr.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initCurrencySelector();
  initHeaderScroll();
  initCategoryPills();
  initSearch();
  initFilterControls();
  initFestiveHeroAndBillboard();
  setupAiStylist();
  renderProducts();
  updateCartCounters();
  updateWishlistCounters();
  setupDrawersAndModals();
  setupCheckoutFlow();
  setupNewsletter();
});

// -----------------------------------------------------------------------------
// Header & Navigation Handlers
// -----------------------------------------------------------------------------
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileClose = document.getElementById('mobileDrawerClose');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeAllDrawers);
  }

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        closeAllDrawers();

        // Check if navigation specifies a category or gender
        const navCat = this.dataset.navCategory;
        if (navCat) {
          if (navCat === 'all') {
            resetAllFilters();
          } else if (navCat === 'women' || navCat === 'men') {
            state.filters.gender = navCat;
            const genderSelect = document.getElementById('genderFilterSelect');
            if (genderSelect) genderSelect.value = navCat;
            applyFilters();
          } else {
            const matchingPill = document.querySelector(`.filter-pill[data-category="${navCat}"]`);
            if (matchingPill) {
              matchingPill.click();
            } else {
              state.filters.category = navCat;
              applyFilters();
            }
          }
        }

        targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initCurrencySelector() {
  const currencySelect = document.getElementById('currencySelect');
  if (!currencySelect) return;
  currencySelect.value = state.currency;

  currencySelect.addEventListener('change', (e) => {
    state.currency = e.target.value;
    localStorage.setItem('vikamour_currency', state.currency);
    renderProducts();
    renderCart();
    renderWishlist();
    if (state.activeModalProduct) {
      renderModalDetails(state.activeModalProduct);
    }
    showToast(`Currency updated to ${state.currency}`, 'info');
  });
}

// -----------------------------------------------------------------------------
// Catalog Filtering, Sorting & Search
// -----------------------------------------------------------------------------
function initCategoryPills() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filters.category = pill.dataset.category;
      applyFilters();
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('catalogSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.searchQuery = e.target.value.trim().toLowerCase();
      if (state.filters.searchQuery) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
      applyFilters();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.filters.searchQuery = '';
      clearBtn.classList.remove('visible');
      applyFilters();
    });
  }
}

function initFilterControls() {
  // Gender Filter
  const genderSelect = document.getElementById('genderFilterSelect');
  if (genderSelect) {
    genderSelect.addEventListener('change', (e) => {
      state.filters.gender = e.target.value;
      applyFilters();
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      applyFilters();
    });
  }

  // Advanced Filters Toggle Button
  const expandBtn = document.getElementById('expandFiltersBtn');
  const advancedPanel = document.getElementById('advancedFiltersPanel');
  if (expandBtn && advancedPanel) {
    expandBtn.addEventListener('click', () => {
      const isOpen = advancedPanel.classList.toggle('open');
      expandBtn.innerHTML = isOpen 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg> Less Filters`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Refine by Size / Color`;
    });
  }

  // Size Chips
  const sizeChips = document.querySelectorAll('.size-chip');
  sizeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('selected')) {
        chip.classList.remove('selected');
        state.filters.size = null;
      } else {
        sizeChips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.filters.size = chip.dataset.size;
      }
      applyFilters();
    });
  });

  // Color Filter Dots
  const colorDots = document.querySelectorAll('.color-dot-filter');
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      if (dot.classList.contains('selected')) {
        dot.classList.remove('selected');
        state.filters.color = null;
      } else {
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        state.filters.color = dot.dataset.color;
      }
      applyFilters();
    });
  });

  // Price Slider
  const priceSlider = document.getElementById('priceRangeInput');
  const priceIndicator = document.getElementById('priceIndicator');
  if (priceSlider && priceIndicator) {
    priceSlider.addEventListener('input', (e) => {
      state.filters.maxPrice = Number(e.target.value);
      priceIndicator.textContent = formatPrice(state.filters.maxPrice);
      applyFilters();
    });
  }

  // Grid Column Switcher (3 cols vs 4 cols)
  const gridBtns = document.querySelectorAll('.grid-col-btn');
  const productsGrid = document.getElementById('productsGrid');
  gridBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gridBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cols = Number(btn.dataset.cols);
      state.filters.gridCols = cols;
      if (cols === 4) {
        productsGrid.classList.add('grid-4-cols');
      } else {
        productsGrid.classList.remove('grid-4-cols');
      }
    });
  });
}

function applyFilters() {
  let list = [...state.products];

  // 1. Category Filter
  if (state.filters.category !== 'all') {
    if (state.filters.category === 'sale999') {
      list = list.filter(item => item.isSale999 === true || item.price <= 999);
    } else {
      list = list.filter(item => item.category === state.filters.category);
    }
  }

  // 2. Gender Filter
  if (state.filters.gender !== 'all') {
    list = list.filter(item => item.gender === state.filters.gender || item.gender === 'unisex');
  }

  // 3. Size Filter
  if (state.filters.size) {
    list = list.filter(item => item.sizes.includes(state.filters.size));
  }

  // 4. Color Filter
  if (state.filters.color) {
    list = list.filter(item => 
      item.colors.some(c => c.name.toLowerCase().includes(state.filters.color.toLowerCase()))
    );
  }

  // 5. Max Price Filter
  if (state.filters.maxPrice) {
    list = list.filter(item => item.price <= state.filters.maxPrice);
  }

  // 6. Search Query
  if (state.filters.searchQuery) {
    const q = state.filters.searchQuery;
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  // 7. Sort Options
  switch (state.filters.sortBy) {
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
    case 'featured':
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  state.filteredProducts = list;
  renderProducts();
  renderActiveFilterChips();
}

function renderActiveFilterChips() {
  const container = document.getElementById('activeFiltersRow');
  if (!container) return;

  const chips = [];

  if (state.filters.category !== 'all') {
    const catLabel = state.filters.category === 'sale999' ? '🔥 Flat ₹999 Sale' : `Category: ${state.filters.category}`;
    chips.push({
      label: catLabel,
      clear: () => {
        state.filters.category = 'all';
        document.querySelectorAll('.filter-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.category === 'all');
        });
        applyFilters();
      }
    });
  }

  if (state.filters.gender !== 'all') {
    chips.push({
      label: `Gender: ${state.filters.gender}`,
      clear: () => {
        state.filters.gender = 'all';
        document.getElementById('genderFilterSelect').value = 'all';
        applyFilters();
      }
    });
  }

  if (state.filters.size) {
    chips.push({
      label: `Size: ${state.filters.size}`,
      clear: () => {
        state.filters.size = null;
        document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
        applyFilters();
      }
    });
  }

  if (state.filters.color) {
    chips.push({
      label: `Color: ${state.filters.color}`,
      clear: () => {
        state.filters.color = null;
        document.querySelectorAll('.color-dot-filter').forEach(d => d.classList.remove('selected'));
        applyFilters();
      }
    });
  }

  if (state.filters.maxPrice < 50000) {
    chips.push({
      label: `Under ${formatPrice(state.filters.maxPrice)}`,
      clear: () => {
        state.filters.maxPrice = 50000;
        document.getElementById('priceRangeInput').value = 50000;
        document.getElementById('priceIndicator').textContent = formatPrice(50000);
        applyFilters();
      }
    });
  }

  if (state.filters.searchQuery) {
    chips.push({
      label: `Search: "${state.filters.searchQuery}"`,
      clear: () => {
        state.filters.searchQuery = '';
        document.getElementById('catalogSearchInput').value = '';
        document.getElementById('searchClearBtn').classList.remove('visible');
        applyFilters();
      }
    });
  }

  if (chips.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = chips.map((c, i) => `
    <span class="active-filter-tag">
      ${c.label}
      <button data-chip-idx="${i}" title="Remove filter">&times;</button>
    </span>
  `).join('') + `
    <button class="clear-all-filters-btn" id="clearAllFiltersBtn">Clear all filters</button>
  `;

  // Attach chip clear handlers
  container.querySelectorAll('button[data-chip-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.chipIdx);
      if (chips[idx]) chips[idx].clear();
    });
  });

  const clearAllBtn = document.getElementById('clearAllFiltersBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', resetAllFilters);
  }
}

function resetAllFilters() {
  state.filters = {
    category: 'all',
    gender: 'all',
    size: null,
    color: null,
    maxPrice: 50000,
    searchQuery: '',
    sortBy: 'featured',
    gridCols: state.filters.gridCols
  };

  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.category === 'all');
  });
  if (document.getElementById('genderFilterSelect')) document.getElementById('genderFilterSelect').value = 'all';
  if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = 'featured';
  if (document.getElementById('catalogSearchInput')) document.getElementById('catalogSearchInput').value = '';
  if (document.getElementById('searchClearBtn')) document.getElementById('searchClearBtn').classList.remove('visible');
  if (document.getElementById('priceRangeInput')) document.getElementById('priceRangeInput').value = 50000;
  if (document.getElementById('priceIndicator')) document.getElementById('priceIndicator').textContent = formatPrice(50000);
  document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.color-dot-filter').forEach(d => d.classList.remove('selected'));

  applyFilters();
  showToast('Filters reset to default', 'info');
}

// -----------------------------------------------------------------------------
// Product Card Rendering
// -----------------------------------------------------------------------------
function renderProducts() {
  const container = document.getElementById('productsGrid');
  const countEl = document.getElementById('catalogCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = state.filteredProducts.length;
  }

  if (state.filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="catalog-empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h4 class="empty-state-title">No garments match your criteria</h4>
        <p class="empty-state-text">Try loosening your search terms, selecting a different category, or resetting filters.</p>
        <button class="btn btn-primary" onclick="resetAllFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.filteredProducts.map(product => {
    const isWishlisted = state.wishlist.includes(product.id);
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const secondImage = product.images[1] || product.images[0];

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img class="product-image-primary" src="${product.images[0]}" alt="${product.name}" loading="lazy" />
          <img class="product-image-secondary" src="${secondImage}" alt="${product.name} Alternate View" loading="lazy" />
          
          <!-- Badge -->
          ${product.badge ? `<span class="product-badge-tag ${hasDiscount ? 'sale' : ''}">${product.badge}</span>` : ''}
          
          <!-- Wishlist Heart Button -->
          <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  data-wishlist-id="${product.id}" 
                  aria-label="Add to wishlist" 
                  title="${isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <!-- Hover Actions -->
          <div class="product-card-actions">
            <button class="btn-card-quickview" data-quickview-id="${product.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Quick View
            </button>
            <button class="btn-card-quickadd" data-quickadd-id="${product.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Quick Add
            </button>
          </div>
        </div>

        <div class="product-info-box">
          <div class="product-color-swatches">
            ${product.colors.map(color => `
              <span class="swatch-circle" style="background-color: ${color.hex};" title="${color.name}"></span>
            `).join('')}
            ${product.colors.length > 3 ? `<span class="swatches-more">+${product.colors.length - 3}</span>` : ''}
          </div>

          <div class="product-meta-row">
            <span class="product-category-tag">${product.category}</span>
            <div class="product-rating">
              <span class="star-icon">★</span>
              <span>${product.rating} (${product.reviewCount})</span>
            </div>
          </div>

          <h3 class="product-title" data-quickview-id="${product.id}">${product.name}</h3>
          <p class="product-subtitle">${product.subtitle}</p>

          <div class="product-price-row">
            <span class="current-price">${formatPrice(product.price)}</span>
            ${hasDiscount ? `
              <span class="original-price">${formatPrice(product.originalPrice)}</span>
              <span class="discount-tag">-${discountPercent}%</span>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachCardEventListeners();
}

function attachCardEventListeners() {
  // Wishlist heart buttons
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.wishlistId);
    });
  });

  // Quick View triggers
  document.querySelectorAll('[data-quickview-id]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickViewModal(elem.dataset.quickviewId);
    });
  });

  // Quick Add triggers
  document.querySelectorAll('[data-quickadd-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = state.products.find(p => p.id === btn.dataset.quickaddId);
      if (product) {
        // Quick add default first size and color
        addToCart(product, product.sizes[0], product.colors[0], 1);
        openCartDrawer();
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Quick View & Product Modal
// -----------------------------------------------------------------------------
function openQuickViewModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  state.modalSelectedSize = product.sizes[0];
  state.modalSelectedColor = product.colors[0];
  state.modalActiveImageIndex = 0;

  renderModalDetails(product);

  const modal = document.getElementById('productQuickViewModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function renderModalDetails(product) {
  const mainImg = document.getElementById('modalMainImage');
  const thumbsContainer = document.getElementById('modalThumbnails');
  const title = document.getElementById('modalProductTitle');
  const kicker = document.getElementById('modalProductKicker');
  const priceBox = document.getElementById('modalPriceBox');
  const colorSwatches = document.getElementById('modalColorSwatches');
  const selectedColorName = document.getElementById('modalSelectedColorName');
  const sizeChips = document.getElementById('modalSizeChips');
  const desc = document.getElementById('modalProductDesc');
  const comp = document.getElementById('modalProductComp');
  const care = document.getElementById('modalProductCare');
  const origin = document.getElementById('modalProductOrigin');

  if (mainImg) mainImg.src = product.images[state.modalActiveImageIndex];
  if (kicker) kicker.textContent = `${product.gender.toUpperCase()} • ${product.category.toUpperCase()}`;
  if (title) title.textContent = product.name;
  if (desc) desc.textContent = product.description;
  if (comp) comp.textContent = product.composition;
  if (care) care.textContent = product.care;
  if (origin) origin.textContent = product.origin;

  // Thumbs
  if (thumbsContainer) {
    thumbsContainer.innerHTML = product.images.map((img, i) => `
      <div class="modal-thumb ${i === state.modalActiveImageIndex ? 'active' : ''}" data-thumb-idx="${i}">
        <img src="${img}" alt="${product.name} thumb ${i + 1}" />
      </div>
    `).join('');

    thumbsContainer.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        state.modalActiveImageIndex = Number(thumb.dataset.thumbIdx);
        mainImg.src = product.images[state.modalActiveImageIndex];
        thumbsContainer.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // Price
  if (priceBox) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    priceBox.innerHTML = `
      <span class="modal-current-price">${formatPrice(product.price)}</span>
      ${hasDiscount ? `
        <span class="modal-original-price">${formatPrice(product.originalPrice)}</span>
        <span class="modal-save-pill">Save ${discountPercent}%</span>
      ` : ''}
    `;
  }

  // Colors
  if (selectedColorName) selectedColorName.textContent = state.modalSelectedColor.name;
  if (colorSwatches) {
    colorSwatches.innerHTML = product.colors.map(col => `
      <span class="modal-swatch-item ${col.name === state.modalSelectedColor.name ? 'active' : ''}" 
            style="background-color: ${col.hex}" 
            title="${col.name}" 
            data-color-name="${col.name}">
      </span>
    `).join('');

    colorSwatches.querySelectorAll('.modal-swatch-item').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const found = product.colors.find(c => c.name === swatch.dataset.colorName);
        if (found) {
          state.modalSelectedColor = found;
          if (selectedColorName) selectedColorName.textContent = found.name;
          colorSwatches.querySelectorAll('.modal-swatch-item').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
        }
      });
    });
  }

  // Sizes
  if (sizeChips) {
    sizeChips.innerHTML = product.sizes.map(size => `
      <button class="modal-size-btn ${size === state.modalSelectedSize ? 'active' : ''}" data-size-val="${size}">
        ${size}
      </button>
    `).join('');

    sizeChips.querySelectorAll('.modal-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.modalSelectedSize = btn.dataset.sizeVal;
        sizeChips.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}

// -----------------------------------------------------------------------------
// Cart System (Slide-Over Drawer & State)
// -----------------------------------------------------------------------------
function addToCart(product, size, color, quantity = 1) {
  const existingIdx = state.cart.findIndex(item => 
    item.productId === product.id && item.size === size && item.color.name === color.name
  );

  if (existingIdx > -1) {
    state.cart[existingIdx].quantity += quantity;
  } else {
    state.cart.push({
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
  const item = state.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
    showToast(`Removed from bag`, 'info');
  }

  saveCart();
  updateCartCounters();
  renderCart();
}

function removeCartItem(cartItemId) {
  state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
  saveCart();
  updateCartCounters();
  renderCart();
  showToast('Garment removed from bag', 'info');
}

function saveCart() {
  localStorage.setItem('vikamour_cart', JSON.stringify(state.cart));
}

function updateCartCounters() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartBadgeCount');
  const subtotalBtnVal = document.getElementById('cartSubtotalValue');

  if (badge) {
    badge.textContent = count;
    badge.classList.add('pulse');
    setTimeout(() => badge.classList.remove('pulse'), 400);
  }

  if (subtotalBtnVal) {
    const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalBtnVal.textContent = formatPrice(rawSubtotal);
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

  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (footer) footer.style.display = 'block';

  // Render items
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-thumb">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-variants">
          Size: <strong>${item.size}</strong> • Color: <strong>${item.color.name}</strong>
        </div>
        <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
        <div class="cart-item-actions-row">
          <div class="quantity-stepper">
            <button class="stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)">-</button>
            <span class="stepper-value">${item.quantity}</span>
            <button class="stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)">+</button>
          </div>
          <button class="item-remove-btn" onclick="removeCartItem('${item.cartItemId}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;

  if (state.promoCode) {
    if (state.promoCode.type === 'percent') {
      discountAmount = rawSubtotal * (state.promoCode.value / 100);
    } else if (state.promoCode.type === 'flat') {
      discountAmount = state.promoCode.value;
    }
  }

  const freeShippingThresholdINR = 1499;
  const isFreeShipping = rawSubtotal >= freeShippingThresholdINR;
  const shippingCost = isFreeShipping ? 0 : 99;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const tax = taxableAmount * 0.12; // 12% GST on luxury garments
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

  // Display summary amounts
  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);

  if (discountRow && discountVal) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountVal.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (shippingVal) {
    shippingVal.textContent = isFreeShipping ? 'FREE' : formatPrice(shippingCost);
  }

  if (taxVal) taxVal.textContent = formatPrice(tax);
  if (totalVal) totalVal.textContent = formatPrice(grandTotal);
}

// -----------------------------------------------------------------------------
// Wishlist System
// -----------------------------------------------------------------------------
function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);

  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast(`Removed from saved pieces`, 'info');
  } else {
    state.wishlist.push(productId);
    showToast(`Saved to Wishlist: ${product ? product.name : 'Piece'}`, 'success');
  }

  localStorage.setItem('vikamour_wishlist', JSON.stringify(state.wishlist));
  updateWishlistCounters();
  renderProducts();
  renderWishlist();
}

function updateWishlistCounters() {
  const badge = document.getElementById('wishlistBadgeCount');
  if (badge) {
    badge.textContent = state.wishlist.length;
    badge.classList.add('pulse');
    setTimeout(() => badge.classList.remove('pulse'), 400);
  }
}

function renderWishlist() {
  const container = document.getElementById('wishlistItemsList');
  const emptyState = document.getElementById('wishlistEmptyState');
  if (!container) return;

  const wishlistedProducts = state.products.filter(p => state.wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = wishlistedProducts.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-thumb">
        <img src="${item.images[0]}" alt="${item.name}" />
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-variants">${item.category.toUpperCase()} • ${item.gender.toUpperCase()}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-actions-row">
          <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.72rem;" onclick="moveWishlistToCart('${item.id}')">
            Move to Bag
          </button>
          <button class="item-remove-btn" onclick="toggleWishlist('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

function moveWishlistToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  addToCart(product, product.sizes[0], product.colors[0], 1);
  toggleWishlist(productId);
  closeAllDrawers();
  openCartDrawer();
}

// -----------------------------------------------------------------------------
// Drawers & Modals Orchestration
// -----------------------------------------------------------------------------
function setupDrawersAndModals() {
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const cartTrigger = document.getElementById('cartTriggerBtn');
  const cartSubtotalBtn = document.getElementById('cartSubtotalBtn');
  const wishlistTrigger = document.getElementById('wishlistTriggerBtn');
  const cartClose = document.getElementById('cartDrawerClose');
  const wishlistClose = document.getElementById('wishlistDrawerClose');
  const quickViewModal = document.getElementById('productQuickViewModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutClose = document.getElementById('checkoutCloseBtn');
  const sizeGuideModal = document.getElementById('sizeGuideModal');
  const sizeGuideClose = document.getElementById('sizeGuideCloseBtn');
  const sizeGuideTrigger = document.getElementById('sizeGuideTrigger');

  // Open Cart
  if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
  if (cartSubtotalBtn) cartSubtotalBtn.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeAllDrawers);

  // Open Wishlist
  if (wishlistTrigger) {
    wishlistTrigger.addEventListener('click', () => {
      closeAllDrawers();
      renderWishlist();
      wishlistDrawer.classList.add('open');
      drawerBackdrop.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }
  if (wishlistClose) wishlistClose.addEventListener('click', closeAllDrawers);

  // Backdrop click closes drawers and modals
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeAllDrawers);
  }

  // Quick View Modal Close
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      quickViewModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }

  if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  }

  // Modal Add to Cart & Buy Now
  const modalAddBtn = document.getElementById('modalAddToCartBtn');
  const modalBuyNowBtn = document.getElementById('modalBuyNowBtn');

  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (state.activeModalProduct) {
        addToCart(
          state.activeModalProduct,
          state.modalSelectedSize,
          state.modalSelectedColor,
          1
        );
        quickViewModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        openCartDrawer();
      }
    });
  }

  if (modalBuyNowBtn) {
    modalBuyNowBtn.addEventListener('click', () => {
      if (state.activeModalProduct) {
        addToCart(
          state.activeModalProduct,
          state.modalSelectedSize,
          state.modalSelectedColor,
          1
        );
        quickViewModal.classList.remove('active');
        openCheckoutModal();
      }
    });
  }

  // Size Guide Modal
  if (sizeGuideTrigger) {
    sizeGuideTrigger.addEventListener('click', () => {
      if (sizeGuideModal) sizeGuideModal.classList.add('active');
    });
  }

  if (sizeGuideClose) {
    sizeGuideClose.addEventListener('click', () => {
      if (sizeGuideModal) sizeGuideModal.classList.remove('active');
    });
  }

  if (sizeGuideModal) {
    sizeGuideModal.addEventListener('click', (e) => {
      if (e.target === sizeGuideModal) sizeGuideModal.classList.remove('active');
    });
  }

  // Promo Code Validation
  const promoApplyBtn = document.getElementById('promoApplyBtn');
  const promoInput = document.getElementById('promoInput');
  const promoBadge = document.getElementById('promoAppliedBadge');
  const promoBadgeText = document.getElementById('promoAppliedText');
  const removePromoBtn = document.getElementById('removePromoBtn');

  if (promoApplyBtn && promoInput) {
    promoApplyBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      if (VALID_PROMOS[code]) {
        state.promoCode = { code, ...VALID_PROMOS[code] };
        promoBadge.classList.add('active');
        promoBadgeText.textContent = `${code}: ${state.promoCode.label}`;
        promoInput.value = '';
        renderCart();
        showToast(`Privilege code ${code} applied successfully!`, 'success');
      } else {
        showToast('Invalid privilege code. Try VIKA10 or WELCOME20', 'error');
      }
    });
  }

  if (removePromoBtn) {
    removePromoBtn.addEventListener('click', () => {
      state.promoCode = null;
      promoBadge.classList.remove('active');
      renderCart();
      showToast('Promo code removed', 'info');
    });
  }

  // Accordion Tabs in Modal
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.closest('.accordion-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });
}

function openCartDrawer() {
  closeAllDrawers();
  renderCart();
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeAllDrawers() {
  document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
  const backdrop = document.getElementById('drawerBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// -----------------------------------------------------------------------------
// Multi-Step Checkout Flow
// -----------------------------------------------------------------------------
function setupCheckoutFlow() {
  const proceedBtn = document.getElementById('proceedToCheckoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutClose = document.getElementById('checkoutCloseBtn');

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      closeAllDrawers();
      openCheckoutModal();
    });
  }

  if (checkoutClose) {
    checkoutClose.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }

  // Payment Option Cards selection
  document.querySelectorAll('.payment-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.checkoutData.paymentMethod = card.dataset.payment;
      
      const cardDetailsForm = document.getElementById('creditCardDetailsForm');
      if (cardDetailsForm) {
        cardDetailsForm.style.display = card.dataset.payment === 'card' ? 'block' : 'none';
      }
    });
  });

  // Step 1 -> Step 2
  const toStep2Btn = document.getElementById('toStep2Btn');
  if (toStep2Btn) {
    toStep2Btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = document.getElementById('shippingDetailsForm');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      setCheckoutStep(2);
    });
  }

  // Step 2 Back & Forward
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const toStep3Btn = document.getElementById('toStep3Btn');
  if (backToStep1Btn) backToStep1Btn.addEventListener('click', () => setCheckoutStep(1));
  if (toStep3Btn) toStep3Btn.addEventListener('click', () => setCheckoutStep(3));

  // Step 3 Back & Place Order
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (backToStep2Btn) backToStep2Btn.addEventListener('click', () => setCheckoutStep(2));
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', completeOrder);
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  state.checkoutStep = 1;
  setCheckoutStep(1);
  updateCheckoutSummaryPreviews();
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function setCheckoutStep(stepNumber) {
  state.checkoutStep = stepNumber;

  // Step Tabs
  document.querySelectorAll('.checkout-step-tab').forEach(tab => {
    const num = Number(tab.dataset.step);
    tab.classList.toggle('active', num === stepNumber);
  });

  // Panes
  document.querySelectorAll('.checkout-pane').forEach(pane => {
    const num = Number(pane.dataset.paneStep);
    pane.classList.toggle('active', num === stepNumber);
  });
}

function updateCheckoutSummaryPreviews() {
  const previewContainer = document.getElementById('checkoutOrderReview');
  const totalPreview = document.getElementById('checkoutTotalPreview');
  if (!previewContainer) return;

  const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;
  if (state.promoCode) {
    if (state.promoCode.type === 'percent') discountAmount = rawSubtotal * (state.promoCode.value / 100);
    else if (state.promoCode.type === 'flat') discountAmount = state.promoCode.value;
  }
  const isFree = rawSubtotal >= 1499;
  const shipping = isFree ? 0 : 99;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const grandTotal = taxableAmount + shipping + (taxableAmount * 0.12);

  previewContainer.innerHTML = state.cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8rem;">
      <span>${item.quantity}x ${item.name} (${item.size})</span>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');

  if (totalPreview) {
    totalPreview.textContent = formatPrice(grandTotal);
  }
}

function completeOrder() {
  const orderId = `VK-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderIdElem = document.getElementById('confirmedOrderId');
  if (orderIdElem) orderIdElem.textContent = orderId;

  // Switch to success celebration step
  setCheckoutStep(4);

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartCounters();
  renderCart();

  showToast(`Order ${orderId} confirmed with compliments!`, 'success');
}

// -----------------------------------------------------------------------------
// Newsletter & Club Subscription
// -----------------------------------------------------------------------------
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Welcome to the Vikamour Atelier Club! Code VIKA10 has been unlocked.', 'success');
        input.value = '';
      }
    });
  }
}

// -----------------------------------------------------------------------------
// Toast Notification Engine
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

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

// -----------------------------------------------------------------------------
// Festive Hero Banner & Billboard Trigger
// -----------------------------------------------------------------------------
function initFestiveHeroAndBillboard() {
  const billboard = document.getElementById('heroSaleBillboardTrigger');
  if (billboard) {
    billboard.addEventListener('click', (e) => {
      // If href is set to shop.html, allow natural navigation to dedicated shop page
      if (billboard.getAttribute('href')?.startsWith('shop.html')) {
        return;
      }
      e.preventDefault();
      document.querySelectorAll('.filter-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === 'sale999');
      });
      state.filters.category = 'sale999';
      applyFilters();
      const catalog = document.getElementById('catalog');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// -----------------------------------------------------------------------------
// AI Stylist Assistant (Floating Widget & Interactive Recommender)
// -----------------------------------------------------------------------------
function setupAiStylist() {
  const triggerBtn = document.getElementById('aiStylistTriggerBtn');
  const modal = document.getElementById('aiStylistModal');
  const closeBtn = document.getElementById('aiStylistCloseBtn');
  const applyBtn = document.getElementById('stylistApplyBtn');
  const resultImg = document.getElementById('stylistResultImg');
  const resultTitle = document.getElementById('stylistResultTitle');
  const resultDesc = document.getElementById('stylistResultDesc');
  const resultPrice = document.getElementById('stylistResultPrice');

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

  // Interactive stylist selection state
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
      
      // Deselect siblings for this step
      modal.querySelectorAll(`.stylist-option-btn[data-step="${step}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (step === '1') stylistSelections.occasion = val;
      if (step === '2') stylistSelections.silhouette = val;
      if (step === '3') stylistSelections.shade = val;

      updateRecommendation();
    });
  });

  function updateRecommendation() {
    // Find best match in catalog
    let matched = null;

    if (stylistSelections.occasion === 'budget') {
      matched = state.products.find(p => p.isSale999 || p.price <= 999);
    }

    if (!matched) {
      // Match silhouette & shade
      matched = state.products.find(p => {
        const catMatch = p.category === stylistSelections.silhouette;
        const shadeMatch = p.colors.some(c => c.name.toLowerCase().includes(stylistSelections.shade));
        return catMatch && shadeMatch;
      });
    }

    if (!matched) {
      matched = state.products.find(p => p.category === stylistSelections.silhouette);
    }

    if (!matched) {
      matched = state.products[0];
    }

    if (matched) {
      if (resultImg) resultImg.src = matched.images[0];
      if (resultTitle) resultTitle.textContent = matched.name;
      if (resultDesc) {
        resultDesc.textContent = matched.description ? (matched.description.substring(0, 115) + '...') : matched.subtitle;
      }
      if (resultPrice) resultPrice.textContent = formatPrice(matched.price);

      if (applyBtn) {
        applyBtn.onclick = () => {
          modal.classList.remove('active');
          document.body.classList.remove('modal-open');
          
          // Filter catalog to matching category
          document.querySelectorAll('.filter-pill').forEach(p => {
            p.classList.toggle('active', p.dataset.category === matched.category);
          });
          state.filters.category = matched.category;
          applyFilters();

          const catalog = document.getElementById('catalog');
          if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });

          setTimeout(() => {
            if (typeof openProductModal === 'function') {
              openProductModal(matched.id);
            }
          }, 450);
        };
      }
    }
  }

  updateRecommendation();
}


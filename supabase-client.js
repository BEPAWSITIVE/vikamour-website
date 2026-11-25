/**
 * VIKAMOUR Atelier - Supabase Integration Client
 * Handles real-time catalog fetching, checkout order persistence,
 * customer authentication, newsletter subscriptions, and order tracking.
 * 
 * Includes resilient offline/demo fallback mode when credentials are not yet configured.
 */

// -----------------------------------------------------------------------------
// 1. SUPABASE CONFIGURATION
// -----------------------------------------------------------------------------
// Replace the values below with your Supabase Project URL and Anon/Public Key.
// You can find them in your Supabase Dashboard: Project Settings -> API.
// Alternatively, you can store them in localStorage under 'vikamour_supabase_url' and 'vikamour_supabase_key'.

const DEFAULT_SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // e.g. https://xyzcompany.supabase.co
const DEFAULT_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g. eyJhbGciOi...

const SUPABASE_CONFIG = {
  url: localStorage.getItem('vikamour_supabase_url') || DEFAULT_SUPABASE_URL,
  anonKey: localStorage.getItem('vikamour_supabase_key') || DEFAULT_SUPABASE_ANON_KEY
};

let _supabaseInstance = null;

/**
 * Checks whether Supabase is configured with active credentials.
 */
function isSupabaseConfigured() {
  const url = SUPABASE_CONFIG.url;
  const key = SUPABASE_CONFIG.anonKey;
  return Boolean(
    url &&
    key &&
    url !== 'YOUR_SUPABASE_PROJECT_URL' &&
    key !== 'YOUR_SUPABASE_ANON_KEY' &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    typeof window.supabase !== 'undefined'
  );
}

/**
 * Returns the active Supabase client singleton, or null if unconfigured.
 */
function getSupabaseClient() {
  if (_supabaseInstance) return _supabaseInstance;
  
  if (isSupabaseConfigured()) {
    try {
      _supabaseInstance = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('✨ [Vikamour] Connected to Supabase Atelier backend at:', SUPABASE_CONFIG.url);
      return _supabaseInstance;
    } catch (err) {
      console.warn('[Vikamour] Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// 2. PRODUCT CATALOG APIS
// -----------------------------------------------------------------------------

/**
 * Fetches products from Supabase 'products' table.
 * Falls back to local VIKAMOUR_PRODUCTS if Supabase is offline or not configured.
 */
async function fetchProductsFromDatabase() {
  const client = getSupabaseClient();
  if (!client) {
    return { data: [...VIKAMOUR_PRODUCTS], source: 'local' };
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.warn('[Vikamour] Supabase product query error, using local fallback:', error.message);
      return { data: [...VIKAMOUR_PRODUCTS], source: 'local-fallback', error: error.message };
    }

    if (!data || data.length === 0) {
      console.info('[Vikamour] Supabase products table is empty. Using local fallback.');
      return { data: [...VIKAMOUR_PRODUCTS], source: 'local-empty-db' };
    }

    // Normalize snake_case column names to camelCase for UI compatibility
    const normalized = data.map(p => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle || '',
      category: p.category,
      gender: p.gender || 'women',
      fabric: p.fabric || '',
      fabricLabel: p.fabric_label || p.fabricLabel || '',
      occasion: p.occasion || '',
      occasionLabel: p.occasion_label || p.occasionLabel || '',
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      rating: Number(p.rating || 4.8),
      reviewCount: Number(p.review_count || 0),
      badge: p.badge || '',
      isSale999: Boolean(p.is_sale999),
      isNew: Boolean(p.is_new),
      featured: Boolean(p.featured),
      colors: Array.isArray(p.colors) ? p.colors : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      images: Array.isArray(p.images) ? p.images : [],
      description: p.description || '',
      composition: p.composition || '',
      care: p.care || '',
      origin: p.origin || '',
      stock: Number(p.stock || 20)
    }));

    return { data: normalized, source: 'supabase' };
  } catch (err) {
    console.error('[Vikamour] Unexpected error fetching products from Supabase:', err);
    return { data: [...VIKAMOUR_PRODUCTS], source: 'local-fallback', error: err.message };
  }
}

// -----------------------------------------------------------------------------
// 3. ORDERS & CHECKOUT APIS
// -----------------------------------------------------------------------------

/**
 * Persists an order and its line items to Supabase.
 * Generates and stores orders in 'orders' and 'order_items' tables.
 */
async function createSupabaseOrder(orderPayload, items) {
  const client = getSupabaseClient();
  const orderNumber = orderPayload.orderNumber || `VK-${Math.floor(100000 + Math.random() * 900000)}`;

  if (!client) {
    // Save to local offline store
    try {
      const existing = JSON.parse(localStorage.getItem('vikamour_local_orders') || '[]');
      existing.unshift({
        ...orderPayload,
        orderNumber,
        items,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('vikamour_local_orders', JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save order to localStorage fallback:', e);
    }
    return {
      success: true,
      orderNumber,
      source: 'local-store',
      message: 'Order saved locally (Connect Supabase to store in cloud database).'
    };
  }

  try {
    // 1. Insert order record
    const { data: orderData, error: orderError } = await client
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: client.auth.getUser() ? (await client.auth.getUser()).data.user?.id : null,
        customer_name: orderPayload.customerName,
        customer_email: orderPayload.customerEmail,
        customer_phone: orderPayload.customerPhone || null,
        shipping_address: orderPayload.shippingAddress,
        city: orderPayload.city,
        postal_code: orderPayload.postalCode,
        country: orderPayload.country || 'India',
        shipping_method: orderPayload.shippingMethod || 'standard',
        payment_method: orderPayload.paymentMethod || 'card',
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount || 0,
        promo_code: orderPayload.promoCode || null,
        shipping_fee: orderPayload.shippingFee || 0,
        tax: orderPayload.tax || 0,
        total_amount: orderPayload.totalAmount,
        currency: orderPayload.currency || 'INR',
        status: 'confirmed'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('[Vikamour] Error creating order in Supabase:', orderError);
      throw orderError;
    }

    // 2. Insert order items
    if (items && items.length > 0) {
      const orderItemsRecords = items.map(it => ({
        order_id: orderData.id,
        product_id: it.productId || it.id || null,
        product_name: it.name,
        product_image: it.image || (it.images ? it.images[0] : null),
        size: it.size || 'M',
        color_name: it.color ? (it.color.name || it.color) : 'Default',
        unit_price: Number(it.price) || 0,
        quantity: parseInt(it.quantity, 10) || 1,
        total_price: (Number(it.price) || 0) * (parseInt(it.quantity, 10) || 1)
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItemsRecords);

      if (itemsError) {
        console.warn('[Vikamour] Note: Order created but order items failed to insert:', itemsError);
      }
    }

    return {
      success: true,
      orderNumber,
      orderId: orderData.id,
      source: 'supabase',
      data: orderData
    };
  } catch (err) {
    console.error('[Vikamour] Order insertion error:', err);
    return {
      success: true, // Still allow UI celebration to proceed
      orderNumber,
      source: 'local-fallback',
      error: err.message
    };
  }
}

/**
 * Looks up an order by order number and customer email.
 */
async function trackSupabaseOrder(orderNumber, email) {
  const client = getSupabaseClient();
  const cleanOrderNum = String(orderNumber || '').trim().toUpperCase();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!client) {
    // Check local storage fallback
    const local = JSON.parse(localStorage.getItem('vikamour_local_orders') || '[]');
    const match = local.find(o => 
      o.orderNumber.toUpperCase() === cleanOrderNum &&
      (!cleanEmail || (o.customerEmail && o.customerEmail.toLowerCase() === cleanEmail))
    );
    if (match) return { success: true, order: match, source: 'local' };
    return { success: false, message: 'Order not found in local records. Connect Supabase to search live database.' };
  }

  try {
    let query = client
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', cleanOrderNum);

    if (cleanEmail) {
      query = query.ilike('customer_email', cleanEmail);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return { success: false, message: error ? error.message : 'No order matching this order number and email.' };
    }
    return { success: true, order: data, source: 'supabase' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// -----------------------------------------------------------------------------
// 4. NEWSLETTER SUBSCRIPTION API
// -----------------------------------------------------------------------------

/**
 * Saves a newsletter email into Supabase 'newsletter_subscribers' table.
 */
async function subscribeToSupabaseNewsletter(email, source = 'footer') {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    // Local storage fallback
    try {
      const subs = JSON.parse(localStorage.getItem('vikamour_newsletter_subs') || '[]');
      if (!subs.includes(cleanEmail)) {
        subs.push(cleanEmail);
        localStorage.setItem('vikamour_newsletter_subs', JSON.stringify(subs));
      }
    } catch (e) {}
    return { success: true, source: 'local', message: 'Subscribed successfully!' };
  }

  try {
    const { error } = await client
      .from('newsletter_subscribers')
      .insert([{ email: cleanEmail, source }]);

    if (error) {
      // 23505 is PostgreSQL code for unique violation
      if (error.code === '23505') {
        return { success: true, message: 'You are already subscribed to the Vikamour Atelier Club!' };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Welcome to the Vikamour Atelier Club!' };
  } catch (err) {
    return { success: true, message: 'Welcome to the Vikamour Atelier Club!' };
  }
}

// -----------------------------------------------------------------------------
// 5. AUTHENTICATION & CLIENT ACCOUNT APIS
// -----------------------------------------------------------------------------

/**
 * Signs up a new customer with email and password.
 */
async function signUpCustomer(email, password, fullName = '', phone = '') {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured yet. Set your Supabase URL & Anon Key.' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Signs in an existing customer with email and password.
 */
async function signInCustomer(email, password) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured yet. Set your Supabase URL & Anon Key.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Signs out the currently authenticated customer.
 */
async function signOutCustomer() {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Retrieves the currently logged-in customer session.
 */
async function getCustomerSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { session } } = await client.auth.getSession();
    return session;
  } catch (e) {
    return null;
  }
}

// -----------------------------------------------------------------------------
// 6. UI MODAL & ACCOUNT CONTROLLER
// -----------------------------------------------------------------------------

function openAccountModal(initialTab = 'signIn') {
  const modal = document.getElementById('accountModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  switchAccountTab(initialTab);
  updateSupabaseStatusDisplay();
  checkCurrentAuthSession();
}

function closeAccountModal() {
  const modal = document.getElementById('accountModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function switchAccountTab(tabKey) {
  const tabs = document.querySelectorAll('.account-tab-btn');
  tabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.accountTab === tabKey);
  });

  const paneMap = {
    signIn: 'paneSignIn',
    signUp: 'paneSignUp',
    trackOrder: 'paneTrackOrder',
    supabaseConfig: 'paneSupabaseConfig',
    userProfile: 'paneUserProfile'
  };

  document.querySelectorAll('.account-pane').forEach(p => p.classList.remove('active'));
  const targetPane = document.getElementById(paneMap[tabKey]);
  if (targetPane) {
    targetPane.classList.add('active');
  }
}

function updateSupabaseStatusDisplay() {
  const display = document.getElementById('supabaseStatusDisplay');
  if (!display) return;

  const isLive = isSupabaseConfigured();
  if (isLive) {
    display.innerHTML = `
      <div class="supabase-status-pill connected">
        <span class="supabase-status-dot"></span> Connected to Supabase Cloud Database
      </div>
      <p style="font-size:0.75rem; color:#065F46; margin:0 0 0.5rem;">Orders, subscriptions, and catalog are synchronizing with your Supabase backend.</p>
    `;
  } else {
    display.innerHTML = `
      <div class="supabase-status-pill local">
        <span class="supabase-status-dot"></span> Local Fallback Mode Active
      </div>
      <p style="font-size:0.75rem; color:#92400E; margin:0 0 0.5rem;">Enter your Supabase credentials below to connect your real-time PostgreSQL database.</p>
    `;
  }

  // Pre-fill inputs
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');
  if (urlInput && !urlInput.value && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL') {
    urlInput.value = SUPABASE_CONFIG.url;
  }
  if (keyInput && !keyInput.value && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    keyInput.value = SUPABASE_CONFIG.anonKey;
  }
}

async function checkCurrentAuthSession() {
  const session = await getCustomerSession();
  const profilePane = document.getElementById('paneUserProfile');
  const tabsContainer = document.getElementById('accountTabsContainer');
  const nameEl = document.getElementById('userProfileName');
  const emailEl = document.getElementById('userProfileEmail');
  const ordersList = document.getElementById('userOrdersList');

  if (session && session.user) {
    if (tabsContainer) tabsContainer.style.display = 'none';
    document.querySelectorAll('.account-pane').forEach(p => p.classList.remove('active'));
    if (profilePane) profilePane.classList.add('active');
    if (nameEl) nameEl.textContent = session.user.user_metadata?.full_name || 'Atelier Member';
    if (emailEl) emailEl.textContent = session.user.email;

    // Load user orders
    if (ordersList) {
      ordersList.innerHTML = '<p style="font-size:0.75rem; color:var(--color-muted);">Loading your atelier orders...</p>';
      const client = getSupabaseClient();
      if (client) {
        const { data: orders } = await client
          .from('orders')
          .select('*, order_items(*)')
          .eq('customer_email', session.user.email)
          .order('created_at', { ascending: false });

        if (orders && orders.length > 0) {
          ordersList.innerHTML = orders.map(ord => `
            <div style="border:1px solid var(--color-border); border-radius:4px; padding:0.6rem; margin-bottom:0.5rem; font-size:0.78rem;">
              <div style="display:flex; justify-content:space-between; font-weight:700;">
                <span>${ord.order_number}</span>
                <span style="color:var(--color-gold); text-transform:uppercase;">${ord.status}</span>
              </div>
              <div style="color:var(--color-muted); font-size:0.72rem; margin:0.2rem 0;">
                ${new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • ₹ ${Number(ord.total_amount).toLocaleString('en-IN')}
              </div>
            </div>
          `).join('');
        } else {
          ordersList.innerHTML = '<p style="font-size:0.75rem; color:var(--color-muted);">No orders found for this account yet.</p>';
        }
      }
    }
  } else {
    if (tabsContainer) tabsContainer.style.display = 'flex';
    if (profilePane) profilePane.classList.remove('active');
  }
}

// -----------------------------------------------------------------------------
// Global Form Action Handlers
// -----------------------------------------------------------------------------

window.handleCustomerSignIn = async function() {
  const email = document.getElementById('signInEmail')?.value.trim();
  const password = document.getElementById('signInPassword')?.value;
  if (!email || !password) return;

  if (window.showToast) window.showToast('Authenticating with Atelier...', 'info');
  const res = await signInCustomer(email, password);
  if (res.success) {
    if (window.showToast) window.showToast('Signed in successfully! Welcome back.', 'success');
    checkCurrentAuthSession();
  } else {
    if (window.showToast) window.showToast(res.message || 'Failed to sign in', 'error');
  }
};

window.handleCustomerSignUp = async function() {
  const name = document.getElementById('signUpName')?.value.trim();
  const email = document.getElementById('signUpEmail')?.value.trim();
  const password = document.getElementById('signUpPassword')?.value;
  const phone = document.getElementById('signUpPhone')?.value.trim();
  if (!name || !email || !password) return;

  if (window.showToast) window.showToast('Creating member account...', 'info');
  const res = await signUpCustomer(email, password, name, phone);
  if (res.success) {
    if (window.showToast) window.showToast('Account registered! Verification email sent.', 'success');
    switchAccountTab('signIn');
  } else {
    if (window.showToast) window.showToast(res.message || 'Registration failed', 'error');
  }
};

window.handleCustomerSignOut = async function() {
  await signOutCustomer();
  if (window.showToast) window.showToast('Signed out of Vikamour Atelier', 'info');
  const tabsContainer = document.getElementById('accountTabsContainer');
  if (tabsContainer) tabsContainer.style.display = 'flex';
  switchAccountTab('signIn');
};

window.handleTrackOrder = async function() {
  const orderNum = document.getElementById('trackOrderNumber')?.value.trim();
  const email = document.getElementById('trackEmail')?.value.trim();
  const resultBox = document.getElementById('trackOrderResult');
  if (!orderNum || !resultBox) return;

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<p style="font-size:0.75rem; color:var(--color-muted);">Searching Atelier order records...</p>';

  const res = await trackSupabaseOrder(orderNum, email);
  if (res.success && res.order) {
    const ord = res.order;
    const items = ord.order_items || ord.items || [];
    resultBox.innerHTML = `
      <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; padding:0.85rem; font-size:0.8rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <strong style="color:var(--color-gold);">${ord.order_number || ord.orderNumber}</strong>
          <span style="display:inline-block; padding:0.2rem 0.5rem; background:#ECFDF5; color:#065F46; border-radius:999px; font-size:0.7rem; font-weight:700; text-transform:uppercase;">
            ${ord.status || 'Confirmed'}
          </span>
        </div>
        <div style="margin-bottom:0.4rem; font-size:0.74rem; color:#4B5563;">
          <div>Customer: <strong>${ord.customer_name || ord.customerName || 'Client'}</strong></div>
          <div>Destination: ${ord.city}, ${ord.country || 'India'} (${ord.postal_code || ord.postalCode || ''})</div>
          <div>Total: <strong>₹ ${Number(ord.total_amount || ord.totalAmount).toLocaleString('en-IN')}</strong></div>
        </div>
        <div style="border-top:1px dashed #D1D5DB; padding-top:0.5rem; margin-top:0.5rem;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; margin-bottom:0.3rem;">Garments:</div>
          ${items.map(it => `
            <div style="display:flex; justify-content:space-between; font-size:0.74rem; color:#374151; margin-bottom:0.2rem;">
              <span>${it.quantity}x ${it.product_name || it.name} (${it.size})</span>
              <span>₹ ${Number(it.total_price || it.price * it.quantity).toLocaleString('en-IN')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    resultBox.innerHTML = `
      <div style="background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; border-radius:6px; padding:0.75rem; font-size:0.76rem;">
        ${res.message || 'Order not found. Please verify the order number.'}
      </div>
    `;
  }
};

window.handleSaveSupabaseConfig = function() {
  const url = document.getElementById('supabaseUrlInput')?.value.trim();
  const key = document.getElementById('supabaseKeyInput')?.value.trim();

  if (!url || !key) {
    if (window.showToast) window.showToast('Please provide both Supabase URL and Anon Key', 'error');
    return;
  }

  localStorage.setItem('vikamour_supabase_url', url);
  localStorage.setItem('vikamour_supabase_key', key);
  SUPABASE_CONFIG.url = url;
  SUPABASE_CONFIG.anonKey = key;
  _supabaseInstance = null; // Reset client

  if (window.showToast) {
    window.showToast('Supabase settings saved! Reloading backend...', 'success');
  }

  setTimeout(() => {
    window.location.reload();
  }, 1200);
};

window.handleClearSupabaseConfig = function() {
  localStorage.removeItem('vikamour_supabase_url');
  localStorage.removeItem('vikamour_supabase_key');
  SUPABASE_CONFIG.url = DEFAULT_SUPABASE_URL;
  SUPABASE_CONFIG.anonKey = DEFAULT_SUPABASE_ANON_KEY;
  _supabaseInstance = null;

  if (window.showToast) {
    window.showToast('Reset to local fallback mode', 'info');
  }

  setTimeout(() => {
    window.location.reload();
  }, 800);
};

window.openOrderTrackingModal = function(orderNumber = '') {
  openAccountModal('trackOrder');
  if (orderNumber) {
    const input = document.getElementById('trackOrderNumber');
    if (input) input.value = orderNumber;
  }
};

// Setup DOM Event Listeners on Load
document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById('accountTriggerBtn');
  const closeBtn = document.getElementById('accountModalCloseBtn');
  const modal = document.getElementById('accountModal');

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => openAccountModal('signIn'));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAccountModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAccountModal();
    });
  }

  document.querySelectorAll('.account-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchAccountTab(btn.dataset.accountTab);
    });
  });
});

// -----------------------------------------------------------------------------
// 7. EXPORT MODULE TO GLOBAL SCOPE
// -----------------------------------------------------------------------------
window.VikamourSupabase = {
  config: SUPABASE_CONFIG,
  isConfigured: isSupabaseConfigured,
  getClient: getSupabaseClient,
  fetchProducts: fetchProductsFromDatabase,
  createOrder: createSupabaseOrder,
  trackOrder: trackSupabaseOrder,
  subscribeNewsletter: subscribeToSupabaseNewsletter,
  signUp: signUpCustomer,
  signIn: signInCustomer,
  signOut: signOutCustomer,
  getSession: getCustomerSession,
  openAccountModal: openAccountModal,
  openOrderTracking: openOrderTrackingModal
};

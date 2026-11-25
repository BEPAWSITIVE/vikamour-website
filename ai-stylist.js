/**
 * VIKAMOUR Atelier - Conversational AI Stylist Engine
 * -----------------------------------------------------------------------------
 * Powered by Google Gemini API & Live Boutique Inventory Stock.
 * Customers can chat in natural language and receive personalized styling advice
 * with real-time stock searches and interactive product recommendations.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. STATE & CONFIGURATION
  // ---------------------------------------------------------------------------
  const AI_STATE = {
    apiKey: '',
    model: 'gemini-1.5-flash',
    isSearching: false,
    history: []
  };

  // Helper: Get API Key from localStorage or window.VIKAMOUR_CONFIG
  function getActiveApiKey() {
    try {
      const stored = localStorage.getItem('vikamour_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    } catch (e) {
      console.warn('[AI Stylist] Could not read localStorage:', e);
    }
    return (window.VIKAMOUR_CONFIG && window.VIKAMOUR_CONFIG.GEMINI_API_KEY) || '';
  }

  function saveApiKey(key) {
    try {
      localStorage.setItem('vikamour_gemini_api_key', key.trim());
      AI_STATE.apiKey = key.trim();
      updateStatusBadge();
      return true;
    } catch (e) {
      console.error('[AI Stylist] Failed to save key:', e);
      return false;
    }
  }

  function clearApiKey() {
    try {
      localStorage.removeItem('vikamour_gemini_api_key');
      AI_STATE.apiKey = '';
      updateStatusBadge();
      return true;
    } catch (e) {
      console.error('[AI Stylist] Failed to clear key:', e);
      return false;
    }
  }

  // Helper: Retrieve current live stock inventory
  function getLiveStock() {
    if (window.VikamourSupabase && typeof window.VikamourSupabase.getCachedProducts === 'function') {
      const cached = window.VikamourSupabase.getCachedProducts();
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
    if (typeof state !== 'undefined' && Array.isArray(state.products) && state.products.length > 0) {
      return state.products;
    }
    if (typeof shopState !== 'undefined' && Array.isArray(shopState.products) && shopState.products.length > 0) {
      return shopState.products;
    }
    if (typeof VIKAMOUR_PRODUCTS !== 'undefined' && Array.isArray(VIKAMOUR_PRODUCTS)) {
      return VIKAMOUR_PRODUCTS;
    }
    return [];
  }

  // Helper: Format currency
  function formatMoney(amount) {
    if (typeof formatPrice === 'function') return formatPrice(amount);
    return `₹ ${Number(amount).toLocaleString('en-IN')}`;
  }

  // Helper: Escape HTML
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------------------------------------------------------------------------
  // 2. GEMINI API CLIENT & SYSTEM INSTRUCTIONS
  // ---------------------------------------------------------------------------
  function buildInventoryContext(stock) {
    return stock.map(item => {
      const colors = Array.isArray(item.colors) ? item.colors.map(c => typeof c === 'object' ? c.name : c).join(', ') : '';
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        fabric: item.fabricLabel || item.fabric || '',
        occasion: item.occasionLabel || item.occasion || '',
        colors: colors,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        isSale999: Boolean(item.isSale999 || item.price <= 999),
        description: item.subtitle || item.description || ''
      };
    });
  }

  async function queryGeminiStylist(userMessage, stock) {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      // Graceful intelligent fallback if key is not provided
      return queryLocalInventoryMatcher(userMessage, stock);
    }

    const inventoryContext = buildInventoryContext(stock);
    const systemPrompt = `You are the Chief Royal Fashion Stylist for "Vikamour Atelier", a luxury Indian ethnic wear boutique.
You assist customers in discovering the perfect handcrafted ethnic attire (Kurtas, Suit Sets with Dupatta, Anarkalis, Co-Ords, and Festive Maxi Dresses).

LIVE INVENTORY STOCK CURRENTLY AVAILABLE IN THE ATELIER:
${JSON.stringify(inventoryContext, null, 2)}

STRICT RULES:
1. Address the customer with warm, refined Indian atelier hospitality (e.g. "Namaste", "Welcome to Vikamour Atelier").
2. Understand the customer's request: occasion (Sangeet, Diwali, Wedding, Office, Festive, Puja), preferred colors, budget, or silhouette.
3. Select 1 to 3 BEST MATCHING products from the LIVE INVENTORY STOCK above. NEVER invent or hallucinate products, IDs, or prices not in the inventory.
4. For each recommended product, explain WHY it is ideal (e.g., fabric drape, hand embroidery, color resonance for the event) and give 1 or 2 elegant accessory or footwear pairing tips (e.g., kundan jhumkas, embellished mojaris, organza dupatta draping).
5. If the customer asks for budget/cheap/deals, emphasize items with isSale999: true or price <= 999.
6. AT THE VERY END OF YOUR REPLY, on a separate line, write exactly:
[RECOMMENDED_IDS: id1, id2]
Replace id1, id2 with the exact product "id"s of the items you recommended (e.g., [RECOMMENDED_IDS: vk-set-1, vk-sale-2]). Do not include extra punctuation inside the brackets.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_STATE.model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nCustomer Requirement: "${userMessage}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 900
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
        console.warn('[AI Stylist] Gemini API error, falling back to local matcher:', errMsg);
        // Fallback gracefully so customer gets immediate help
        const fallbackRes = queryLocalInventoryMatcher(userMessage, stock);
        fallbackRes.note = `(Note: Gemini API key reported: ${errMsg}. Showing recommendations from Atelier Stock Matcher.)`;
        return fallbackRes;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) {
        return queryLocalInventoryMatcher(userMessage, stock);
      }

      // Parse [RECOMMENDED_IDS: ...] tag
      let recommendedIds = [];
      const match = rawText.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/i);
      let cleanText = rawText;
      if (match) {
        recommendedIds = match[1].split(',').map(s => s.trim()).filter(Boolean);
        cleanText = rawText.replace(/\[RECOMMENDED_IDS:\s*[^\]]+\]/i, '').trim();
      }

      // Filter matched products from actual stock
      const matchedProducts = stock.filter(p => recommendedIds.includes(p.id));

      return {
        text: cleanText,
        products: matchedProducts,
        isGemini: true
      };

    } catch (err) {
      console.warn('[AI Stylist] Network fetch failed, falling back to local matcher:', err);
      const fallbackRes = queryLocalInventoryMatcher(userMessage, stock);
      fallbackRes.note = `(Network notice: Using offline Atelier stock matcher.)`;
      return fallbackRes;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. INTELLIGENT LOCAL STOCK MATCHER (Zero-Failure Fallback Engine)
  // ---------------------------------------------------------------------------
  function queryLocalInventoryMatcher(query, stock) {
    const q = (query || '').toLowerCase();
    
    // Check for budget constraints
    const isBudget = q.includes('999') || q.includes('under 1000') || q.includes('under 1,000') || q.includes('cheap') || q.includes('deal') || q.includes('sale') || q.includes('steal');
    const isWedding = q.includes('wedding') || q.includes('sangeet') || q.includes('mehendi') || q.includes('shaadi') || q.includes('reception') || q.includes('sister') || q.includes('cousin');
    const isPuja = q.includes('puja') || q.includes('diwali') || q.includes('festival') || q.includes('festive') || q.includes('navratri') || q.includes('mandir');
    const isDaily = q.includes('daily') || q.includes('office') || q.includes('casual') || q.includes('work') || q.includes('college') || q.includes('simple');

    // Score products based on keyword matching
    const scored = stock.map(item => {
      let score = 0;
      const title = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const fabric = (item.fabric || '').toLowerCase();
      const occasion = (item.occasion || '').toLowerCase();
      const colors = (Array.isArray(item.colors) ? item.colors.map(c => typeof c === 'object' ? c.name : c).join(' ') : '').toLowerCase();

      // Budget filter
      if (isBudget) {
        if (item.isSale999 || item.price <= 999) score += 30;
        else score -= 10;
      }

      // Occasion filter
      if (isWedding && (occasion.includes('wedding') || cat.includes('dupatta') || priceIsRegal(item))) score += 20;
      if (isPuja && (occasion.includes('festive') || colors.includes('pink') || colors.includes('gold') || colors.includes('yellow'))) score += 18;
      if (isDaily && (occasion.includes('daily') || fabric.includes('cotton') || item.price < 1500)) score += 20;

      // Color matching
      ['pink', 'rani', 'fuchsia', 'gold', 'yellow', 'mustard', 'green', 'teal', 'emerald', 'blue', 'indigo', 'red', 'maroon', 'wine', 'black', 'white', 'pastel', 'purple'].forEach(color => {
        if (q.includes(color) && (colors.includes(color) || title.includes(color))) {
          score += 25;
        }
      });

      // Silhouette / Category matching
      ['kurta', 'kurti', 'dupatta', 'suit', 'anarkali', 'co-ord', 'coord', 'set', 'dress', 'maxi'].forEach(sil => {
        if (q.includes(sil)) {
          if (cat.includes(sil) || title.includes(sil)) score += 15;
        }
      });

      // Fabric matching
      ['cotton', 'silk', 'chanderi', 'georgette', 'satin', 'jacquard', 'zari', 'organza', 'velvet'].forEach(fab => {
        if (q.includes(fab)) {
          if (fabric.includes(fab) || desc.includes(fab)) score += 20;
        }
      });

      // Price limit mentions e.g. "under 3000", "under 2000"
      const priceMatch = q.match(/under\s*₹?\s*(\d+)/i) || q.match(/below\s*₹?\s*(\d+)/i) || q.match(/less than\s*₹?\s*(\d+)/i);
      if (priceMatch) {
        const maxBudget = parseInt(priceMatch[1], 10);
        if (!isNaN(maxBudget)) {
          if (item.price <= maxBudget) score += 15;
          else score -= 20;
        }
      }

      return { item, score };
    });

    function priceIsRegal(p) {
      return p.price >= 2500;
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.slice(0, 2).map(s => s.item);

    // If query has no matches, provide top featured products
    const finalProducts = topMatches.length > 0 ? topMatches : stock.slice(0, 2);

    let adviceText = `Namaste! ✨ Based on your request, I searched our boutique inventory and handpicked these exquisite handcrafted creations for you:\n\n`;

    finalProducts.forEach((p, idx) => {
      adviceText += `• **${p.name}** (${formatMoney(p.price)}): Handcrafted in ${p.fabricLabel || p.fabric}, this silhouette features graceful artisan detailing that drapes effortlessly. Pair with polished jhumkas and juttis for a regal look.\n`;
    });

    adviceText += `\nYou can preview the full craftsmanship via **Quick View** or add it straight to your bag below!`;

    return {
      text: adviceText,
      products: finalProducts,
      isGemini: false
    };
  }

  // ---------------------------------------------------------------------------
  // 4. UI RENDERER & INTERACTIVE CHAT ENGINE
  // ---------------------------------------------------------------------------
  function updateStatusBadge() {
    const pill = document.getElementById('aiStylistStatusPill');
    const text = document.getElementById('aiStylistStatusText');
    const key = getActiveApiKey();
    if (!pill || !text) return;

    if (key) {
      pill.className = 'ai-stylist-status-pill online';
      text.textContent = 'Gemini AI Active';
      pill.title = 'Powered by Google Gemini Generative AI';
    } else {
      pill.className = 'ai-stylist-status-pill offline';
      text.textContent = 'Atelier Matcher';
      pill.title = 'Add Gemini API Key in Settings for Generative AI';
    }
  }

  function appendMessage(role, text, products = []) {
    const thread = document.getElementById('aiChatThread');
    if (!thread) return;

    const msgEl = document.createElement('div');
    msgEl.className = `ai-message-row ${role === 'user' ? 'user-row' : 'stylist-row'}`;

    if (role === 'stylist') {
      let productsHtml = '';
      if (Array.isArray(products) && products.length > 0) {
        productsHtml = `
          <div class="chat-recommendations-grid">
            ${products.map(p => `
              <div class="chat-product-card" data-card-id="${escapeHTML(p.id)}">
                <div class="chat-product-thumb-wrap">
                  <img src="${escapeHTML(p.images ? p.images[0] : '')}" alt="${escapeHTML(p.name)}" class="chat-product-thumb" />
                  ${p.isSale999 || p.badge ? `<span class="chat-product-badge">${escapeHTML(p.badge || 'Flat ₹999')}</span>` : ''}
                </div>
                <div class="chat-product-info">
                  <h5 class="chat-product-title">${escapeHTML(p.name)}</h5>
                  <div class="chat-product-meta">
                    <span>${escapeHTML(p.fabricLabel || p.fabric || 'Pure Cotton')}</span> • 
                    <span>${escapeHTML(p.occasionLabel || p.occasion || 'Festive')}</span>
                  </div>
                  <div class="chat-product-price-row">
                    <strong class="chat-product-price">${formatMoney(p.price)}</strong>
                    ${p.originalPrice && p.originalPrice > p.price ? `<span class="chat-product-orig">${formatMoney(p.originalPrice)}</span>` : ''}
                  </div>
                  <div class="chat-product-btn-row">
                    <button type="button" class="btn-chat-action quickview-btn" onclick="window.openProductQuickView('${escapeHTML(p.id)}')">
                      Quick View
                    </button>
                    <button type="button" class="btn-chat-action addbag-btn" onclick="window.aiStylistQuickAdd('${escapeHTML(p.id)}')">
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      msgEl.innerHTML = `
        <div class="ai-avatar-circle">✨</div>
        <div class="ai-bubble stylist-bubble">
          <div class="ai-bubble-content">${formatStylistText(text)}</div>
          ${productsHtml}
          <div class="ai-bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="ai-bubble user-bubble">
          <div class="ai-bubble-content">${escapeHTML(text)}</div>
          <div class="ai-bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
    }

    thread.appendChild(msgEl);
    scrollChatToBottom();
  }

  function formatStylistText(text) {
    if (!text) return '';
    // Format bold markdown **text**
    let formatted = escapeHTML(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n•/g, '<br>•')
      .replace(/\n/g, '<br>');
    return formatted;
  }

  function scrollChatToBottom() {
    const body = document.getElementById('aiStylistChatBody');
    if (body) {
      setTimeout(() => {
        body.scrollTop = body.scrollHeight;
      }, 50);
    }
  }

  function showTypingIndicator(show) {
    const ind = document.getElementById('aiTypingIndicator');
    if (ind) {
      ind.style.display = show ? 'flex' : 'none';
      if (show) scrollChatToBottom();
    }
  }

  // ---------------------------------------------------------------------------
  // 5. MESSAGE SUBMISSION CONTROLLER
  // ---------------------------------------------------------------------------
  async function handleUserQuery(queryText) {
    const text = (queryText || '').trim();
    if (!text || AI_STATE.isSearching) return;

    // 1. Append user message to UI
    appendMessage('user', text);

    // 2. Clear input
    const input = document.getElementById('aiStylistInput');
    if (input) input.value = '';

    // 3. Show typing indicator
    AI_STATE.isSearching = true;
    showTypingIndicator(true);

    // 4. Query Gemini API with stock context
    try {
      const stock = getLiveStock();
      const result = await queryGeminiStylist(text, stock);

      // Hide typing
      showTypingIndicator(false);
      AI_STATE.isSearching = false;

      // Append Stylist response
      let responseText = result.text;
      if (result.note) {
        responseText += `\n\n<small style="opacity:0.75; font-size:0.72rem;">${result.note}</small>`;
      }
      appendMessage('stylist', responseText, result.products);

    } catch (err) {
      console.error('[AI Stylist] Query error:', err);
      showTypingIndicator(false);
      AI_STATE.isSearching = false;
      appendMessage('stylist', "I apologize, my atelier catalog lookup experienced a brief delay. Here are our premier festive recommendations for you:", getLiveStock().slice(0, 2));
    }
  }

  // ---------------------------------------------------------------------------
  // 6. GLOBAL UNIFIED PRODUCT ACTIONS (Quick View & Add to Bag)
  // ---------------------------------------------------------------------------
  window.openProductQuickView = function (productId) {
    // Check if openQuickViewModal exists (app.js)
    if (typeof openQuickViewModal === 'function') {
      openQuickViewModal(productId);
      return;
    }
    // Check if openProductModal exists (shop.js)
    if (typeof openProductModal === 'function') {
      openProductModal(productId);
      return;
    }
    console.warn('[AI Stylist] No Quick View modal handler found for id:', productId);
  };

  window.aiStylistQuickAdd = function (productId) {
    const stock = getLiveStock();
    const product = stock.find(p => p.id === productId);
    if (!product) return;

    const size = (Array.isArray(product.sizes) && product.sizes[0]) || 'M';
    const color = (Array.isArray(product.colors) && product.colors[0]) || { name: 'Standard', hex: '#111' };

    // Call page addToCart function
    if (typeof addToCart === 'function') {
      addToCart(product, size, color, 1);
    } else if (typeof quickAddToCart === 'function') {
      quickAddToCart(productId);
    }

    // Open Cart Drawer
    if (typeof openCartDrawer === 'function') {
      openCartDrawer();
    } else if (typeof closeAllDrawers === 'function') {
      const cartDrawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('drawerBackdrop');
      if (cartDrawer) cartDrawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('modal-open');
    }

    if (typeof showToast === 'function') {
      showToast(`Added ${product.name} to your shopping bag!`, 'success');
    }
  };

  // ---------------------------------------------------------------------------
  // 7. INITIALIZE AI STYLIST DOM & EVENTS
  // ---------------------------------------------------------------------------
  function initAiStylist() {
    const modal = document.getElementById('aiStylistModal');
    const triggerBtn = document.getElementById('aiStylistTriggerBtn');
    const closeBtn = document.getElementById('aiStylistCloseBtn');
    const form = document.getElementById('aiStylistForm');
    const input = document.getElementById('aiStylistInput');
    const configBtn = document.getElementById('aiStylistConfigBtn');
    const apiPanel = document.getElementById('aiStylistApiPanel');
    const apiClose = document.getElementById('aiStylistApiPanelClose');
    const saveKeyBtn = document.getElementById('saveGeminiApiKeyBtn');
    const clearKeyBtn = document.getElementById('clearGeminiApiKeyBtn');
    const keyInput = document.getElementById('geminiApiKeyInput');
    const keyStatus = document.getElementById('geminiApiKeyStatus');

    if (!modal) return;

    // Load active key
    AI_STATE.apiKey = getActiveApiKey();
    updateStatusBadge();

    // Open / Close modal
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        updateStatusBadge();

        // If thread is empty, show welcome message
        const thread = document.getElementById('aiChatThread');
        if (thread && thread.children.length === 0) {
          appendMessage(
            'stylist',
            "Namaste! ✨ Welcome to the Vikamour Atelier. I am your personal AI Stylist, connected directly to our boutique inventory.\n\nTell me about your upcoming occasion, preferred colors, silhouette, or budget (e.g. *'I need an outfit for my cousin's Sangeet in rani pink'* or *'Show me Flat ₹999 cotton kurtas'*), and I will curate the perfect handcrafted pieces for you."
          );
        }

        setTimeout(() => {
          if (input) input.focus();
        }, 300);
      });
    }

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      if (apiPanel) apiPanel.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input) handleUserQuery(input.value);
      });
    }

    // Quick prompt suggestion chips
    document.querySelectorAll('.ai-chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) handleUserQuery(query);
      });
    });

    // API Key Settings toggle
    if (configBtn && apiPanel) {
      configBtn.addEventListener('click', () => {
        const isShown = apiPanel.style.display !== 'none';
        apiPanel.style.display = isShown ? 'none' : 'block';
        if (!isShown && keyInput) {
          keyInput.value = getActiveApiKey();
          keyInput.focus();
        }
      });
    }

    if (apiClose && apiPanel) {
      apiClose.addEventListener('click', () => {
        apiPanel.style.display = 'none';
      });
    }

    // Save API Key button
    if (saveKeyBtn && keyInput) {
      saveKeyBtn.addEventListener('click', () => {
        const val = keyInput.value.trim();
        if (!val) {
          if (keyStatus) keyStatus.innerHTML = '<span style="color:#DC2626;">Please enter a valid Gemini API key.</span>';
          return;
        }
        saveApiKey(val);
        if (keyStatus) {
          keyStatus.innerHTML = '<span style="color:#059669;">✓ Gemini API Key saved! Live AI reasoning active.</span>';
        }
        if (typeof showToast === 'function') {
          showToast('Gemini API Key activated for AI Stylist!', 'success');
        }
        setTimeout(() => {
          if (apiPanel) apiPanel.style.display = 'none';
        }, 1200);
      });
    }

    // Clear API Key button
    if (clearKeyBtn && keyInput) {
      clearKeyBtn.addEventListener('click', () => {
        clearApiKey();
        keyInput.value = '';
        if (keyStatus) {
          keyStatus.innerHTML = '<span style="color:#B45309;">Key removed. Switched to Atelier Matcher.</span>';
        }
        if (typeof showToast === 'function') {
          showToast('Gemini API Key removed. Using local stock matcher.', 'info');
        }
      });
    }
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiStylist);
  } else {
    initAiStylist();
  }

})();

# VIKAMOUR — Indian Festive & Contemporary Ethnic Wear E-Commerce

A modern, high-fashion Indian ethnic wear e-commerce store crafted for **Vikamour**. Designed with celebratory festive visual identity, authentic handloom craftsmanship, and full-stack interactive client-side shopping capabilities.

Repository: [https://github.com/BEPAWSITIVE/vikamour-website](https://github.com/BEPAWSITIVE/vikamour-website)

---

## ✨ Highlights & Architecture

### 1. 🔤 Unified Typography
- Universal geometric font: **Plus Jakarta Sans** (Google Fonts) applied consistently across navigation, headings, buttons, forms, product cards, filters, drawers, and checkout modals.
- Celebratory poster display accents: **Oswald** (for bold billboard numbers & sale headers) and **Playball** (for cursive script highlights like *"Beyond Special"*).

### 2. 🇮🇳 Indian Rupee (INR ₹) Primary Pricing
- Base pricing configured in **Indian Rupees (₹)** with authentic Indian number grouping (`en-IN`: e.g. `₹ 999`, `₹ 1,699`, `₹ 2,499`, `₹ 3,499`).
- Seamless live conversion to **USD ($)**, **EUR (€)**, and **GBP (£)** via the currency selector pill in the header.
- Realistic Indian e-commerce logistics:
  - **Free Express Courier Shipping**: Automatically unlocked on orders over **₹ 1,499**.
  - **Standard Express Courier**: ₹ 99 for orders below ₹ 1,499.
  - **GST Calculation**: Accurate 12% GST calculation on apparel.
  - **Payment Options**: UPI (Google Pay, PhonePe, Paytm, QR), Credit/Debit Cards, NetBanking, and Cash on Delivery.

### 3. 🪔 Festive Golden Hero Banner
- Radiant festive golden amber gradient (`#FAA818` to `#E58E00`) matching premier ethnic wear brand aesthetic.
- **Model Lockup**: Festive model in radiant rani pink embroidered kurta set with branded yellow `वी | VIKAMOUR` shopping bag (*"She is Special"*).
- **Center Poster**: Condensed bold **`HAPPINESS`** typography paired with fluid cursive script **`Beyond Special`**.
- **Promotional Billboard Block**: `BIG END OF SEASON SALE FLAT ₹999*` billboard with the `वी | VIKAMOUR` emblem. Clicking the billboard links straight to the Flat ₹999 collection.
- **Floating `✨ AI Stylist` Widget**: Interactive personal styling assistant recommending ensembles for Festive Puja, Weddings, Daily Wear, or Budget Steals under ₹1000.

### 4. 🛍️ Dedicated Shop Collection Page (`shop.html`)
- Dedicated full-width collection page with two-column responsive layout:
  - **Sticky Desktop Filter Sidebar**:
    - **Wardrobe Categories**: All Outfits, Flat ₹999 Deals, Kurtas & Kurtis, Sets with Dupatta, Ethnic Sets, Co-Ords, Festive Dresses.
    - **Price Range & Quick Brackets**: Range slider (₹999 to ₹6,000) + quick bracket buttons (*Under ₹1,000*, *₹1,000 - ₹2,000*, *₹2,000 - ₹3,500*, *Above ₹3,500*).
    - **Festive Shades / Colors**: Swatches for Rani Pink, Mustard Gold, Indigo Blue, Emerald Green, Wine Maroon, Royal Teal, Ice Blue.
    - **Sizes**: XS, S, M, L, XL, XXL.
    - **Heritage Fabrics**: Pure Combed Cotton, Chanderi Silk Blend, Handblock Mulmul, Poly Georgette, Modal Satin, Zari Jacquard.
    - **Occasion**: Festive Puja & Diwali, Wedding & Sangeet, Daily & Office, Evening Fusion.
    - **Special Offers**: Flat ₹999 Deals, 30% Off & Above, 50% Off & Above.
  - **Main Catalog Area**:
    - Real-time in-shop search with 1-click clear.
    - Sorting by Featured, Price Low-High, Price High-Low, Rating, Newest, Discount.
    - Grid view switcher (2, 3, 4 columns).
    - Dynamic active filter tag chips with 1-click removal & "Clear All".
    - Mobile slide-over filter drawer on smaller screens.
- **Deep-linking & URL Parameters**: Filter states can be bookmarked and shared (e.g. `shop.html?category=sale999`, `shop.html?category=kurtas`).

### 5. 🛒 Sliding Drawers & Interactive Checkout Flow
- **Shopping Bag Drawer**: Live quantity steppers, subtotal/shipping/GST breakdown, promo code engine (`VIKA10` for 10% off), and complimentary express shipping meter.
- **Saved Wishlist Drawer**: Heart toggle on cards and quick "Move to Bag" action.
- **Product Quick View Modal**: High-res multi-angle image gallery with thumbnail switcher, color swatches, size selection, stock countdown, and fabric care specs.
- **4-Step Checkout Flow**: Delivery address, express courier selection, secure payment gateway (UPI/Cards/NetBanking), and order confirmation celebration with generated Order ID.

### 6. ✨ Google Gemini Conversational AI Stylist & Live Stock Search
- **Conversational Natural Language Interface**: Customers type their styling or event requirements in natural language (e.g. *"Sister's Sangeet outfit in rani pink under ₹3,500"*, *"Pure cotton daily wear kurtas under ₹1,000"*).
- **Live Stock Search & Reasoning**: Connected directly to the boutique inventory (Supabase cloud database or curated catalog), reasoning about fabric drape, event color resonance, and silhouette pairings.
- **Embedded Interactive Product Cards**: Recommends 1 to 3 items with direct **Quick View** and **Add to Bag** actions inside the chat thread.
- **Google Gemini API Support**: Uses `gemini-1.5-flash` with dual configuration options:
  - **In-App Settings Panel**: Click the gear icon in the chat header to paste and save your Gemini API key directly in your browser.
  - **Configuration File**: Set `window.VIKAMOUR_CONFIG.GEMINI_API_KEY` in `gemini-config.js`.
- **Intelligent Offline Fallback Engine**: If no API key is supplied or network quota is unavailable, the intelligent Atelier Stock Matcher automatically activates to provide personalized suggestions.

### 7. ⚡ Supabase Cloud Database & Authentication
- **Live Cloud Database Integration**: Connects with PostgreSQL via Supabase for real-time e-commerce operations.
- **Database Schema & Migrations (`supabase-schema.sql`)**:
  - `products`: Dynamic catalog with JSONB colors, sizes, images, stock, and pricing.
  - `orders`: Real-time order capture with customer details, shipping address, totals, and statuses.
  - `order_items`: Line items for each placed order linked via foreign keys.
  - `profiles`: Registered customer accounts linked with `auth.users` via PostgreSQL triggers.
  - `newsletter_subscribers`: Cloud capture of newsletter and VIP club sign-ups.
- **Row Level Security (RLS)**: Enforced across all tables for data protection.
- **Member Account Modal**:
  - Customer Sign In & Registration powered by Supabase Auth.
  - Order Tracking & Order History query tool.
  - In-browser Supabase credentials setup & live connection testing.
- **Graceful Fallback Mode**: The entire website operates smoothly in local offline mode even before Supabase credentials are configured.

---

## ⚡ Connecting to Supabase (3 Simple Steps)

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. In the left navigation, click on **SQL Editor** -> **New Query**.
3. Open `supabase-schema.sql` from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
   *(This automatically creates all 5 tables, sets up Row Level Security, configures the user profile trigger, and seeds all 17 Vikamour ethnic wear products!)*

### Step 2: Get Your API Credentials
In your Supabase project dashboard, navigate to **Project Settings** -> **API**:
- Copy your **Project URL** (e.g. `https://your-project-id.supabase.co`)
- Copy your **Project API anon / public key** (e.g. `eyJhbGciOi...`)

### Step 3: Connect Your Website
You can connect in either of two ways:
- **Option A (In-Browser UI)**: Click the **User Account icon** in the top navigation header, switch to the **Supabase Cloud** tab, paste your URL and Anon Key, and click **Connect & Test Backend**.
- **Option B (Code Configuration)**: Open `supabase-client.js` and paste your URL and key into `DEFAULT_SUPABASE_URL` and `DEFAULT_SUPABASE_ANON_KEY`.

---

## 🚀 How to Run Locally

### Method 1: Python Server (Recommended)
```powershell
python server.py --open
```
Starts the secure local development server at `http://localhost:8000` with Content Security Policy (CSP) headers configured for Supabase.

### Method 2: Direct File Launch
Double click `index.html` or `shop.html` in your file explorer to view in any modern browser.

---

## 📁 Repository Structure

```
vikamour-website/
│
├── index.html            # Home page with header, festive hero banner, lookbook, and drawers
├── shop.html             # Dedicated shop page with sticky filter sidebar and collection grid
├── styles.css            # Unified design system, CSS variables, typography, and responsive rules
├── products.js           # Curated Indian ethnic wear dataset (INR base rate), reviews, currencies
├── supabase-client.js    # Supabase JavaScript client, database APIs, auth, and account modal controller
├── supabase-schema.sql   # Complete PostgreSQL schema, RLS policies, trigger, and seed data
├── app.js                # Home page interactive logic, cart, wishlist, and modal management
├── shop.js               # Dedicated shop page filtering engine, URL parsing, and state manager
├── server.py             # Hardened local development server with CSP security headers
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

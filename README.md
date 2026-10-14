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

---

## 🚀 How to Run Locally

### Method 1: Python Server (Recommended)
```powershell
python server.py --open
```
Starts the local development server at `http://localhost:8000` and opens default browser.

### Method 2: Direct File Launch
Double click `index.html` or `shop.html` in your file explorer to view in any modern browser.

---

## 📁 Repository Structure

```
vikamour-website/
│
├── index.html       # Home page with header, festive hero banner, lookbook, and drawers
├── shop.html        # Dedicated shop page with sticky filter sidebar and collection grid
├── styles.css       # Unified design system, CSS variables, typography, and responsive rules
├── products.js      # Curated Indian ethnic wear dataset (INR base rate), reviews, currencies
├── app.js           # Home page interactive logic, cart, wishlist, and modal management
├── shop.js          # Dedicated shop page filtering engine, URL parsing, and state manager
├── server.py        # Lightweight development server script
├── .gitignore       # Git ignore rules
└── README.md        # Project documentation
```

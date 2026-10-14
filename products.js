/**
 * VIKAMOUR Atelier - Ethnic & Contemporary Indian Fashion Collection
 * Curated catalog matching the festive & everyday ethnic wear aesthetic:
 * Kurtas & Kurtis, Ethnic Sets with Dupatta, Co-Ords, Festive Dresses, and Flat ₹999 Deals.
 */

const VIKAMOUR_PRODUCTS = [
  // --- Flat ₹999 Special Sale Items ---
  {
    id: "vk-sale-1",
    name: "Fuchsia Floral Printed Straight Kurta",
    subtitle: "Pure cotton daily kurta with notched mandarin collar",
    category: "kurtas",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Pure Combed Cotton",
    occasion: "daily",
    occasionLabel: "Daily & Office",
    price: 999,
    originalPrice: 2499,
    rating: 4.8,
    reviewCount: 114,
    badge: "Flat ₹999",
    isSale999: true,
    isNew: false,
    featured: true,
    colors: [
      { name: "Fuchsia Pink", hex: "#E0115F" },
      { name: "Mustard Gold", hex: "#E5A93B" },
      { name: "Royal Teal", hex: "#008080" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Brighten your wardrobe with this handcrafted straight-cut kurta crafted from 60s pure combed cotton. Features exquisite traditional floral print motifs, a graceful keyhole neckline, and three-quarter sleeves.",
    composition: "100% Breathable Combed Cotton 60s",
    care: "Gentle machine wash cold. Dry inside-out in shade.",
    origin: "Jaipur Atelier, Rajasthan",
    stock: 24
  },
  {
    id: "vk-sale-2",
    name: "Indigo Dabu Print A-Line Kurti",
    subtitle: "Organic mud-resist indigo handblock craft",
    category: "kurtas",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Handblock Mulmul",
    occasion: "daily",
    occasionLabel: "Daily & Office",
    price: 999,
    originalPrice: 2199,
    rating: 4.9,
    reviewCount: 88,
    badge: "Flat ₹999",
    isSale999: true,
    isNew: true,
    featured: true,
    colors: [
      { name: "Indigo Blue", hex: "#1A2E40" },
      { name: "Bagru Rust", hex: "#B7410E" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    description: "An authentic Bagru indigo handblock kurti with a breezy flared silhouette. Designed with side slits, mirror detailing around the placket, and subtle wooden buttons.",
    composition: "100% Handloom Cotton with Natural Dyes",
    care: "Hand wash separately in cold water for first 2 washes.",
    origin: "Bagru Artisanal Cluster, Rajasthan",
    stock: 19
  },
  {
    id: "vk-sale-3",
    name: "Saffron Georgette Flared Peplum Kurti",
    subtitle: "Lightweight tiered peplum with zari thread highlights",
    category: "kurtas",
    gender: "women",
    fabric: "georgette",
    fabricLabel: "Poly Georgette",
    occasion: "festive",
    occasionLabel: "Festive & Puja",
    price: 999,
    originalPrice: 1999,
    rating: 4.7,
    reviewCount: 65,
    badge: "Flat ₹999",
    isSale999: true,
    isNew: false,
    featured: true,
    colors: [
      { name: "Saffron Gold", hex: "#FFA500" },
      { name: "Ruby Maroon", hex: "#800020" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Effortlessly festive tiered peplum kurti in featherlight poly-georgette with santoon lining. Adorned with delicate sequin and zari piping across the yoke.",
    composition: "Faux Georgette with Butter Crepe Lining",
    care: "Dry clean or gentle hand wash.",
    origin: "Surat Craft Mill, Gujarat",
    stock: 15
  },
  {
    id: "vk-sale-4",
    name: "Haldi Yellow Embroidered Straight Kurti",
    subtitle: "Festive cotton mulmul with silver gota thread borders",
    category: "kurtas",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Pure Combed Cotton",
    occasion: "festive",
    occasionLabel: "Festive & Puja",
    price: 999,
    originalPrice: 2299,
    rating: 4.8,
    reviewCount: 42,
    badge: "Flat ₹999",
    isSale999: true,
    isNew: true,
    featured: false,
    colors: [
      { name: "Mustard Gold", hex: "#E5A93B" },
      { name: "Fuchsia Pink", hex: "#E0115F" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A joyful haldi yellow straight kurti tailored from soft 60s cotton mulmul. Detailed with refined silver gota patti around the round neckline and sleeves.",
    composition: "100% Fine Combed Cotton",
    care: "Hand wash inside-out.",
    origin: "Jaipur, Rajasthan",
    stock: 22
  },

  // --- Ethnic Sets with Dupatta ---
  {
    id: "vk-set-1",
    name: "Rani Pink Zardozi Kurta Set with Organza Dupatta",
    subtitle: "Heavy hand-embroidered kurta, silk pants & scalloped dupatta",
    category: "ethnic-sets-dupatta",
    gender: "women",
    fabric: "chanderi-silk",
    fabricLabel: "Chanderi Silk Blend",
    occasion: "wedding",
    occasionLabel: "Wedding & Sangeet",
    price: 3499,
    originalPrice: 5999,
    rating: 5.0,
    reviewCount: 92,
    badge: "Festive Hit",
    isSale999: false,
    isNew: true,
    featured: true,
    colors: [
      { name: "Rani Fuchsia", hex: "#D90368" },
      { name: "Golden Mustard", hex: "#E5A93B" },
      { name: "Emerald Green", hex: "#006A4E" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "The showstopper from the Happiness Beyond Special collection. Crafted in rich chanderi silk with intricate gota patti and zardozi needlework, accompanied by tailored cigarette pants and a diaphanous organza dupatta with cutwork borders.",
    composition: "Kurta: Chanderi Silk Blend; Pants: Modal Silk; Dupatta: Pure Organza",
    care: "Dry clean only. Iron with protective cloth.",
    origin: "Lucknow Zardozi Atelier, Uttar Pradesh",
    stock: 11
  },
  {
    id: "vk-set-2",
    name: "Mustard Embroidered Anarkali Set with Silk Dupatta",
    subtitle: "Flared kalidar silhouette with gota borders and banarasi weave",
    category: "ethnic-sets-dupatta",
    gender: "women",
    fabric: "chanderi-silk",
    fabricLabel: "Chanderi Silk Blend",
    occasion: "festive",
    occasionLabel: "Festive & Puja",
    price: 2999,
    originalPrice: 4999,
    rating: 4.9,
    reviewCount: 76,
    badge: "Bestseller",
    isSale999: false,
    isNew: false,
    featured: true,
    colors: [
      { name: "Mustard Ochre", hex: "#D49B28" },
      { name: "Wine Berry", hex: "#58111A" },
      { name: "Navy Blue", hex: "#1B2A4A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Magnificent 24-kali flared Anarkali set featuring heavy zari thread work on the bodice. Paired with comfortable churidar leggings and an opulent Banarasi woven art-silk dupatta.",
    composition: "Silk Blend Kalidar with Cotton Lining & Art-Silk Dupatta",
    care: "Dry clean recommended.",
    origin: "Varanasi Weaving Workshop",
    stock: 8
  },
  {
    id: "vk-set-3",
    name: "Pastel Sage Green Chanderi Suit Set",
    subtitle: "Minimalist thread embroidery with gold tissue dupatta",
    category: "ethnic-sets-dupatta",
    gender: "women",
    fabric: "chanderi-silk",
    fabricLabel: "Chanderi Handloom",
    occasion: "daily",
    occasionLabel: "Daily & Office",
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviewCount: 43,
    badge: "New Season",
    isSale999: false,
    isNew: true,
    featured: false,
    colors: [
      { name: "Sage Mint", hex: "#9CAF88" },
      { name: "Powder Peach", hex: "#FFDAB9" },
      { name: "Ice Blue", hex: "#AFEEEE" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Understated luxury for day festivities. Made from airy chanderi with tone-on-tone resham embroidery, matched with straight ankle-length trousers and shimmering tissue dupatta.",
    composition: "Chanderi Cotton-Silk with Fine Mul Lining",
    care: "Gentle hand wash cold or dry clean.",
    origin: "Chanderi Handloom Guild, Madhya Pradesh",
    stock: 14
  },
  {
    id: "vk-set-4",
    name: "Emerald Green Silk Anarkali Set with Banarasi Dupatta",
    subtitle: "Grand festive kalidar with regal brocade woven dupatta",
    category: "ethnic-sets-dupatta",
    gender: "women",
    fabric: "chanderi-silk",
    fabricLabel: "Chanderi Silk Blend",
    occasion: "wedding",
    occasionLabel: "Wedding & Sangeet",
    price: 3799,
    originalPrice: 6499,
    rating: 4.9,
    reviewCount: 51,
    badge: "Regal Edit",
    isSale999: false,
    isNew: true,
    featured: true,
    colors: [
      { name: "Emerald Green", hex: "#006A4E" },
      { name: "Wine Berry", hex: "#58111A" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Regal emerald green Anarkali ensemble radiating heritage splendor. Crafted with fine resham and sequin highlights on the bodice, accompanied by a rich Banarasi zari dupatta.",
    composition: "Art Silk Kalidar with Shantoon Lining & Banarasi Woven Dupatta",
    care: "Dry clean only.",
    origin: "Varanasi Atelier",
    stock: 9
  },

  // --- Ethnic Sets (Kurta + Bottom) ---
  {
    id: "vk-eth-1",
    name: "Maroon Mirror-Work Kurta & Palazzo Set",
    subtitle: "Straight calf-length kurta with flared palazzo pants",
    category: "ethnic-sets",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Rayon Slub & Cotton",
    occasion: "festive",
    occasionLabel: "Festive & Puja",
    price: 1899,
    originalPrice: 2999,
    rating: 4.9,
    reviewCount: 57,
    badge: "Popular",
    isSale999: false,
    isNew: false,
    featured: true,
    colors: [
      { name: "Deep Maroon", hex: "#63101E" },
      { name: "Olive Green", hex: "#556B2F" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A timeless duo featuring authentic mirror-work embellishments on the yoke and cuffs. Paired with extra-wide flowing cotton palazzos for effortless elegance all day.",
    composition: "100% Rayon Slub with Cotton Facing",
    care: "Gentle machine wash inside a laundry bag.",
    origin: "Kutch Craft Center, Gujarat",
    stock: 20
  },
  {
    id: "vk-eth-2",
    name: "Teal Blue Floral Printed Kurta with Afghani Salwar",
    subtitle: "Contemporary Afghani pleated cuff pant with tunic kurta",
    category: "ethnic-sets",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Pure Combed Cotton",
    occasion: "daily",
    occasionLabel: "Daily & Office",
    price: 1699,
    originalPrice: 2799,
    rating: 4.8,
    reviewCount: 39,
    badge: "Trending",
    isSale999: false,
    isNew: true,
    featured: false,
    colors: [
      { name: "Peacock Teal", hex: "#005F73" },
      { name: "Dusty Rose", hex: "#DCAE96" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Modern fusion styling with comfort at heart. Features a short straight tunic paired with on-trend pleated Afghani salwar pants adorned with delicate lace accents at the cuffs.",
    composition: "Pure Cotton Mulmul (60x60)",
    care: "Machine wash cold gentle cycle.",
    origin: "Sanganer Textile Studio, Jaipur",
    stock: 18
  },
  {
    id: "vk-eth-3",
    name: "Powder Blue Chikankari Kurta & Pant Set",
    subtitle: "Handcrafted Lucknowi shadow work with pearl accents",
    category: "ethnic-sets",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Handloom Mulmul",
    occasion: "daily",
    occasionLabel: "Daily & Office",
    price: 1899,
    originalPrice: 2999,
    rating: 4.9,
    reviewCount: 33,
    badge: "Artisanal",
    isSale999: false,
    isNew: true,
    featured: false,
    colors: [
      { name: "Ice Blue", hex: "#AFEEEE" },
      { name: "Sage Mint", hex: "#9CAF88" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Delicate Lucknow Chikankari embroidery needlework across pure mulmul cotton. Includes matching tapered ankle trousers with embroidered hems.",
    composition: "100% Breathable Mulmul Cotton with Cotton Slip",
    care: "Hand wash gentle.",
    origin: "Lucknow Artisans, UP",
    stock: 16
  },

  // --- Co-Ords (Fusion & Contemporary) ---
  {
    id: "vk-coord-1",
    name: "Golden Amber Jacquard Peplum Co-Ord Set",
    subtitle: "Belted peplum top with tailored straight-fit cigarette trousers",
    category: "co-ords",
    gender: "women",
    fabric: "jacquard",
    fabricLabel: "Zari Jacquard",
    occasion: "party",
    occasionLabel: "Evening Fusion",
    price: 2199,
    originalPrice: 3499,
    rating: 5.0,
    reviewCount: 48,
    badge: "Runway",
    isSale999: false,
    isNew: true,
    featured: true,
    colors: [
      { name: "Amber Gold", hex: "#E5A93B" },
      { name: "Classic Noir", hex: "#111111" },
      { name: "Emerald", hex: "#1C352D" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    description: "The pinnacle of modern Indian festive fusion. Tailored in structured zari jacquard with a fabric belt featuring metallic buckle, paired with sleek high-waisted cigarette pants.",
    composition: "Woven Zari Jacquard with Soft Viscose Lining",
    care: "Dry clean only.",
    origin: "Bengaluru Design Studio",
    stock: 12
  },
  {
    id: "vk-coord-2",
    name: "Floral Satin Kaftan & Pant Co-Ord Set",
    subtitle: "Relaxed V-neck kaftan with drawstring waist & matching trousers",
    category: "co-ords",
    gender: "women",
    fabric: "modal-satin",
    fabricLabel: "Modal Satin",
    occasion: "party",
    occasionLabel: "Evening Fusion",
    price: 1999,
    originalPrice: 2999,
    rating: 4.8,
    reviewCount: 31,
    badge: "Resort Luxe",
    isSale999: false,
    isNew: false,
    featured: false,
    colors: [
      { name: "Berry Plum", hex: "#4B0082" },
      { name: "Turquoise Aqua", hex: "#00CED1" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Effortlessly glamorous silhouette tailored from buttery modal satin. Designed with batwing sleeves, custom metallic tassels at the waist, and straight ankle pants.",
    composition: "100% Modal Satin (OEKO-TEX Standard)",
    care: "Hand wash cold or gentle machine wash.",
    origin: "Mumbai Atelier",
    stock: 16
  },
  {
    id: "vk-coord-3",
    name: "Rani Pink Embroidered Crop Top & Flared Sharara Co-Ord",
    subtitle: "Mirror-accented sleeveless crop bustier with tiered sharara pants",
    category: "co-ords",
    gender: "women",
    fabric: "modal-satin",
    fabricLabel: "Modal Satin",
    occasion: "wedding",
    occasionLabel: "Wedding & Sangeet",
    price: 2399,
    originalPrice: 3999,
    rating: 4.9,
    reviewCount: 38,
    badge: "Festive Hit",
    isSale999: false,
    isNew: true,
    featured: true,
    colors: [
      { name: "Rani Fuchsia", hex: "#D90368" },
      { name: "Amber Gold", hex: "#E5A93B" }
    ],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "A showstopping sangeet silhouette pairing a mirror-bordered fitted bustier crop top with voluminous tiered flare sharara bottoms.",
    composition: "Pure Modal Satin with Shantoon Lining",
    care: "Dry clean only.",
    origin: "Delhi Studio",
    stock: 10
  },

  // --- Dresses (Ethnic & Indo-Western) ---
  {
    id: "vk-dress-1",
    name: "Bandhani Print Flared Tiered Maxi Dress",
    subtitle: "Floor-length ethnic maxi dress with tassels and smocked back",
    category: "dresses",
    gender: "women",
    fabric: "cotton",
    fabricLabel: "Pure Combed Cotton",
    occasion: "festive",
    occasionLabel: "Festive & Puja",
    price: 1799,
    originalPrice: 2899,
    rating: 4.9,
    reviewCount: 52,
    badge: "Festive Hit",
    isSale999: false,
    isNew: true,
    featured: true,
    colors: [
      { name: "Rani Pink & Gold", hex: "#D90368" },
      { name: "Haldi Yellow", hex: "#E5A93B" },
      { name: "Forest Green", hex: "#1C352D" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Swirl through celebrations with this 3-tier festive maxi dress. Embellished with mirror-work lace along the V-neckline, smocked elasticated back for a bespoke fit, and vibrant Bandhani motifs.",
    composition: "Pure Cotton Cambric with Soft Cotton Voile Lining",
    care: "Gentle machine wash cold.",
    origin: "Ahmedabad Craft Guild",
    stock: 20
  },
  {
    id: "vk-dress-2",
    name: "Embroidered Georgette Anarkali Gown",
    subtitle: "Full-length partywear gown with sequin zari yoke",
    category: "dresses",
    gender: "women",
    fabric: "georgette",
    fabricLabel: "Poly Georgette",
    occasion: "wedding",
    occasionLabel: "Wedding & Sangeet",
    price: 2799,
    originalPrice: 4499,
    rating: 4.9,
    reviewCount: 68,
    badge: "Wedding Edit",
    isSale999: false,
    isNew: false,
    featured: true,
    colors: [
      { name: "Wine Red", hex: "#722F37" },
      { name: "Midnight Navy", hex: "#1B2A4A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    ],
    description: "An evening masterpiece boasting over 5 meters of flare. Delicately stitched micro-sequins sparkle across the yoke, completed with a flared hemline and sweetheart neckline.",
    composition: "Heavy Poly-Georgette with Shantoon Lining",
    care: "Dry clean only.",
    origin: "Delhi Couture Atelier",
    stock: 9
  },
  {
    id: "vk-dress-3",
    name: "Teal Blue Floral Print Tiered Festive Gown",
    subtitle: "Floor-skimming flared gown with gold piping and potli button front",
    category: "dresses",
    gender: "women",
    fabric: "georgette",
    fabricLabel: "Poly Georgette",
    occasion: "party",
    occasionLabel: "Evening Fusion",
    price: 2199,
    originalPrice: 3699,
    rating: 4.8,
    reviewCount: 29,
    badge: "Party Luxe",
    isSale999: false,
    isNew: true,
    featured: false,
    colors: [
      { name: "Peacock Teal", hex: "#005F73" },
      { name: "Ruby Maroon", hex: "#800020" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    description: "An opulent teal blue tiered gown with graceful flare and subtle metallic accents. Perfect for cocktail evenings and reception parties.",
    composition: "Poly Georgette with Butter Crepe Lining",
    care: "Dry clean only.",
    origin: "Surat, Gujarat",
    stock: 14
  }
];

// Customer Testimonials & Press Mentions
const VIKAMOUR_REVIEWS = [
  {
    author: "Pooja Sharma",
    role: "Verified Buyer — New Delhi",
    rating: 5,
    title: "The Rani Pink Set made Diwali unforgettable!",
    text: "The embroidery, fabric quality, and organza dupatta felt like a designer boutique outfit. Got endless compliments! Delivery was super fast.",
    date: "October 2026",
    product: "Rani Pink Zardozi Kurta Set with Organza Dupatta"
  },
  {
    author: "Ananya Iyer",
    role: "Verified Buyer — Bengaluru",
    rating: 5,
    title: "Best Kurtis for work and festive days",
    text: "Ordered the Flat ₹999 kurtis and was stunned by the pure cotton quality. The stitching and fit are 10/10. Vikamour is my go-to ethnic brand now.",
    date: "September 2026",
    product: "Fuchsia Floral Printed Straight Kurta"
  },
  {
    author: "Meera Sen",
    role: "Fashion Stylist — Mumbai",
    rating: 5,
    title: "Stunning tailoring & authentic Indian crafts",
    text: "Vikamour brings modern cuts to heritage textiles. The jacquard co-ord and anarkali sets have impeccable finish and luxurious hand-feel.",
    date: "August 2026",
    product: "Golden Amber Jacquard Peplum Co-Ord Set"
  }
];

// Primary currency: Indian Rupee (INR ₹) as base rate 1.0
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1.0, name: "Indian Rupee" },
  USD: { symbol: "$", rate: 0.0118, name: "US Dollar" },
  EUR: { symbol: "€", rate: 0.0109, name: "Euro" },
  GBP: { symbol: "£", rate: 0.0093, name: "British Pound" }
};

-- =============================================================================
-- VIKAMOUR ATELIER - SUPABASE DATABASE SCHEMA & SEED DATA
-- =============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> Click on 'SQL Editor' in the left navigation
-- 3. Click 'New Query', paste the contents of this file, and click 'Run'.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  category VARCHAR(50) NOT NULL,
  gender VARCHAR(20) DEFAULT 'women',
  fabric VARCHAR(50),
  fabric_label VARCHAR(100),
  occasion VARCHAR(50),
  occasion_label VARCHAR(100),
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  rating NUMERIC DEFAULT 4.8,
  review_count INTEGER DEFAULT 0,
  badge VARCHAR(50),
  is_sale999 BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  colors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  composition TEXT,
  care TEXT,
  origin TEXT,
  stock INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast catalog filtering & searches
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_sale ON public.products(is_sale999);

-- -----------------------------------------------------------------------------
-- 2. PROFILES TABLE (Customer Accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  shipping_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  shipping_method TEXT DEFAULT 'standard',
  payment_method TEXT DEFAULT 'card',
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  promo_code TEXT,
  shipping_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);

-- -----------------------------------------------------------------------------
-- 4. ORDER ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id VARCHAR(50),
  product_name TEXT NOT NULL,
  product_image TEXT,
  size VARCHAR(20),
  color_name VARCHAR(50),
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- -----------------------------------------------------------------------------
-- 5. NEWSLETTER SUBSCRIBERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source VARCHAR(50) DEFAULT 'footer',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read products
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders: Anyone can create an order (guest or authenticated)
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;
CREATE POLICY "Anyone can place orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Orders: Authenticated users can view their own orders; guests can view with order_number + email
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL)
  );

-- Order Items: Anyone can insert order items
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (true);

-- Newsletter: Anyone can subscribe
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 7. AUTOMATIC PROFILE TRIGGER ON USER SIGNUP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 8. SEED DATA - INSERT ALL VIKAMOUR PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO public.products (id, name, subtitle, category, gender, fabric, fabric_label, occasion, occasion_label, price, original_price, rating, review_count, badge, is_sale999, is_new, featured, colors, sizes, images, description, composition, care, origin, stock) VALUES
  ('vk-sale-1', 'Fuchsia Floral Printed Straight Kurta', 'Pure cotton daily kurta with notched mandarin collar', 'kurtas', 'women', 'cotton', 'Pure Combed Cotton', 'daily', 'Daily & Office', 999, 2499, 4.8, 114, 'Flat ₹999', true, false, true, '[{"name":"Fuchsia Pink","hex":"#E0115F"},{"name":"Mustard Gold","hex":"#E5A93B"},{"name":"Royal Teal","hex":"#008080"}]'::jsonb, '["XS","S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Brighten your wardrobe with this handcrafted straight-cut kurta crafted from 60s pure combed cotton. Features exquisite traditional floral print motifs, a graceful keyhole neckline, and three-quarter sleeves.', '100% Breathable Combed Cotton 60s', 'Gentle machine wash cold. Dry inside-out in shade.', 'Jaipur Atelier, Rajasthan', 24),
  ('vk-sale-2', 'Indigo Dabu Print A-Line Kurti', 'Organic mud-resist indigo handblock craft', 'kurtas', 'women', 'cotton', 'Handblock Mulmul', 'daily', 'Daily & Office', 999, 2199, 4.9, 88, 'Flat ₹999', true, true, true, '[{"name":"Indigo Blue","hex":"#1A2E40"},{"name":"Bagru Rust","hex":"#B7410E"}]'::jsonb, '["S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'An authentic Bagru indigo handblock kurti with a breezy flared silhouette. Designed with side slits, mirror detailing around the placket, and subtle wooden buttons.', '100% Handloom Cotton with Natural Dyes', 'Hand wash separately in cold water for first 2 washes.', 'Bagru Artisanal Cluster, Rajasthan', 19),
  ('vk-sale-3', 'Saffron Georgette Flared Peplum Kurti', 'Lightweight tiered peplum with zari thread highlights', 'kurtas', 'women', 'georgette', 'Poly Georgette', 'festive', 'Festive & Puja', 999, 1999, 4.7, 65, 'Flat ₹999', true, false, true, '[{"name":"Saffron Gold","hex":"#FFA500"},{"name":"Ruby Maroon","hex":"#800020"}]'::jsonb, '["XS","S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Effortlessly festive tiered peplum kurti in featherlight poly-georgette with santoon lining. Adorned with delicate sequin and zari piping across the yoke.', 'Faux Georgette with Butter Crepe Lining', 'Dry clean or gentle hand wash.', 'Surat Craft Mill, Gujarat', 15),
  ('vk-sale-4', 'Haldi Yellow Embroidered Straight Kurti', 'Festive cotton mulmul with silver gota thread borders', 'kurtas', 'women', 'cotton', 'Pure Combed Cotton', 'festive', 'Festive & Puja', 999, 2299, 4.8, 42, 'Flat ₹999', true, true, false, '[{"name":"Mustard Gold","hex":"#E5A93B"},{"name":"Fuchsia Pink","hex":"#E0115F"}]'::jsonb, '["XS","S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'A joyful haldi yellow straight kurti tailored from soft 60s cotton mulmul. Detailed with refined silver gota patti around the round neckline and sleeves.', '100% Fine Combed Cotton', 'Hand wash inside-out.', 'Jaipur, Rajasthan', 22),
  ('vk-set-1', 'Rani Pink Zardozi Kurta Set with Organza Dupatta', 'Heavy hand-embroidered kurta, silk pants & scalloped dupatta', 'ethnic-sets-dupatta', 'women', 'chanderi-silk', 'Chanderi Silk Blend', 'wedding', 'Wedding & Sangeet', 3499, 5999, 5, 92, 'Festive Hit', false, true, true, '[{"name":"Rani Fuchsia","hex":"#D90368"},{"name":"Golden Mustard","hex":"#E5A93B"},{"name":"Emerald Green","hex":"#006A4E"}]'::jsonb, '["XS","S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'The showstopper from the Happiness Beyond Special collection. Crafted in rich chanderi silk with intricate gota patti and zardozi needlework, accompanied by tailored cigarette pants and a diaphanous organza dupatta with cutwork borders.', 'Kurta: Chanderi Silk Blend; Pants: Modal Silk; Dupatta: Pure Organza', 'Dry clean only. Iron with protective cloth.', 'Lucknow Zardozi Atelier, Uttar Pradesh', 11),
  ('vk-set-2', 'Mustard Embroidered Anarkali Set with Silk Dupatta', 'Flared kalidar silhouette with gota borders and banarasi weave', 'ethnic-sets-dupatta', 'women', 'chanderi-silk', 'Chanderi Silk Blend', 'festive', 'Festive & Puja', 2999, 4999, 4.9, 76, 'Bestseller', false, false, true, '[{"name":"Mustard Ochre","hex":"#D49B28"},{"name":"Wine Berry","hex":"#58111A"},{"name":"Navy Blue","hex":"#1B2A4A"}]'::jsonb, '["S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Magnificent 24-kali flared Anarkali set featuring heavy zari thread work on the bodice. Paired with comfortable churidar leggings and an opulent Banarasi woven art-silk dupatta.', 'Silk Blend Kalidar with Cotton Lining & Art-Silk Dupatta', 'Dry clean recommended.', 'Varanasi Weaving Workshop', 8),
  ('vk-set-3', 'Pastel Sage Green Chanderi Suit Set', 'Minimalist thread embroidery with gold tissue dupatta', 'ethnic-sets-dupatta', 'women', 'chanderi-silk', 'Chanderi Handloom', 'daily', 'Daily & Office', 2499, 3999, 4.8, 43, 'New Season', false, true, false, '[{"name":"Sage Mint","hex":"#9CAF88"},{"name":"Powder Peach","hex":"#FFDAB9"},{"name":"Ice Blue","hex":"#AFEEEE"}]'::jsonb, '["XS","S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Understated luxury for day festivities. Made from airy chanderi with tone-on-tone resham embroidery, matched with straight ankle-length trousers and shimmering tissue dupatta.', 'Chanderi Cotton-Silk with Fine Mul Lining', 'Gentle hand wash cold or dry clean.', 'Chanderi Handloom Guild, Madhya Pradesh', 14),
  ('vk-set-4', 'Emerald Green Silk Anarkali Set with Banarasi Dupatta', 'Grand festive kalidar with regal brocade woven dupatta', 'ethnic-sets-dupatta', 'women', 'chanderi-silk', 'Chanderi Silk Blend', 'wedding', 'Wedding & Sangeet', 3799, 6499, 4.9, 51, 'Regal Edit', false, true, true, '[{"name":"Emerald Green","hex":"#006A4E"},{"name":"Wine Berry","hex":"#58111A"}]'::jsonb, '["S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Regal emerald green Anarkali ensemble radiating heritage splendor. Crafted with fine resham and sequin highlights on the bodice, accompanied by a rich Banarasi zari dupatta.', 'Art Silk Kalidar with Shantoon Lining & Banarasi Woven Dupatta', 'Dry clean only.', 'Varanasi Atelier', 9),
  ('vk-eth-1', 'Maroon Mirror-Work Kurta & Palazzo Set', 'Straight calf-length kurta with flared palazzo pants', 'ethnic-sets', 'women', 'cotton', 'Rayon Slub & Cotton', 'festive', 'Festive & Puja', 1899, 2999, 4.9, 57, 'Popular', false, false, true, '[{"name":"Deep Maroon","hex":"#63101E"},{"name":"Olive Green","hex":"#556B2F"}]'::jsonb, '["S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'A timeless duo featuring authentic mirror-work embellishments on the yoke and cuffs. Paired with extra-wide flowing cotton palazzos for effortless elegance all day.', '100% Rayon Slub with Cotton Facing', 'Gentle machine wash inside a laundry bag.', 'Kutch Craft Center, Gujarat', 20),
  ('vk-eth-2', 'Teal Blue Floral Printed Kurta with Afghani Salwar', 'Contemporary Afghani pleated cuff pant with tunic kurta', 'ethnic-sets', 'women', 'cotton', 'Pure Combed Cotton', 'daily', 'Daily & Office', 1699, 2799, 4.8, 39, 'Trending', false, true, false, '[{"name":"Peacock Teal","hex":"#005F73"},{"name":"Dusty Rose","hex":"#DCAE96"}]'::jsonb, '["XS","S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Modern fusion styling with comfort at heart. Features a short straight tunic paired with on-trend pleated Afghani salwar pants adorned with delicate lace accents at the cuffs.', 'Pure Cotton Mulmul (60x60)', 'Machine wash cold gentle cycle.', 'Sanganer Textile Studio, Jaipur', 18),
  ('vk-eth-3', 'Powder Blue Chikankari Kurta & Pant Set', 'Handcrafted Lucknowi shadow work with pearl accents', 'ethnic-sets', 'women', 'cotton', 'Handloom Mulmul', 'daily', 'Daily & Office', 1899, 2999, 4.9, 33, 'Artisanal', false, true, false, '[{"name":"Ice Blue","hex":"#AFEEEE"},{"name":"Sage Mint","hex":"#9CAF88"}]'::jsonb, '["S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Delicate Lucknow Chikankari embroidery needlework across pure mulmul cotton. Includes matching tapered ankle trousers with embroidered hems.', '100% Breathable Mulmul Cotton with Cotton Slip', 'Hand wash gentle.', 'Lucknow Artisans, UP', 16),
  ('vk-coord-1', 'Golden Amber Jacquard Peplum Co-Ord Set', 'Belted peplum top with tailored straight-fit cigarette trousers', 'co-ords', 'women', 'jacquard', 'Zari Jacquard', 'party', 'Evening Fusion', 2199, 3499, 5, 48, 'Runway', false, true, true, '[{"name":"Amber Gold","hex":"#E5A93B"},{"name":"Classic Noir","hex":"#111111"},{"name":"Emerald","hex":"#1C352D"}]'::jsonb, '["XS","S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'The pinnacle of modern Indian festive fusion. Tailored in structured zari jacquard with a fabric belt featuring metallic buckle, paired with sleek high-waisted cigarette pants.', 'Woven Zari Jacquard with Soft Viscose Lining', 'Dry clean only.', 'Bengaluru Design Studio', 12),
  ('vk-coord-2', 'Floral Satin Kaftan & Pant Co-Ord Set', 'Relaxed V-neck kaftan with drawstring waist & matching trousers', 'co-ords', 'women', 'modal-satin', 'Modal Satin', 'party', 'Evening Fusion', 1999, 2999, 4.8, 31, 'Resort Luxe', false, false, false, '[{"name":"Berry Plum","hex":"#4B0082"},{"name":"Turquoise Aqua","hex":"#00CED1"}]'::jsonb, '["S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Effortlessly glamorous silhouette tailored from buttery modal satin. Designed with batwing sleeves, custom metallic tassels at the waist, and straight ankle pants.', '100% Modal Satin (OEKO-TEX Standard)', 'Hand wash cold or gentle machine wash.', 'Mumbai Atelier', 16),
  ('vk-coord-3', 'Rani Pink Embroidered Crop Top & Flared Sharara Co-Ord', 'Mirror-accented sleeveless crop bustier with tiered sharara pants', 'co-ords', 'women', 'modal-satin', 'Modal Satin', 'wedding', 'Wedding & Sangeet', 2399, 3999, 4.9, 38, 'Festive Hit', false, true, true, '[{"name":"Rani Fuchsia","hex":"#D90368"},{"name":"Amber Gold","hex":"#E5A93B"}]'::jsonb, '["XS","S","M","L"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'A showstopping sangeet silhouette pairing a mirror-bordered fitted bustier crop top with voluminous tiered flare sharara bottoms.', 'Pure Modal Satin with Shantoon Lining', 'Dry clean only.', 'Delhi Studio', 10),
  ('vk-dress-1', 'Bandhani Print Flared Tiered Maxi Dress', 'Floor-length ethnic maxi dress with tassels and smocked back', 'dresses', 'women', 'cotton', 'Pure Combed Cotton', 'festive', 'Festive & Puja', 1799, 2899, 4.9, 52, 'Festive Hit', false, true, true, '[{"name":"Rani Pink & Gold","hex":"#D90368"},{"name":"Haldi Yellow","hex":"#E5A93B"},{"name":"Forest Green","hex":"#1C352D"}]'::jsonb, '["XS","S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'Swirl through celebrations with this 3-tier festive maxi dress. Embellished with mirror-work lace along the V-neckline, smocked elasticated back for a bespoke fit, and vibrant Bandhani motifs.', 'Pure Cotton Cambric with Soft Cotton Voile Lining', 'Gentle machine wash cold.', 'Ahmedabad Craft Guild', 20),
  ('vk-dress-2', 'Embroidered Georgette Anarkali Gown', 'Full-length partywear gown with sequin zari yoke', 'dresses', 'women', 'georgette', 'Poly Georgette', 'wedding', 'Wedding & Sangeet', 2799, 4499, 4.9, 68, 'Wedding Edit', false, false, true, '[{"name":"Wine Red","hex":"#722F37"},{"name":"Midnight Navy","hex":"#1B2A4A"}]'::jsonb, '["S","M","L","XL","XXL"]'::jsonb, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'An evening masterpiece boasting over 5 meters of flare. Delicately stitched micro-sequins sparkle across the yoke, completed with a flared hemline and sweetheart neckline.', 'Heavy Poly-Georgette with Shantoon Lining', 'Dry clean only.', 'Delhi Couture Atelier', 9),
  ('vk-dress-3', 'Teal Blue Floral Print Tiered Festive Gown', 'Floor-skimming flared gown with gold piping and potli button front', 'dresses', 'women', 'georgette', 'Poly Georgette', 'party', 'Evening Fusion', 2199, 3699, 4.8, 29, 'Party Luxe', false, true, false, '[{"name":"Peacock Teal","hex":"#005F73"},{"name":"Ruby Maroon","hex":"#800020"}]'::jsonb, '["S","M","L","XL"]'::jsonb, '["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"]'::jsonb, 'An opulent teal blue tiered gown with graceful flare and subtle metallic accents. Perfect for cocktail evenings and reception parties.', 'Poly Georgette with Butter Crepe Lining', 'Dry clean only.', 'Surat, Gujarat', 14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images;

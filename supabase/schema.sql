-- ============================================================
-- Heritage Leather Goods — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name      TEXT NOT NULL DEFAULT '',
  phone     TEXT,
  role      TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── HELPER: IS ADMIN ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('wallets','bags','belts','accessories')),
  images        JSONB NOT NULL DEFAULT '[]',
  in_stock      BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count   INTEGER NOT NULL DEFAULT 100,
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  bestseller    BOOLEAN NOT NULL DEFAULT FALSE,
  personalizable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id               BIGSERIAL PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email      TEXT,
  guest_name       TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping         DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax              DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method   TEXT DEFAULT 'card',
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','paid','failed','refunded')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id   BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  price        DECIMAL(10,2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  engraving    TEXT
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      TEXT,
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- ─── CONTACT MESSAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'unread'
             CHECK (status IN ('unread','read','replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WISHLIST ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist         ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Trigger can insert profile"   ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Products (public read, admin write)
CREATE POLICY "Products are public"         ON products FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage products"      ON products FOR ALL    USING (is_admin());

-- Orders
CREATE POLICY "Users see own orders"        ON orders FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Anyone can create an order"  ON orders FOR INSERT   WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Admins update orders"        ON orders FOR UPDATE   USING (is_admin());

-- Order items
CREATE POLICY "Order items follow order"    ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Insert order items"          ON order_items FOR INSERT WITH CHECK (TRUE);

-- Reviews
CREATE POLICY "Reviews are public"          ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can write reviews"     ON reviews FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- Contact messages
CREATE POLICY "Anyone can send messages"    ON contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins read messages"        ON contact_messages FOR SELECT USING (is_admin());
CREATE POLICY "Admins update messages"      ON contact_messages FOR UPDATE USING (is_admin());

-- Wishlist
CREATE POLICY "Users manage own wishlist"   ON wishlist FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- RPC: CREATE ORDER (atomic — handles stock + items in one tx)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id        UUID,
  p_guest_email    TEXT,
  p_guest_name     TEXT,
  p_items          JSONB,
  p_shipping_addr  JSONB,
  p_payment_method TEXT DEFAULT 'card',
  p_notes          TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_subtotal   DECIMAL(10,2) := 0;
  v_shipping   DECIMAL(10,2) := 0;
  v_tax        DECIMAL(10,2) := 0;
  v_total      DECIMAL(10,2) := 0;
  v_order_id   BIGINT;
  v_order_num  TEXT;
  v_item       JSONB;
  v_product    public.products%ROWTYPE;
  v_qty        INTEGER;
BEGIN
  -- Validate all items & compute subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    SELECT * INTO v_product
      FROM public.products
     WHERE slug = (v_item->>'slug') OR id = (v_item->>'id')::BIGINT;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'name';
    END IF;
    IF NOT v_product.in_stock OR v_product.stock_count < v_qty THEN
      RAISE EXCEPTION 'Product "%" is out of stock', v_product.name;
    END IF;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_shipping := CASE WHEN v_subtotal >= 250 THEN 0 ELSE 15 END;
  v_tax      := ROUND(v_subtotal * 0.08, 2);
  v_total    := v_subtotal + v_shipping + v_tax;

  -- Generate order number
  v_order_num := 'HLG-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad((random()*9999)::INTEGER::TEXT, 4, '0');

  -- Create the order
  INSERT INTO public.orders (
    order_number, user_id, guest_email, guest_name,
    subtotal, shipping, tax, total,
    shipping_address, payment_method, notes
  ) VALUES (
    v_order_num, p_user_id, p_guest_email, p_guest_name,
    v_subtotal, v_shipping, v_tax, v_total,
    p_shipping_addr, p_payment_method, p_notes
  ) RETURNING id INTO v_order_id;

  -- Insert line items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    SELECT * INTO v_product
      FROM public.products
     WHERE slug = (v_item->>'slug') OR id = (v_item->>'id')::BIGINT;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity, engraving)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.slug, v_product.price, v_qty,
            NULLIF(v_item->>'engraving', ''));

    UPDATE public.products
       SET stock_count = stock_count - v_qty,
           in_stock    = (stock_count - v_qty) > 0
     WHERE id = v_product.id;
  END LOOP;

  RETURN jsonb_build_object(
    'id',           v_order_id,
    'order_number', v_order_num,
    'total',        v_total,
    'subtotal',     v_subtotal,
    'shipping',     v_shipping,
    'tax',          v_tax
  );
END;
$$;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.products (slug, name, description, price, category, images, featured, bestseller, personalizable, stock_count)
VALUES
  ('classic-bifold-wallet', 'Classic Bifold Wallet',
   'Crafted from full-grain vegetable-tanned leather, this timeless bifold wallet develops a rich patina over years of use. Features 6 card slots, 2 bill compartments, and an ID window. Hand-stitched with waxed thread for exceptional durability.',
   120, 'wallets',
   '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
   TRUE, TRUE, TRUE, 50),

  ('heritage-messenger-bag', 'Heritage Messenger Bag',
   'A modern classic built for the everyday carry of the discerning professional. Full-grain leather with brass hardware, padded 15" laptop sleeve, multiple interior pockets, and an adjustable shoulder strap.',
   395, 'bags',
   '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
   TRUE, TRUE, TRUE, 25),

  ('artisan-dress-belt', 'Artisan Dress Belt',
   'Cut from a single piece of full-grain leather, finished with a solid brass buckle. The natural vegetable tanning process ensures the belt will last for decades with proper care.',
   85, 'belts',
   '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
   TRUE, FALSE, TRUE, 75),

  ('leather-key-organizer', 'Leather Key Organizer',
   'End the jangling and bulge in your pocket. Holds 2-7 keys in a compact, organized stack. Made from thick vegetable-tanned leather with stainless steel hardware.',
   45, 'accessories',
   '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
   FALSE, TRUE, TRUE, 100),

  ('slim-card-holder', 'Slim Card Holder',
   'For those who prefer minimalist carry. Holds 4-8 cards and a few bills in an ultra-thin profile. Made from the finest full-grain leather available.',
   65, 'wallets',
   '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800"]',
   FALSE, FALSE, TRUE, 80),

  ('weekender-duffle', 'Weekender Duffle',
   'The perfect companion for weekend getaways. Spacious main compartment, separate shoe compartment, multiple pockets, and a trolley sleeve.',
   550, 'bags',
   '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
   TRUE, FALSE, FALSE, 15)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- HOW TO CREATE THE ADMIN USER
-- ============================================================
-- 1. Sign up normally via the app with your email
-- 2. Then run this in the SQL Editor (replace with your email):
--    UPDATE public.profiles SET role = 'admin'
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'halimsimo0987@gmail.com');

-- ============================================================
-- MIGRATION: Add 'confirmed' order status (run on existing DBs)
-- ============================================================
-- If the orders table was already created without 'confirmed',
-- run the following to update the constraint:
--
-- ALTER TABLE public.orders
--   DROP CONSTRAINT IF EXISTS orders_status_check;
--
-- ALTER TABLE public.orders
--   ADD CONSTRAINT orders_status_check
--   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled'));
-- ============================================================

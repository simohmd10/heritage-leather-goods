-- ============================================================
-- PART 2/4 — Row Level Security Policies
-- Run this second in Supabase SQL Editor
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

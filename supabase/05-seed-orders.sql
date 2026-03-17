-- ============================================================
-- PART 5/5 — Seed: Test Orders, Order Items & Contact Messages
-- Run this last in Supabase SQL Editor
-- ============================================================

INSERT INTO public.orders (order_number, guest_name, guest_email, status, subtotal, shipping, tax, total, shipping_address, payment_method, payment_status, created_at) VALUES
('HLG-20260301-1001', 'Mohammed Al-Rashid', 'mohammed@example.com', 'delivered', 215.00, 0, 17.20, 232.20,
 '{"firstName":"Mohammed","lastName":"Al-Rashid","address":"123 King Fahd Road","city":"Riyadh","state":"Riyadh","zip":"11564","country":"Saudi Arabia"}',
 'card', 'paid', NOW() - INTERVAL '45 days'),
('HLG-20260305-1002', 'Sara Johnson', 'sara.j@example.com', 'delivered', 395.00, 0, 31.60, 426.60,
 '{"firstName":"Sara","lastName":"Johnson","address":"456 Oak Street","city":"New York","state":"NY","zip":"10001","country":"United States"}',
 'card', 'paid', NOW() - INTERVAL '40 days'),
('HLG-20260308-1003', 'Ahmed Hassan', 'ahmed.h@example.com', 'shipped', 550.00, 0, 44.00, 594.00,
 '{"firstName":"Ahmed","lastName":"Hassan","address":"789 Corniche","city":"Dubai","state":"Dubai","zip":"00000","country":"UAE"}',
 'card', 'paid', NOW() - INTERVAL '30 days'),
('HLG-20260312-1004', 'Emily Chen', 'emily.chen@example.com', 'processing', 445.00, 0, 35.60, 480.60,
 '{"firstName":"Emily","lastName":"Chen","address":"101 Maple Ave","city":"Los Angeles","state":"CA","zip":"90001","country":"United States"}',
 'card', 'paid', NOW() - INTERVAL '20 days'),
('HLG-20260314-1005', 'Omar Abdullah', 'omar.a@example.com', 'confirmed', 175.00, 15.00, 14.00, 204.00,
 '{"firstName":"Omar","lastName":"Abdullah","address":"22 Sheikh Zayed Rd","city":"Abu Dhabi","state":"Abu Dhabi","zip":"00000","country":"UAE"}',
 'card', 'paid', NOW() - INTERVAL '15 days'),
('HLG-20260315-1006', 'Layla Nasser', 'layla.n@example.com', 'pending', 285.00, 0, 22.80, 307.80,
 '{"firstName":"Layla","lastName":"Nasser","address":"10 Hamdan Street","city":"Doha","state":"Doha","zip":"00000","country":"Qatar"}',
 'card', 'paid', NOW() - INTERVAL '10 days'),
('HLG-20260316-1007', 'James Wilson', 'j.wilson@example.com', 'pending', 130.00, 15.00, 10.40, 155.40,
 '{"firstName":"James","lastName":"Wilson","address":"77 Baker Street","city":"London","state":"England","zip":"W1U 6RN","country":"United Kingdom"}',
 'card', 'paid', NOW() - INTERVAL '7 days'),
('HLG-20260317-1008', 'Aisha Khalid', 'aisha.k@example.com', 'pending', 495.00, 0, 39.60, 534.60,
 '{"firstName":"Aisha","lastName":"Khalid","address":"1 Pearl Boulevard","city":"Manama","state":"Manama","zip":"10001","country":"Bahrain"}',
 'card', 'paid', NOW() - INTERVAL '2 days')
ON CONFLICT (order_number) DO NOTHING;

-- Order Items
INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260301-1001' AND p.slug IN ('classic-bifold-wallet','leather-key-organizer');

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260305-1002' AND p.slug = 'heritage-messenger-bag';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260308-1003' AND p.slug = 'weekender-duffle';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260312-1004' AND p.slug = 'slim-briefcase';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260314-1005' AND p.slug = 'crossbody-bag';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260315-1006' AND p.slug = 'leather-tote-bag';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260316-1007' AND p.slug = 'rfid-blocking-wallet';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260317-1008' AND p.slug = 'backpack-leather';

-- Contact Messages
INSERT INTO public.contact_messages (name, email, subject, message, status, created_at) VALUES
('Mohammed Al-Rashid', 'mohammed@example.com', 'Question about engraving', 'Can you engrave Arabic text on the wallet?', 'read', NOW() - INTERVAL '30 days'),
('Sara Johnson', 'sara.j@example.com', 'Order inquiry', 'I placed an order last week but haven''t received a shipping confirmation.', 'replied', NOW() - INTERVAL '25 days'),
('Ahmed Hassan', 'ahmed.h@example.com', 'Bulk order', 'I''m interested in ordering 20 wallets as corporate gifts. Do you offer bulk discounts?', 'unread', NOW() - INTERVAL '10 days'),
('James Wilson', 'j.wilson@example.com', 'Return request', 'The wrong size belt was sent. How do I arrange an exchange?', 'unread', NOW() - INTERVAL '3 days');

-- ============================================================
-- ADMIN USER SETUP
-- ============================================================
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Email: admin@artisanleather.com  |  Password: Admin@123456
-- 3. Then run this:
--
-- UPDATE public.profiles SET role = 'admin', name = 'Admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@artisanleather.com');
-- ============================================================

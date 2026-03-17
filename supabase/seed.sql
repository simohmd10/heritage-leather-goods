-- ============================================================
-- Heritage Leather Goods — Full Seed Data
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- ─── CLEAR EXISTING DATA (optional) ──────────────────────────
-- TRUNCATE public.order_items, public.orders, public.products RESTART IDENTITY CASCADE;

-- ============================================================
-- 50+ PRODUCTS
-- ============================================================

INSERT INTO public.products (slug, name, description, price, category, images, featured, bestseller, personalizable, stock_count) VALUES

-- ── WALLETS (15 products) ─────────────────────────────────────
('classic-bifold-wallet', 'Classic Bifold Wallet',
 'Crafted from full-grain vegetable-tanned leather, this timeless bifold develops a rich patina over years of use. Features 6 card slots, 2 bill compartments, and an ID window. Hand-stitched with waxed thread.',
 120, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"]',
 TRUE, TRUE, TRUE, 50),

('slim-card-holder', 'Slim Card Holder',
 'For those who prefer minimalist carry. Holds 4-8 cards and a few bills in an ultra-thin profile. Made from the finest full-grain leather, it develops character with every use.',
 65, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, FALSE, TRUE, 80),

('trifold-wallet', 'Trifold Wallet',
 'Classic trifold design with 9 card slots, 3 bill compartments, and a transparent ID window. Full-grain leather construction ensures this wallet lasts for decades.',
 135, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, TRUE, TRUE, 45),

('money-clip-wallet', 'Money Clip Wallet',
 'A sophisticated combination of a money clip and a card wallet. Holds up to 6 cards on one side and features a sturdy stainless steel money clip on the other.',
 95, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, FALSE, FALSE, 60),

('zip-around-wallet', 'Zip Around Wallet',
 'Full zip closure for maximum security. Fits cards, cash, coins, and even a phone. Premium leather with polished brass zipper.',
 155, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800"]',
 TRUE, FALSE, TRUE, 35),

('breast-pocket-wallet', 'Breast Pocket Wallet',
 'Slim enough for a jacket breast pocket. Holds 6 cards and folded bills without any bulk. The perfect wallet for formal occasions.',
 85, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, FALSE, TRUE, 70),

('passport-wallet', 'Passport Wallet',
 'Protect your passport in style. Fits a passport, multiple cards, boarding passes, and a pen. Perfect for frequent travelers.',
 110, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, TRUE, TRUE, 40),

('long-wallet', 'Long Wallet',
 'Classic long-format wallet with a full-length bill compartment, 12 card slots, and interior pockets. Ideal for those who prefer a traditional wallet.',
 145, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, FALSE, TRUE, 30),

('coin-pouch-wallet', 'Coin Pouch Wallet',
 'Bifold wallet with an integrated coin pouch. 6 card slots, 2 bill compartments, and a zipped coin pocket — all in one compact package.',
 105, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800"]',
 FALSE, FALSE, FALSE, 55),

('front-pocket-wallet', 'Front Pocket Wallet',
 'Designed specifically for front pocket carry. Slim profile with a thumb slot for easy card access and a bill fold. RFID protection included.',
 75, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 TRUE, TRUE, FALSE, 90),

('womens-bifold-wallet', 'Women''s Bifold Wallet',
 'Elegant bifold wallet for women. Features 8 card slots, a zippered coin pocket, and full-length bill compartment. Available in cognac and black.',
 115, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, TRUE, TRUE, 45),

('checkbook-wallet', 'Checkbook Wallet',
 'Traditional checkbook cover in premium leather. Holds your checkbook, register, cards, and cash — perfectly organized.',
 90, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800"]',
 FALSE, FALSE, FALSE, 25),

('rfid-blocking-wallet', 'RFID Blocking Wallet',
 'Full-grain leather bifold with built-in RFID blocking technology. Protects your cards from electronic pickpocketing while maintaining a classic look.',
 130, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, TRUE, FALSE, 65),

('minimalist-wallet', 'Minimalist Wallet',
 'The ultimate slim wallet. Holds 3-5 cards and folded bills. Made from a single piece of leather folded once — nothing unnecessary.',
 55, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, FALSE, TRUE, 100),

('executive-wallet', 'Executive Wallet',
 'The pinnacle of wallet craftsmanship. French-stitched edges, custom-tanned full-grain leather, and a hand-burnished finish. A lifetime investment.',
 195, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 TRUE, FALSE, TRUE, 20),

-- ── BAGS (15 products) ────────────────────────────────────────
('heritage-messenger-bag', 'Heritage Messenger Bag',
 'A modern classic built for everyday carry. Full-grain leather with brass hardware, padded 15" laptop sleeve, multiple interior pockets, and adjustable shoulder strap.',
 395, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"]',
 TRUE, TRUE, TRUE, 25),

('weekender-duffle', 'Weekender Duffle',
 'The perfect companion for weekend getaways. Spacious main compartment, separate shoe pocket, multiple interior pockets, and trolley sleeve.',
 550, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, FALSE, FALSE, 15),

('leather-tote-bag', 'Leather Tote Bag',
 'Generous open-top tote in vegetable-tanned leather. Interior zip pocket and two slip pockets. Sturdy handles with comfortable grip. Ideal for work or shopping.',
 285, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 TRUE, TRUE, FALSE, 30),

('slim-briefcase', 'Slim Briefcase',
 'Sleek one-gusset briefcase for the modern professional. Fits a 15" laptop, has a front organizer panel, and includes a removable shoulder strap.',
 445, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, FALSE, TRUE, 18),

('crossbody-bag', 'Crossbody Bag',
 'Compact crossbody for hands-free carry. Fits a phone, wallet, keys, and essentials. Adjustable strap, magnetic closure, and interior card slots.',
 175, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, TRUE, FALSE, 40),

('backpack-leather', 'Heritage Leather Backpack',
 'Handcrafted full-grain leather backpack. Fits a 15" laptop, has multiple compartments, and a padded back panel. Built for the long haul.',
 495, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, TRUE, FALSE, 20),

('laptop-bag', 'Leather Laptop Bag',
 'Dedicated laptop bag for the professional. Padded sleeve for 13-16" laptops, external quick-access pocket, and premium leather construction.',
 365, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, FALSE, 22),

('clutch-bag', 'Leather Clutch Bag',
 'Elegant evening clutch in smooth full-grain leather. Wristlet strap, zip closure, card slots, and a mirror pocket. Effortlessly sophisticated.',
 145, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, TRUE, FALSE, 35),

('satchel-bag', 'Classic Satchel',
 'Traditional structured satchel with top handle and crossbody strap. Front pocket, interior compartments, and polished brass hardware.',
 325, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, TRUE, 16),

('toiletry-bag', 'Leather Toiletry Bag',
 'Keep your grooming essentials organized in this roomy dopp kit. Waterproof lining, multiple interior pockets, and sturdy top handle.',
 125, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, TRUE, TRUE, 50),

('camera-bag', 'Leather Camera Bag',
 'Protect your camera gear in style. Padded interior dividers, quick-access side pocket, and top handle with shoulder strap.',
 385, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, FALSE, 12),

('bucket-bag', 'Leather Bucket Bag',
 'Trendy bucket bag with drawstring closure and magnetic snap. Adjustable crossbody strap and interior zip pocket.',
 215, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, FALSE, FALSE, 28),

('gym-bag', 'Leather Gym Bag',
 'Durable gym bag that gets better with age. Large main compartment, shoe pocket, water bottle holder, and padded shoulder strap.',
 295, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, FALSE, 20),

('portfolio-case', 'Leather Portfolio Case',
 'Professional portfolio for documents, iPad, and notebook. Zippered closure, pen loop, and business card holder.',
 195, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, TRUE, TRUE, 30),

('mini-bag', 'Mini Leather Bag',
 'Compact and chic mini bag for essentials only. Crossbody or hand-carry, with a zip top and interior slip pocket.',
 135, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, FALSE, 45),

-- ── BELTS (10 products) ───────────────────────────────────────
('artisan-dress-belt', 'Artisan Dress Belt',
 'Cut from a single piece of full-grain leather, finished with a solid brass buckle. The natural vegetable tanning process ensures the belt will last for decades with proper care.',
 85, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 TRUE, FALSE, TRUE, 75),

('casual-leather-belt', 'Casual Leather Belt',
 'Everyday casual belt in full-grain leather with a matte silver buckle. Versatile enough for jeans, chinos, or shorts.',
 70, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 FALSE, TRUE, FALSE, 100),

('braided-belt', 'Braided Leather Belt',
 'Handwoven braided belt in supple leather. The stretch weave provides a comfortable custom fit and pairs beautifully with summer outfits.',
 80, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 60),

('western-belt', 'Western Tooled Belt',
 'Hand-tooled western-style belt with intricate floral pattern. Sterling silver buckle. A statement piece for those who appreciate traditional craftsmanship.',
 125, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 TRUE, FALSE, TRUE, 30),

('wide-leather-belt', 'Wide Leather Belt',
 '4cm wide statement belt in thick vegetable-tanned leather with a double-prong buckle. Perfect for dresses and high-waisted pants.',
 90, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 50),

('reversible-belt', 'Reversible Belt',
 'Two belts in one — black on one side, tan on the other. Simply remove the buckle to reverse. Practical and economical.',
 95, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 FALSE, TRUE, FALSE, 80),

('officer-belt', 'Officer Dress Belt',
 'Formal 3cm belt with a polished gold-tone buckle. Ideal for military, uniform, or formal events. Extra durable stitching throughout.',
 100, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, TRUE, 40),

('garrison-belt', 'Garrison Duty Belt',
 'Heavy-duty leather belt 4.5cm wide for outdoor and work use. Double tongue buckle with keeper loops. Virtually indestructible.',
 110, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 FALSE, FALSE, FALSE, 35),

('skinny-belt', 'Skinny Leather Belt',
 'Delicate 2cm belt perfect for women''s fashion. Available with a petite gold pin buckle. Pairs beautifully with dresses and blazers.',
 60, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, TRUE, FALSE, 65),

('ratchet-belt', 'Ratchet Click Belt',
 'Micro-adjustable ratchet belt with no holes. Click mechanism allows precise fit in 1cm increments. Solid brass hardware.',
 115, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 FALSE, FALSE, FALSE, 45),

-- ── ACCESSORIES (12 products) ─────────────────────────────────
('leather-key-organizer', 'Leather Key Organizer',
 'End the jangling and bulge in your pocket. Holds 2-7 keys in a compact, organized stack. Made from thick vegetable-tanned leather with stainless steel hardware.',
 45, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 100),

('leather-watch-roll', 'Leather Watch Roll',
 'Travel in style with your watch collection. Holds 3 watches securely in individual padded pockets. Rolls up for easy packing.',
 135, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, FALSE, FALSE, 30),

('leather-notebook-cover', 'Leather Notebook Cover',
 'Refillable leather cover for A5 notebooks. Card slots, pen loop, and bookmark. Fits standard A5 notebooks. Gets better with age.',
 75, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 60),

('leather-coasters', 'Leather Coaster Set',
 'Set of 4 handmade leather coasters with brass rivets. Protect your furniture with elegance. Makes an excellent housewarming gift.',
 55, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, FALSE, 80),

('phone-case-leather', 'Leather Phone Case',
 'Genuine leather phone case with card pocket. Available for iPhone and Samsung models. Magnetic closure and precise cutouts.',
 65, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, FALSE, 70),

('cable-organizer', 'Leather Cable Organizer',
 'Keep your cables tangle-free. Set of 6 leather cable ties with snap closure. Suitable for all cable types.',
 35, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, FALSE, 150),

('luggage-tag', 'Leather Luggage Tag',
 'Never lose your bag again. Personalized leather luggage tag with buckle strap and privacy address card. Bold and durable.',
 40, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 120),

('leather-bracelet', 'Leather Wrap Bracelet',
 'Handcrafted leather wrap bracelet with sterling silver clasp. Wraps twice around the wrist for a layered look. Unisex design.',
 50, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, FALSE, TRUE, 90),

('desk-pad', 'Leather Desk Pad',
 'Large leather desk mat to protect your workspace. 60×30cm, with non-slip backing. Ages beautifully and adds a professional touch.',
 120, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 TRUE, FALSE, FALSE, 25),

('pen-case', 'Leather Pen Case',
 'Roll-up pen case for 6 pens or pencils. Soft interior lining, tie closure. Ideal for artists, writers, and executives.',
 60, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, TRUE, 55),

('card-case', 'Business Card Case',
 'Slim leather case for business cards. Holds 15-20 cards. Presented with a cotton pouch — ideal as a corporate gift.',
 45, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 100),

('glasses-case', 'Leather Glasses Case',
 'Hardshell leather case with soft suede lining. Protects your glasses from scratches and impacts. Magnetic closure.',
 55, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, FALSE, FALSE, 45)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  bestseller = EXCLUDED.bestseller,
  personalizable = EXCLUDED.personalizable,
  stock_count = EXCLUDED.stock_count;

-- ============================================================
-- TEST ORDERS (guest orders — no user_id required)
-- ============================================================

INSERT INTO public.orders (order_number, guest_name, guest_email, status, subtotal, shipping, tax, total, shipping_address, payment_method, payment_status, created_at) VALUES

('HLG-20260301-1001', 'Mohammed Al-Rashid', 'mohammed@example.com', 'delivered', 215.00, 0, 17.20, 232.20,
 '{"firstName":"Mohammed","lastName":"Al-Rashid","address":"123 King Fahd Road","city":"Riyadh","state":"Riyadh","zip":"11564","country":"Saudi Arabia","phone":"+966501234567"}',
 'card', 'paid', NOW() - INTERVAL '45 days'),

('HLG-20260305-1002', 'Sara Johnson', 'sara.j@example.com', 'delivered', 395.00, 0, 31.60, 426.60,
 '{"firstName":"Sara","lastName":"Johnson","address":"456 Oak Street","city":"New York","state":"NY","zip":"10001","country":"United States","phone":"+12125551234"}',
 'card', 'paid', NOW() - INTERVAL '40 days'),

('HLG-20260308-1003', 'Ahmed Hassan', 'ahmed.h@example.com', 'shipped', 550.00, 0, 44.00, 594.00,
 '{"firstName":"Ahmed","lastName":"Hassan","address":"789 Corniche","city":"Dubai","state":"Dubai","zip":"00000","country":"UAE","phone":"+971501234567"}',
 'card', 'paid', NOW() - INTERVAL '35 days'),

('HLG-20260310-1004', 'Emily Chen', 'emily.chen@example.com', 'processing', 320.00, 0, 25.60, 345.60,
 '{"firstName":"Emily","lastName":"Chen","address":"101 Maple Ave","city":"Los Angeles","state":"CA","zip":"90001","country":"United States","phone":"+13105551234"}',
 'card', 'paid', NOW() - INTERVAL '30 days'),

('HLG-20260312-1005', 'Omar Abdullah', 'omar.a@example.com', 'confirmed', 185.00, 15.00, 14.80, 214.80,
 '{"firstName":"Omar","lastName":"Abdullah","address":"22 Sheikh Zayed Rd","city":"Abu Dhabi","state":"Abu Dhabi","zip":"00000","country":"UAE","phone":"+971521234567"}',
 'card', 'paid', NOW() - INTERVAL '25 days'),

('HLG-20260314-1006', 'Fatima Al-Zahra', 'fatima.z@example.com', 'pending', 445.00, 0, 35.60, 480.60,
 '{"firstName":"Fatima","lastName":"Al-Zahra","address":"55 Olaya Street","city":"Riyadh","state":"Riyadh","zip":"12244","country":"Saudi Arabia","phone":"+966509876543"}',
 'card', 'paid', NOW() - INTERVAL '20 days'),

('HLG-20260315-1007', 'James Wilson', 'j.wilson@example.com', 'pending', 130.00, 15.00, 10.40, 155.40,
 '{"firstName":"James","lastName":"Wilson","address":"77 Baker Street","city":"London","state":"England","zip":"W1U 6RN","country":"United Kingdom","phone":"+441234567890"}',
 'card', 'paid', NOW() - INTERVAL '15 days'),

('HLG-20260316-1008', 'Layla Nasser', 'layla.n@example.com', 'pending', 260.00, 0, 20.80, 280.80,
 '{"firstName":"Layla","lastName":"Nasser","address":"10 Hamdan Street","city":"Doha","state":"Doha","zip":"00000","country":"Qatar","phone":"+97412345678"}',
 'card', 'paid', NOW() - INTERVAL '10 days'),

('HLG-20260317-1009', 'Michael Torres', 'mike.t@example.com', 'pending', 175.00, 15.00, 14.00, 204.00,
 '{"firstName":"Michael","lastName":"Torres","address":"333 Mission St","city":"San Francisco","state":"CA","zip":"94105","country":"United States","phone":"+14155551234"}',
 'card', 'paid', NOW() - INTERVAL '5 days'),

('HLG-20260317-1010', 'Aisha Khalid', 'aisha.k@example.com', 'pending', 495.00, 0, 39.60, 534.60,
 '{"firstName":"Aisha","lastName":"Khalid","address":"1 Pearl Boulevard","city":"Manama","state":"Manama","zip":"10001","country":"Bahrain","phone":"+97312345678"}',
 'card', 'paid', NOW() - INTERVAL '2 days');

-- ============================================================
-- ORDER ITEMS (linking orders to products)
-- ============================================================

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260301-1001' AND p.slug IN ('classic-bifold-wallet', 'leather-key-organizer');

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
WHERE o.order_number = 'HLG-20260310-1004' AND p.slug IN ('leather-tote-bag', 'artisan-dress-belt');

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260312-1005' AND p.slug IN ('trifold-wallet', 'leather-key-organizer');

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260314-1006' AND p.slug = 'slim-briefcase';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260315-1007' AND p.slug = 'rfid-blocking-wallet';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260316-1008' AND p.slug IN ('crossbody-bag', 'leather-notebook-cover');

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260317-1009' AND p.slug = 'crossbody-bag';

INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity)
SELECT o.id, p.id, p.name, p.slug, p.price, 1
FROM public.orders o, public.products p
WHERE o.order_number = 'HLG-20260317-1010' AND p.slug = 'backpack-leather';

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================

INSERT INTO public.contact_messages (name, email, subject, message, status, created_at) VALUES
('Mohammed Al-Rashid', 'mohammed@example.com', 'Question about engraving', 'Hello, I wanted to ask about the engraving service. Can you engrave Arabic text on the wallet?', 'read', NOW() - INTERVAL '30 days'),
('Sara Johnson', 'sara.j@example.com', 'Order inquiry', 'Hi, I placed an order last week but haven''t received a shipping confirmation. Could you check order HLG-20260305-1002?', 'replied', NOW() - INTERVAL '25 days'),
('Ahmed Hassan', 'ahmed.h@example.com', 'Custom order', 'I''m interested in ordering 20 wallets as corporate gifts. Do you offer bulk discounts?', 'unread', NOW() - INTERVAL '10 days'),
('Layla Nasser', 'layla.n@example.com', 'Product care', 'What leather conditioner do you recommend for the messenger bag?', 'unread', NOW() - INTERVAL '5 days'),
('James Wilson', 'j.wilson@example.com', 'Return request', 'I received my order but the wrong size belt was sent. How do I arrange an exchange?', 'unread', NOW() - INTERVAL '2 days');

-- ============================================================
-- ADMIN SETUP INSTRUCTIONS
-- ============================================================
-- To create your admin account:
-- 1. Go to your Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Enter:
--    Email:    admin@artisanleather.com
--    Password: Admin@123456
-- 4. After creating, run this SQL (replace email if different):
--
-- UPDATE public.profiles
-- SET role = 'admin', name = 'Admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@artisanleather.com');
--
-- ============================================================

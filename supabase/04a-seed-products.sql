-- ============================================================
-- PART 4a/5 — Seed: Products (Wallets & Bags)
-- Run this fourth in Supabase SQL Editor
-- ============================================================

INSERT INTO public.products (slug, name, description, price, category, images, featured, bestseller, personalizable, stock_count) VALUES

('classic-bifold-wallet', 'Classic Bifold Wallet',
 'Crafted from full-grain vegetable-tanned leather. Features 6 card slots, 2 bill compartments, and an ID window. Hand-stitched with waxed thread for exceptional durability.',
 120, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 TRUE, TRUE, TRUE, 50),

('slim-card-holder', 'Slim Card Holder',
 'For those who prefer minimalist carry. Holds 4-8 cards and a few bills in an ultra-thin profile.',
 65, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, FALSE, TRUE, 80),

('trifold-wallet', 'Trifold Wallet',
 'Classic trifold design with 9 card slots, 3 bill compartments, and a transparent ID window.',
 135, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, TRUE, TRUE, 45),

('zip-around-wallet', 'Zip Around Wallet',
 'Full zip closure for maximum security. Fits cards, cash, coins, and phone. Premium leather with brass zipper.',
 155, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800"]',
 TRUE, FALSE, TRUE, 35),

('passport-wallet', 'Passport Wallet',
 'Fits a passport, multiple cards, boarding passes, and a pen. Perfect for frequent travelers.',
 110, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, TRUE, TRUE, 40),

('front-pocket-wallet', 'Front Pocket Wallet',
 'Designed for front pocket carry. Slim profile with thumb slot for easy card access. RFID protection.',
 75, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 TRUE, TRUE, FALSE, 90),

('rfid-blocking-wallet', 'RFID Blocking Wallet',
 'Full-grain leather bifold with built-in RFID blocking. Protects your cards from electronic pickpocketing.',
 130, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, TRUE, FALSE, 65),

('minimalist-wallet', 'Minimalist Wallet',
 'The ultimate slim wallet. Holds 3-5 cards and folded bills. Made from a single piece of leather.',
 55, 'wallets',
 '["https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 FALSE, FALSE, TRUE, 100),

('executive-wallet', 'Executive Wallet',
 'The pinnacle of wallet craftsmanship. French-stitched edges, custom-tanned leather, hand-burnished finish.',
 195, 'wallets',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
 TRUE, FALSE, TRUE, 20),

('money-clip-wallet', 'Money Clip Wallet',
 'Holds up to 6 cards on one side with a sturdy stainless steel money clip on the other.',
 95, 'wallets',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
 FALSE, FALSE, FALSE, 60),

-- BAGS
('heritage-messenger-bag', 'Heritage Messenger Bag',
 'Full-grain leather with brass hardware, padded 15" laptop sleeve, multiple interior pockets, adjustable shoulder strap.',
 395, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 TRUE, TRUE, TRUE, 25),

('weekender-duffle', 'Weekender Duffle',
 'Spacious main compartment, separate shoe pocket, multiple interior pockets, and trolley sleeve.',
 550, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, FALSE, FALSE, 15),

('leather-tote-bag', 'Leather Tote Bag',
 'Generous open-top tote in vegetable-tanned leather. Interior zip pocket and two slip pockets.',
 285, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 TRUE, TRUE, FALSE, 30),

('slim-briefcase', 'Slim Briefcase',
 'Fits a 15" laptop, front organizer panel, and removable shoulder strap. For the modern professional.',
 445, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, FALSE, TRUE, 18),

('crossbody-bag', 'Crossbody Bag',
 'Compact crossbody for hands-free carry. Adjustable strap, magnetic closure, interior card slots.',
 175, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, TRUE, FALSE, 40),

('backpack-leather', 'Heritage Leather Backpack',
 'Fits a 15" laptop, multiple compartments, padded back panel. Built for the long haul.',
 495, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 TRUE, TRUE, FALSE, 20),

('toiletry-bag', 'Leather Toiletry Bag',
 'Keep your grooming essentials organized. Waterproof lining, multiple pockets, sturdy top handle.',
 125, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, TRUE, TRUE, 50),

('portfolio-case', 'Leather Portfolio Case',
 'Professional portfolio for documents, iPad, and notebook. Zippered closure, pen loop, business card holder.',
 195, 'bags',
 '["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]',
 FALSE, TRUE, TRUE, 30),

('satchel-bag', 'Classic Satchel',
 'Traditional structured satchel with top handle and crossbody strap. Polished brass hardware.',
 325, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, TRUE, 16),

('laptop-bag', 'Leather Laptop Bag',
 'Padded sleeve for 13-16" laptops, external quick-access pocket, premium leather construction.',
 365, 'bags',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800"]',
 FALSE, FALSE, FALSE, 22)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
  images = EXCLUDED.images, featured = EXCLUDED.featured, bestseller = EXCLUDED.bestseller,
  personalizable = EXCLUDED.personalizable, stock_count = EXCLUDED.stock_count;

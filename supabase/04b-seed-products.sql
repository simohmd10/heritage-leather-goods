-- ============================================================
-- PART 4b/5 — Seed: Products (Belts & Accessories)
-- Run this fifth in Supabase SQL Editor
-- ============================================================

INSERT INTO public.products (slug, name, description, price, category, images, featured, bestseller, personalizable, stock_count) VALUES

-- BELTS
('artisan-dress-belt', 'Artisan Dress Belt',
 'Cut from a single piece of full-grain leather, finished with a solid brass buckle. Lasts for decades.',
 85, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 TRUE, FALSE, TRUE, 75),

('casual-leather-belt', 'Casual Leather Belt',
 'Everyday casual belt in full-grain leather with matte silver buckle. Versatile for jeans or chinos.',
 70, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, TRUE, FALSE, 100),

('western-belt', 'Western Tooled Belt',
 'Hand-tooled western-style belt with intricate floral pattern and sterling silver buckle.',
 125, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800","https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600"]',
 TRUE, FALSE, TRUE, 30),

('reversible-belt', 'Reversible Belt',
 'Two belts in one — black on one side, tan on the other. Simply remove the buckle to reverse.',
 95, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, TRUE, FALSE, 80),

('braided-belt', 'Braided Leather Belt',
 'Handwoven braided belt in supple leather. Stretch weave provides a comfortable custom fit.',
 80, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 60),

('wide-leather-belt', 'Wide Leather Belt',
 '4cm wide statement belt in thick vegetable-tanned leather with a double-prong buckle.',
 90, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 50),

('skinny-belt', 'Skinny Leather Belt',
 'Delicate 2cm belt perfect for women''s fashion. Gold pin buckle. Pairs with dresses and blazers.',
 60, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, TRUE, FALSE, 65),

('ratchet-belt', 'Ratchet Click Belt',
 'Micro-adjustable ratchet belt with no holes. Click mechanism allows precise fit in 1cm increments.',
 115, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 45),

('officer-belt', 'Officer Dress Belt',
 'Formal 3cm belt with polished gold-tone buckle. Ideal for military, uniform, or formal events.',
 100, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, TRUE, 40),

('garrison-belt', 'Garrison Duty Belt',
 'Heavy-duty leather belt 4.5cm wide for outdoor and work use. Double tongue buckle. Virtually indestructible.',
 110, 'belts',
 '["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"]',
 FALSE, FALSE, FALSE, 35),

-- ACCESSORIES
('leather-key-organizer', 'Leather Key Organizer',
 'Holds 2-7 keys in a compact organized stack. Thick vegetable-tanned leather with stainless steel hardware.',
 45, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 100),

('leather-notebook-cover', 'Leather Notebook Cover',
 'Refillable leather cover for A5 notebooks. Card slots, pen loop, and bookmark. Gets better with age.',
 75, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, TRUE, TRUE, 60),

('luggage-tag', 'Leather Luggage Tag',
 'Personalized leather luggage tag with buckle strap and privacy address card. Bold and durable.',
 40, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, TRUE, TRUE, 120),

('desk-pad', 'Leather Desk Pad',
 'Large leather desk mat 60×30cm with non-slip backing. Ages beautifully, adds a professional touch.',
 120, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 TRUE, FALSE, FALSE, 25),

('phone-case-leather', 'Leather Phone Case',
 'Genuine leather phone case with card pocket and magnetic closure. Precise cutouts.',
 65, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, TRUE, FALSE, 70),

('leather-bracelet', 'Leather Wrap Bracelet',
 'Handcrafted leather wrap bracelet with sterling silver clasp. Wraps twice. Unisex design.',
 50, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, TRUE, 90),

('card-case', 'Business Card Case',
 'Slim leather case for business cards. Holds 15-20 cards. Ideal as a corporate gift.',
 45, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, TRUE, TRUE, 100),

('glasses-case', 'Leather Glasses Case',
 'Hardshell leather case with soft suede lining. Protects glasses from scratches. Magnetic closure.',
 55, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, FALSE, 45),

('pen-case', 'Leather Pen Case',
 'Roll-up pen case for 6 pens. Soft interior lining, tie closure. For artists, writers, and executives.',
 60, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 FALSE, FALSE, TRUE, 55),

('leather-watch-roll', 'Leather Watch Roll',
 'Holds 3 watches securely in individual padded pockets. Rolls up for easy travel packing.',
 135, 'accessories',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]',
 FALSE, FALSE, FALSE, 30)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
  images = EXCLUDED.images, featured = EXCLUDED.featured, bestseller = EXCLUDED.bestseller,
  personalizable = EXCLUDED.personalizable, stock_count = EXCLUDED.stock_count;

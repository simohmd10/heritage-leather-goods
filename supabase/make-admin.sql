-- ============================================================
-- Make a user an admin
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Replace 'your@email.com' with your actual email
-- 3. Run the query
-- ============================================================

-- If the profiles table doesn't exist yet, run schema.sql first.
-- Then run this to grant admin access:

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);

-- Verify it worked (should return 1 row with role = admin):
SELECT p.id, u.email, p.name, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'your@email.com';

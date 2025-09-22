-- Helper query to find your user ID
-- Run this first to get your user ID, then use it in the main script

-- Method 1: Find by email (if you know your login email)
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'your-email@example.com'  -- Replace with your actual email
ORDER BY created_at DESC
LIMIT 5;

-- Method 2: Show all recent users (if you're the only one or most recent)
SELECT 
    id as user_id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- Method 3: Find users with profiles (if you've already created your profile)
SELECT 
    au.id as user_id,
    au.email,
    p.first_name,
    p.display_name,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NOT NULL
ORDER BY au.created_at DESC;

-- Method 4: If you're currently logged in through the dashboard, this might work
-- (Note: This may not work in SQL editor context)
SELECT auth.uid() as current_user_id;
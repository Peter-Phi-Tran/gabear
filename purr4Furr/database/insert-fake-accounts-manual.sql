-- Manual version: Insert fake user accounts into Supabase database
-- This version requires you to manually replace YOUR_USER_ID with your actual user ID
-- Find your user ID by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- Or check in your app's authentication state

-- STEP 1: Replace 'YOUR_USER_ID' below with your actual user ID
-- STEP 2: Run this script in your Supabase SQL editor

DO $$
DECLARE
    current_user_id UUID := 'YOUR_USER_ID'::UUID;  -- REPLACE THIS WITH YOUR ACTUAL USER ID
    luna_id UUID := gen_random_uuid();
    rex_id UUID := gen_random_uuid();
    zara_id UUID := gen_random_uuid();
    finn_id UUID := gen_random_uuid();
    match_id UUID := gen_random_uuid();
BEGIN

-- Validate user ID format
IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Please replace YOUR_USER_ID with your actual user ID';
END IF;

-- Insert fake profiles into the profiles table
INSERT INTO profiles (
  id, 
  first_name, 
  last_name, 
  display_name, 
  age, 
  gender, 
  sexuality, 
  fursona, 
  bio, 
  interests, 
  profile_picture, 
  height, 
  ethnicity, 
  pronouns, 
  location_city, 
  location_state, 
  last_active, 
  is_active, 
  profile_completed
) VALUES 
(
  luna_id,
  'Luna',
  'Silverpaw',
  'MoonWolf95',
  28,
  'Female',
  'Bisexual',
  'Arctic Wolf',
  'Love stargazing and long walks in the forest. Looking for someone who appreciates nature as much as I do! 🌙✨ Art enthusiast and coffee addict.',
  ARRAY['Art', 'Nature Photography', 'Gaming', 'Coffee', 'Astronomy'],
  NULL,
  '5''6"',
  'Mixed',
  'She/Her',
  'Portland',
  'Oregon',
  NOW() - INTERVAL '30 minutes',
  true,
  true
),
(
  rex_id,
  'Rex',
  'Thunderclaw',
  'DragonHeart',
  32,
  'Male',
  'Straight',
  'Red Dragon',
  'Adventure seeker and fantasy enthusiast! Love D&D campaigns, rock climbing, and cooking for friends. Looking for my co-adventurer in life! 🐲⚔️',
  ARRAY['D&D', 'Rock Climbing', 'Cooking', 'Fantasy Movies', 'Travel'],
  NULL,
  '6''2"',
  'Latino',
  'He/Him',
  'Austin',
  'Texas',
  NOW() - INTERVAL '45 minutes',
  true,
  true
),
(
  zara_id,
  'Zara',
  'Foxglove',
  'TechVixen',
  26,
  'Non-binary',
  'Pansexual',
  'Fennec Fox',
  'Software engineer by day, digital artist by night! Love indie games, synthwave music, and building cool tech projects. Always down for a good debate about sci-fi! 🦊💻',
  ARRAY['Programming', 'Digital Art', 'Indie Games', 'Synthwave', 'Sci-Fi'],
  NULL,
  '5''4"',
  'Asian',
  'They/Them',
  'San Francisco',
  'California',
  NOW() - INTERVAL '15 minutes',
  true,
  true
),
(
  finn_id,
  'Finn',
  'Oceantail',
  'AquaFur',
  30,
  'Male',
  'Gay',
  'Otter',
  'Marine biologist who loves the ocean as much as I love making people laugh! Enjoy swimming, beach volleyball, and sustainable living. Let''s save the planet together! 🌊🦦',
  ARRAY['Marine Biology', 'Swimming', 'Beach Volleyball', 'Comedy', 'Environmental Activism'],
  NULL,
  '5''10"',
  'White',
  'He/Him',
  'Miami',
  'Florida',
  NOW() - INTERVAL '5 minutes',
  true,
  true
);

-- Insert some likes (mutual likes between you and Luna for a match)
INSERT INTO likes (liker_id, liked_id, created_at) VALUES 
(luna_id, current_user_id, NOW() - INTERVAL '1 day'),  -- Luna likes you
(current_user_id, luna_id, NOW() - INTERVAL '23 hours'), -- You like Luna (creates mutual match)
(rex_id, luna_id, NOW() - INTERVAL '2 hours'), -- Rex likes Luna
(current_user_id, finn_id, NOW() - INTERVAL '2 days'), -- You like Finn
(zara_id, current_user_id, NOW() - INTERVAL '3 hours'); -- Zara likes you

-- Insert a mutual match between you and Luna (since you both liked each other)
INSERT INTO matches (id, user1_id, user2_id, created_at) VALUES 
(match_id, current_user_id, luna_id, NOW() - INTERVAL '23 hours');

-- Insert conversation messages between you and Luna
INSERT INTO messages (id, match_id, sender_id, receiver_id, content, created_at, message_type) VALUES 
(gen_random_uuid(), match_id, luna_id, current_user_id, 'Hey! I saw we matched! I love your profile 🌙', NOW() - INTERVAL '23 hours', 'text'),
(gen_random_uuid(), match_id, current_user_id, luna_id, 'Thanks! I love your art and astronomy interests. Do you do astrophotography?', NOW() - INTERVAL '22 hours', 'text'),
(gen_random_uuid(), match_id, luna_id, current_user_id, 'Yes! I actually have a whole series of moon phases I''ve been working on. The wolf in me can''t resist a good moon shot 🐺', NOW() - INTERVAL '20 hours', 'text'),
(gen_random_uuid(), match_id, current_user_id, luna_id, 'That sounds incredible! I would love to see your work sometime', NOW() - INTERVAL '18 hours', 'text'),
(gen_random_uuid(), match_id, luna_id, current_user_id, 'I''d love to share them! Maybe we could go on a stargazing adventure together? I know some amazing spots outside the city', NOW() - INTERVAL '12 hours', 'text'),
(gen_random_uuid(), match_id, current_user_id, luna_id, 'That sounds like a perfect date! I''m definitely interested ✨', NOW() - INTERVAL '30 minutes', 'text'),
(gen_random_uuid(), match_id, luna_id, current_user_id, 'Amazing! How about this weekend? I''ll bring my telescope and you can bring your camera!', NOW() - INTERVAL '20 minutes', 'text');

-- Output the generated UUIDs for reference
RAISE NOTICE 'Current User ID: %', current_user_id;
RAISE NOTICE 'Luna ID: %', luna_id;
RAISE NOTICE 'Rex ID: %', rex_id;
RAISE NOTICE 'Zara ID: %', zara_id;
RAISE NOTICE 'Finn ID: %', finn_id;
RAISE NOTICE 'Match ID with Luna: %', match_id;

END $$;

-- Verify the data was inserted
SELECT 'Profiles inserted:' as info, COUNT(*) as count FROM profiles WHERE first_name IN ('Luna', 'Rex', 'Zara', 'Finn');
SELECT 'Likes inserted:' as info, COUNT(*) as count FROM likes WHERE created_at > NOW() - INTERVAL '1 week';
SELECT 'Matches inserted:' as info, COUNT(*) as count FROM matches WHERE created_at > NOW() - INTERVAL '1 week';
SELECT 'Messages inserted:' as info, COUNT(*) as count FROM messages WHERE created_at > NOW() - INTERVAL '1 week';

-- Display the fake profiles for verification
SELECT id, first_name, display_name, age, gender, fursona, location_city FROM profiles WHERE first_name IN ('Luna', 'Rex', 'Zara', 'Finn');

-- Show your matches (replace YOUR_USER_ID with the same user ID you used above)
SELECT 
    p.first_name, 
    p.display_name, 
    p.age, 
    m.created_at as matched_at
FROM matches m
JOIN profiles p ON (p.id = m.user1_id OR p.id = m.user2_id)
WHERE (m.user1_id = 'YOUR_USER_ID'::UUID OR m.user2_id = 'YOUR_USER_ID'::UUID)
    AND p.id != 'YOUR_USER_ID'::UUID
    AND m.created_at > NOW() - INTERVAL '1 week';
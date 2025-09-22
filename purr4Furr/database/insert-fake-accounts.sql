-- Insert fake user accounts into Supabase database
-- Run this in your Supabase SQL editor

-- Generate UUIDs for fake users to ensure consistency
-- Store the UUIDs in variables for reuse
DO $$
DECLARE
    luna_id UUID := gen_random_uuid();
    rex_id UUID := gen_random_uuid();
    zara_id UUID := gen_random_uuid();
    finn_id UUID := gen_random_uuid();
    match_id UUID := gen_random_uuid();
BEGIN

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

-- Insert some likes (Luna likes the current user, Rex likes Luna, etc.)
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can find your user ID by running: SELECT auth.uid();
INSERT INTO likes (liker_id, liked_id, created_at) VALUES 
(luna_id, 'YOUR_USER_ID', NOW() - INTERVAL '1 day'),  -- Luna likes you
(rex_id, luna_id, NOW() - INTERVAL '2 hours'), -- Rex likes Luna
('YOUR_USER_ID', finn_id, NOW() - INTERVAL '2 days'); -- You like Finn

-- Insert a mutual match between you and Finn
INSERT INTO matches (id, user1_id, user2_id, created_at) VALUES 
(match_id, 'YOUR_USER_ID', finn_id, NOW() - INTERVAL '2 days');

-- Insert conversation messages between you and Finn
INSERT INTO messages (id, match_id, sender_id, receiver_id, content, created_at, message_type) VALUES 
(gen_random_uuid(), match_id, finn_id, 'YOUR_USER_ID', 'Hey! I saw you like marine biology too! That''s so cool 🌊', NOW() - INTERVAL '2 days', 'text'),
(gen_random_uuid(), match_id, 'YOUR_USER_ID', finn_id, 'Thanks! I love your otter fursona - otters are amazing! What got you into marine biology?', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', 'text'),
(gen_random_uuid(), match_id, finn_id, 'YOUR_USER_ID', 'I''ve always been fascinated by ocean life! Plus otters are basically the comedians of the sea 😄 What about you? Are you studying it or just passionate about it?', NOW() - INTERVAL '1 day', 'text'),
(gen_random_uuid(), match_id, 'YOUR_USER_ID', finn_id, 'Mostly passionate! I do a lot of underwater photography. Would love to capture some marine life shots sometime', NOW() - INTERVAL '12 hours', 'text'),
(gen_random_uuid(), match_id, finn_id, 'YOUR_USER_ID', 'That''s awesome! I know some great spots for underwater photography. Maybe we could plan a dive trip together?', NOW() - INTERVAL '6 hours', 'text'),
(gen_random_uuid(), match_id, 'YOUR_USER_ID', finn_id, 'I would absolutely love that! I''ve been wanting to try some coral reef photography', NOW() - INTERVAL '30 minutes', 'text'),
(gen_random_uuid(), match_id, finn_id, 'YOUR_USER_ID', 'That sounds like an amazing plan! When were you thinking?', NOW() - INTERVAL '20 minutes', 'text');

-- Output the generated UUIDs for reference
RAISE NOTICE 'Luna ID: %', luna_id;
RAISE NOTICE 'Rex ID: %', rex_id;
RAISE NOTICE 'Zara ID: %', zara_id;
RAISE NOTICE 'Finn ID: %', finn_id;
RAISE NOTICE 'Match ID: %', match_id;

END $$;

-- Verify the data was inserted
SELECT 'Profiles inserted:' as info, COUNT(*) as count FROM profiles WHERE first_name IN ('Luna', 'Rex', 'Zara', 'Finn');
SELECT 'Likes inserted:' as info, COUNT(*) as count FROM likes;
SELECT 'Matches inserted:' as info, COUNT(*) as count FROM matches;
SELECT 'Messages inserted:' as info, COUNT(*) as count FROM messages;

-- Display the fake profiles for verification
SELECT id, first_name, display_name, age, gender, fursona FROM profiles WHERE first_name IN ('Luna', 'Rex', 'Zara', 'Finn');
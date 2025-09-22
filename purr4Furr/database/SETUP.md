# Supabase Database Setup Guide

This guide will help you set up the complete database schema for your dating app in Supabase.

## Prerequisites

1. **Supabase Account**: Make sure you have a Supabase account and project created
2. **Project URL & API Key**: Get your project URL and anon key from your Supabase dashboard
3. **Environment Variables**: Update your `.env` or `supabase.env` files

## Quick Setup Steps

### 1. Update Environment Variables

Make sure your `backend/supabase.env` file has the correct values:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Run the Database Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. **Choose the right file:**
   - **First time setup**: Use `database/schema.sql`
   - **If you get "already exists" errors**: Use `database/schema-safe.sql`
5. Copy and paste the **entire contents** of the chosen file
6. Click **"Run"** to execute the script

⚠️ **Important**: 
- `database/schema.sql` - Complete schema for first-time setup
- `database/schema-safe.sql` - Safe version that handles existing objects (use if you get errors)
- `supabase-schema.sql` - Old version (ignore this one)

### 3. Verify Schema Creation

After running the script, check that these were created:

#### In Database → Tables:
- ✅ `likes` - User swipes/likes
- ✅ `matches` - Mutual likes between users  
- ✅ `messages` - Chat messages between matches
- ✅ `user_passes` - Users that were passed/rejected
- ✅ `profiles` - Should have new columns added

#### In Database → Views:
- ✅ `user_feed` - Optimized view for browsing profiles
- ✅ `user_matches` - Optimized view for showing matches with profile data

#### Check RLS Policies:
- Go to **Database → Authentication → Policies**
- You should see policies for `likes`, `matches`, `messages`, `user_passes`

### 4. Enable Realtime (REQUIRED for Chat Features)

**Option 1: Using Supabase Dashboard (Recommended)**
1. Go to **Database → Replication** in your Supabase dashboard
2. Under **supabase_realtime** publication, toggle ON these tables:
   - ✅ `messages` (REQUIRED for live chat)
   - ✅ `matches` (for live match notifications)
   - ✅ `likes` (optional - for live like notifications)

**Option 2: Using SQL (Alternative)**
Run this in your SQL Editor if the dashboard method doesn't work:
```sql
-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
```

**Important**: Without replication enabled, realtime chat will NOT work. The app won't receive live message updates.

### 5. Test Basic Functionality

#### Add Test Users to Profiles Table:

Go to **Database → Table Editor → profiles** and add some test data:

```sql
-- Run this in SQL Editor to add test users
-- SOLUTION 1: Create corresponding auth.users entries first
-- This creates the required user records that the foreign key constraint expects

-- First, insert into auth.users table (this might require admin privileges)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES 
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'alex@test.com', '$2a$10$test', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'sam@test.com', '$2a$10$test', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'jordan@test.com', '$2a$10$test', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'casey@test.com', '$2a$10$test', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'morgan@test.com', '$2a$10$test', NOW(), NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- SOLUTION 2 (Alternative): Temporarily drop the foreign key constraint
-- Uncomment these lines if the above doesn't work:
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now insert the profile data
INSERT INTO profiles (
  id, 
  first_name,
  last_name,
  pronouns,
  age, 
  height,
  gender, 
  sexuality, 
  interested_in,
  ethnicity,
  fursona,
  interests,
  dating_intentions,
  relationship_type,
  bio,
  is_active,
  last_active
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex', 'Rivers', 'they/them', 25, '5''6"', 'non-binary', 'pansexual', ARRAY['men', 'women', 'non-binary'], 'Mixed', 'Wolf', ARRAY['hiking', 'coffee'], 'relationship', 'monogamous', 'Love hiking and coffee dates ☕', true, NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Sam', 'Chen', 'she/her', 28, '5''4"', 'female', 'lesbian', ARRAY['women'], 'Asian', 'Fox', ARRAY['photography', 'dogs'], 'long-term', 'monogamous', 'Photographer and dog lover 📷', true, NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Jordan', 'Martinez', 'he/him', 24, '5''10"', 'male', 'bisexual', ARRAY['men', 'women', 'non-binary'], 'Latino', 'Cat', ARRAY['yoga', 'cooking'], 'casual', 'open', 'Yoga instructor and foodie 🧘', true, NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Casey', 'Johnson', 'she/her', 30, '5''7"', 'female', 'straight', ARRAY['men'], 'White', 'Dragon', ARRAY['travel', 'adventure'], 'relationship', 'monogamous', 'Travel enthusiast ✈️', true, NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Morgan', 'Davis', 'they/them', 26, '5''5"', 'non-binary', 'queer', ARRAY['men', 'women', 'non-binary'], 'Black', 'Rabbit', ARRAY['art', 'music'], 'open', 'polyamorous', 'Artist and music lover 🎨', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- SOLUTION 3 (If Solution 2 was used): Re-add the foreign key constraint
-- Uncomment if you dropped the constraint above:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ADDITIONAL FIX: Remove foreign key constraints from dating tables for testing
-- Run this if you're getting foreign key errors when liking/passing users
ALTER TABLE user_passes DROP CONSTRAINT IF EXISTS user_passes_user_id_fkey;
ALTER TABLE user_passes DROP CONSTRAINT IF EXISTS user_passes_passed_user_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_liked_user_id_fkey;
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_user1_id_fkey;
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_user2_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Update Alex to be compatible with Steven (create potential match)
-- Alex: pansexual, interested in everyone including transgender people
-- Steven: gay, interested in everyone + non-binary people  
UPDATE profiles 
SET interested_in = ARRAY['men', 'women', 'non-binary', 'transgender'],
    sexuality = 'pansexual'
WHERE id = '11111111-1111-1111-1111-111111111111';
```

**If the auth.users insert fails (permission denied), use this simpler approach:**

```sql
-- SIMPLE SOLUTION: Remove foreign key constraint for testing
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert test profiles
INSERT INTO profiles (
  id, 
  first_name,
  last_name,
  pronouns,
  age, 
  height,
  gender, 
  sexuality, 
  interested_in,
  ethnicity,
  fursona,
  interests,
  dating_intentions,
  relationship_type,
  bio,
  is_active,
  last_active
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex', 'Rivers', 'they/them', 25, '5''6"', 'non-binary', 'pansexual', ARRAY['men', 'women', 'non-binary'], 'Mixed', 'Wolf', ARRAY['hiking', 'coffee'], 'relationship', 'monogamous', 'Love hiking and coffee dates ☕', true, NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Sam', 'Chen', 'she/her', 28, '5''4"', 'female', 'lesbian', ARRAY['women'], 'Asian', 'Fox', ARRAY['photography', 'dogs'], 'long-term', 'monogamous', 'Photographer and dog lover 📷', true, NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Jordan', 'Martinez', 'he/him', 24, '5''10"', 'male', 'bisexual', ARRAY['men', 'women', 'non-binary'], 'Latino', 'Cat', ARRAY['yoga', 'cooking'], 'casual', 'open', 'Yoga instructor and foodie 🧘', true, NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Casey', 'Johnson', 'she/her', 30, '5''7"', 'female', 'straight', ARRAY['men'], 'White', 'Dragon', ARRAY['travel', 'adventure'], 'relationship', 'monogamous', 'Travel enthusiast ✈️', true, NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Morgan', 'Davis', 'they/them', 26, '5''5"', 'non-binary', 'queer', ARRAY['men', 'women', 'non-binary'], 'Black', 'Rabbit', ARRAY['art', 'music'], 'open', 'polyamorous', 'Artist and music lover 🎨', true, NOW())
ON CONFLICT (id) DO NOTHING;
```

**Important Note for Production:**
- These test profiles use placeholder UUIDs
- In your actual app, profile IDs should come from authenticated users
- You may need to create actual user accounts first, then use their auth.uid() values
- Consider removing the foreign key constraint if it's blocking development, or create corresponding auth.users entries

## Update Your App Configuration

### Update Supabase Client Configuration

Make sure your `lib/supabase.ts` file points to your project:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Environment Files

Update `backend/supabase.env`:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Current App Status After Setup

### Stage 1: Basic Setup (Before schema) ✅
- App loads and displays profiles from `profiles` table
- Graceful fallbacks when dating tables don't exist
- No crashes, just limited functionality

### Stage 2: Full Database (After running schema.sql) 🎯
- ✅ Complete like/pass/match functionality
- ✅ Optimized queries using views
- ✅ Real match detection and notifications
- ✅ Security with RLS policies
- ✅ Automatic match creation via triggers

### Stage 3: Enhanced Features (Future)
- ✅ Real-time chat (ready to implement)
- ✅ Push notifications
- ✅ Advanced filtering and recommendations

## Troubleshooting

### Common Issues:

1. **"Table does not exist" errors (Before setup)**
   - ✅ Normal behavior - app handles this gracefully
   - Run the `database/schema.sql` file in Supabase SQL Editor

2. **"policy already exists" or "already exists" errors**
   - This happens if you've run the schema before
   - **Solution**: Use `database/schema-safe.sql` instead
   - This version safely handles existing objects

3. **"Column does not exist" errors**
   - The schema adds columns to existing `profiles` table
   - Make sure the full schema ran successfully

4. **Permission/RLS errors**
   - Check that RLS policies were created correctly
   - Ensure your user is properly authenticated

5. **Empty user feed**
   - Add test profiles using the SQL above
   - Check that profiles have `is_active = true`

6. **Views not working**
   - Views depend on the current user (`auth.uid()`)
   - Make sure you're logged in when testing

### Verification Checklist:

After setup, your app should:
- ✅ Load profiles in the discover feed
- ✅ Allow liking profiles (stores in database)
- ✅ Show liked profiles in likes tab
- ✅ Create matches when mutual likes occur
- ✅ Display matches in matches tab
- ✅ No console errors about missing tables

## File Structure Reference

```
database/
├── schema.sql          ← Use this for first-time setup
├── schema-safe.sql     ← Use this if you get "already exists" errors
├── SETUP.md           ← This guide
└── supabase-schema.sql ← Old/simple version (ignore)
```

## Next Steps After Setup

1. ✅ **Test the app** - Should work fully now
2. ✅ **Add real users** - Remove test data, add real profiles  
3. ✅ **Implement chat** - Real-time messaging between matches
4. ✅ **Add images** - Profile picture uploads
5. ✅ **Push notifications** - Match and message alerts

Your dating app will be fully functional after completing this setup! 🎉
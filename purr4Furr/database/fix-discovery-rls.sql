-- Fix for discovery feed: Add RLS policy to allow users to view other completed profiles
-- This needs to be run in your Supabase SQL Editor

-- Add policy to allow users to view other users' completed profiles for discovery
DROP POLICY IF EXISTS "Users can view completed profiles for discovery" ON profiles;
CREATE POLICY "Users can view completed profiles for discovery" ON profiles
  FOR SELECT USING (
    id != auth.uid() AND                    -- Not their own profile
    is_active = true AND                    -- Only active profiles
    profile_completed = true                -- Only completed profiles
  );

-- Also make sure there's a policy for users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
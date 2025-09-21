-- Supabase Database Schema for Purr4Furr Dating App
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create profiles table to store user survey data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pronouns TEXT NOT NULL,
  age INTEGER NOT NULL,
  height TEXT,
  
  -- Identity
  gender TEXT NOT NULL,
  sexuality TEXT NOT NULL,
  interested_in TEXT[] NOT NULL, -- Array of strings
  ethnicity TEXT,
  zodiac TEXT,
  fursona TEXT,
  
  -- Professional
  work TEXT,
  job_title TEXT,
  school TEXT,
  education TEXT,
  
  -- Personal Beliefs
  religion TEXT,
  politics TEXT,
  
  -- Dating
  dating_intentions TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  
  -- Interests (array of strings)
  interests TEXT[] DEFAULT '{}',
  
  -- Profile completion
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Location (for future features)
  location TEXT,
  bio TEXT
);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for profiles
-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 6. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Create likes table for dating functionality
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  liker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  liked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_mutual BOOLEAN DEFAULT FALSE,
  UNIQUE(liker_id, liked_id)
);

-- 9. Enable RLS for likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 10. Create policies for likes
CREATE POLICY "Users can view likes involving them" ON likes
  FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = liker_id);

-- 11. Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(user1_id, user2_id)
);

-- 12. Enable RLS for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 13. Create policies for matches
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 14. Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);

-- 15. Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 16. Create policies for messages
CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );
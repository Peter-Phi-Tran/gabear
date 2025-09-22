-- Dating App Database Schema for Supabase (Verified & Correct Version)
-- This file contains properly structured SQL with all relationships verified
-- This version handles existing objects gracefully and ensures all columns exist

-- 1. Profiles table (extends auth.users)
-- Add columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_active_idx ON profiles(is_active, last_active);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles(location_city, location_state);

-- 2. Likes table - tracks who liked whom
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    liker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liker_id, liked_id)
);

-- Enable RLS and create policies
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Users can view their own likes" ON likes
    FOR SELECT USING (liker_id = auth.uid());

CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (liker_id = auth.uid());

CREATE POLICY "Users can delete their own likes" ON likes
    FOR DELETE USING (liker_id = auth.uid());

-- Indexes for likes
CREATE INDEX IF NOT EXISTS likes_liker_idx ON likes(liker_id);
CREATE INDEX IF NOT EXISTS likes_liked_idx ON likes(liked_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON likes(created_at);

-- 3. User passes table - tracks who user has passed on
CREATE TABLE IF NOT EXISTS user_passes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    passed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, passed_user_id)
);

-- Enable RLS and create policies
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own passes" ON user_passes;
DROP POLICY IF EXISTS "Users can create passes" ON user_passes;

CREATE POLICY "Users can view their own passes" ON user_passes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create passes" ON user_passes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes for user_passes
CREATE INDEX IF NOT EXISTS user_passes_user_idx ON user_passes(user_id);
CREATE INDEX IF NOT EXISTS user_passes_passed_user_idx ON user_passes(passed_user_id);

-- 4. Matches table - tracks mutual likes
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Ensures consistent ordering
);

-- Add the last_message_at column after table creation
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS and create policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their matches" ON matches;

CREATE POLICY "Users can view their matches" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Indexes for matches (create after ensuring columns exist)
CREATE INDEX IF NOT EXISTS matches_user1_idx ON matches(user1_id);
CREATE INDEX IF NOT EXISTS matches_user2_idx ON matches(user2_id);
CREATE INDEX IF NOT EXISTS matches_last_message_idx ON matches(last_message_at);

-- 5. Messages table - CORRECTED VERSION (no receiver_id needed)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif'))
);

-- Add read_at column after table creation to handle existing tables
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS and Realtime
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages REPLICA IDENTITY FULL;

-- RLS Policies for messages (CORRECTED - no receiver_id references)
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their matches" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

CREATE POLICY "Users can view messages in their matches" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages to their matches" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Indexes for messages
CREATE INDEX IF NOT EXISTS messages_match_idx ON messages(match_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- 6. Update existing data
-- Update existing matches that might not have last_message_at set properly
UPDATE matches 
SET last_message_at = created_at 
WHERE last_message_at IS NULL;

-- 7. Functions for automatic match creation
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the liked user has also liked the liker
    IF EXISTS (
        SELECT 1 FROM likes 
        WHERE liker_id = NEW.liked_id 
        AND liked_id = NEW.liker_id
    ) THEN
        -- Create a match with consistent user ordering
        INSERT INTO matches (user1_id, user2_id, created_at, last_message_at)
        VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id),
            NOW(),
            NOW()
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create matches
DROP TRIGGER IF EXISTS create_match_trigger ON likes;
CREATE TRIGGER create_match_trigger
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION create_match_on_mutual_like();

-- 8. Function to update last_message_at in matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the last_message_at timestamp in the matches table
    UPDATE matches 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.match_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last message time
DROP TRIGGER IF EXISTS update_match_last_message_trigger ON messages;
CREATE TRIGGER update_match_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_match_last_message();

-- 9. Views for the application

-- View to get user feed (potential matches)
CREATE OR REPLACE VIEW user_feed AS
SELECT DISTINCT
    p.id,
    p.first_name,
    p.age,
    p.gender,
    p.sexuality,
    p.fursona,
    p.bio,
    p.interests,
    p.profile_picture,
    p.display_name,
    p.height,
    p.ethnicity,
    p.pronouns,
    p.location_city,
    p.location_state,
    p.last_active,
    p.is_active
FROM profiles p
WHERE p.id != auth.uid()  -- Exclude current user
AND p.is_active = true    -- Only active users
AND NOT EXISTS (          -- Exclude already liked users
    SELECT 1 FROM likes l 
    WHERE l.liker_id = auth.uid() 
    AND l.liked_id = p.id
)
AND NOT EXISTS (          -- Exclude passed users
    SELECT 1 FROM user_passes up 
    WHERE up.user_id = auth.uid() 
    AND up.passed_user_id = p.id
);

-- View to get user's matches with last message info (CORRECTED)
CREATE OR REPLACE VIEW user_matches AS
SELECT 
    m.id as match_id,
    m.created_at as matched_at,
    m.last_message_at,
    CASE 
        WHEN m.user1_id = auth.uid() THEN m.user2_id 
        ELSE m.user1_id 
    END as other_user_id,
    p.first_name,
    p.age,
    p.profile_picture,
    p.display_name,
    p.bio,
    p.last_active,
    p.is_active,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_time,
    last_msg.sender_id as last_message_sender_id,
    COALESCE(unread_count.count, 0) as unread_count
FROM matches m
JOIN profiles p ON (
    p.id = CASE 
        WHEN m.user1_id = auth.uid() THEN m.user2_id 
        ELSE m.user1_id 
    END
)
LEFT JOIN messages last_msg ON (
    last_msg.match_id = m.id 
    AND last_msg.created_at = m.last_message_at
)
LEFT JOIN (
    SELECT 
        match_id, 
        COUNT(*) as count 
    FROM messages 
    WHERE read_at IS NULL 
    AND sender_id != auth.uid()  -- Count unread messages not sent by current user
    GROUP BY match_id
) unread_count ON unread_count.match_id = m.id
WHERE m.user1_id = auth.uid() OR m.user2_id = auth.uid()
ORDER BY m.last_message_at DESC;

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 11. Enable realtime subscriptions (run these separately if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Success message
SELECT 'Dating app database schema setup completed successfully!' as status;

-- 12. Verification queries (run these to check everything worked)
/*
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('likes', 'matches', 'messages', 'user_passes');

-- Verify columns exist
SELECT table_name, column_name FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'matches' 
AND column_name IN ('last_message_at', 'created_at', 'user1_id', 'user2_id');

-- Verify views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('user_feed', 'user_matches');
*/
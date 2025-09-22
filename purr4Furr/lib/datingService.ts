import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from './logger';

export interface DatingProfile {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  sexuality: string;
  fursona: string;
  bio: string;
  interests: string[] | string;
  profile_picture: string | null;
  display_name: string | null;
  height: string;
  ethnicity: string;
  pronouns: string;
  location_city: string | null;
  location_state: string | null;
  last_active: string;
  is_active: boolean;
}

export interface DatingMatch {
  match_id: string;
  matched_at: string;
  last_message_at: string;
  other_user_id: string;
  first_name: string;
  age: number;
  profile_picture: string | null;
  display_name: string | null;
  bio: string;
  last_active: string;
  is_active: boolean;
  last_message_content: string | null;
  last_message_time: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  message_type: string;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
}

class DatingService {
  // Utility method to shuffle an array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get user feed (potential matches)
  async getUserFeed(limit: number = 20): Promise<DatingProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user for feed');
        return [];
      }

      console.log('Fetching user feed for user:', user.id);

      // First check if we have any profiles at all
      const { data: allProfiles, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      console.log('Total profiles check:', allProfiles?.length || 0, 'error:', countError);

      // Try to use the user_feed view first
      let { data, error } = await supabase
        .from('user_feed')
        .select('*')
        .limit(limit * 2)
        .order('last_active', { ascending: false });

      // If user_feed view doesn't work or has no data, fall back to profiles table
      if (error || !data || data.length === 0) {
        console.log('user_feed failed or empty, using profiles table directly');
        console.log('user_feed error:', error);
        
        // Use profiles table with proper filtering
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            display_name,
            age,
            bio,
            gender,
            sexuality,
            fursona,
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
          `)
          .neq('id', user.id)
          .eq('profile_completed', true)  // Only show completed profiles
          .limit(limit * 2);
        
        if (profilesError) {
          logger.error('Error fetching profiles', profilesError);
          console.log('Profiles fetch error:', profilesError);
          
          // If we get an RLS error, that means the policies aren't set up correctly
          if (profilesError.code === 'PGRST301') {
            console.error('RLS POLICY ERROR: Users cannot view other profiles. Run the fix-discovery-rls.sql script in Supabase!');
            return [];
          }
          
          throw profilesError;
        }
        
        console.log('Fetched profiles from table:', profilesData?.length || 0);
        
        // Filter profiles that have basic required data
        const validProfiles = (profilesData || []).filter(profile => 
          profile.first_name && 
          profile.age &&
          profile.profile_completed === true
        );
        
        console.log('Valid profiles after filtering:', validProfiles.length);
        
        // Shuffle and limit the results
        const shuffled = this.shuffleArray(validProfiles);
        return shuffled.slice(0, limit);
      }

      console.log('Fetched user feed from view:', data?.length || 0);

      // Shuffle the results from the view
      const shuffled = this.shuffleArray(data || []);
      return shuffled.slice(0, limit);
    } catch (error) {
      logger.error('Error in getUserFeed', error);
      console.log('getUserFeed catch error:', error);
      return []; // Return empty array instead of throwing to prevent app crashes
    }
  }

  // Like a user
  async likeUser(likedUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('likes')
        .insert({
          liker_id: user.id,
          liked_id: likedUserId
        });

      if (error) {
        // If likes table doesn't exist, just return false (no match)
        if (error.code === 'PGRST205') {
          console.log('Likes table not found - skipping like functionality');
          return false;
        }
        logger.error('Error liking user', error);
        throw error;
      }

      // Check if this created a match
      const isMatch = await this.checkForMatch(likedUserId);
      return isMatch;
    } catch (error) {
      logger.error('Error in likeUser', error);
      throw error;
    }
  }

  // Check if liking a user creates a match
  async checkForMatch(otherUserId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if a match exists between these users
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .limit(1);

      if (error) {
        // If matches table doesn't exist, return false
        if (error.code === 'PGRST205') {
          return false;
        }
        logger.error('Error checking for match', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      logger.error('Error in checkForMatch', error);
      return false;
    }
  }

  // Pass on a user (skip them)
  async passUser(passedUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_passes')
        .insert({
          user_id: user.id,
          passed_user_id: passedUserId
        });

      if (error) {
        // If user_passes table doesn't exist, just log and continue
        if (error.code === 'PGRST205') {
          console.log('User passes table not found - skipping pass functionality');
          return;
        }
        logger.error('Error passing user', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error in passUser', error);
      throw error;
    }
  }

  // Get user's liked profiles
  async getLikedProfiles(): Promise<DatingProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the liked user IDs
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id)
        .order('created_at', { ascending: false });

      if (likesError) {
        // If likes table doesn't exist, return empty array
        if (likesError.code === 'PGRST205') {
          return [];
        }
        logger.error('Error fetching likes', likesError);
        throw likesError;
      }

      if (!likes || likes.length === 0) {
        return [];
      }

      // Get the profile details for liked users
      const likedUserIds = likes.map(like => like.liked_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          age,
          gender,
          sexuality,
          fursona,
          bio,
          interests,
          profile_picture,
          display_name,
          height,
          ethnicity,
          pronouns,
          location_city,
          location_state,
          last_active,
          is_active
        `)
        .in('id', likedUserIds);

      if (profilesError) {
        logger.error('Error fetching liked profiles', profilesError);
        throw profilesError;
      }

      return profiles || [];
    } catch (error) {
      logger.error('Error in getLikedProfiles', error);
      throw error;
    }
  }

  // Unlike a user
  async unlikeUser(likedUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('liker_id', user.id)
        .eq('liked_id', likedUserId);

      if (error) {
        logger.error('Error unliking user', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error in unlikeUser', error);
      throw error;
    }
  }

  // Get user's matches
  async getMatches(): Promise<DatingMatch[]> {
    try {
      const { data, error } = await supabase
        .from('user_matches')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        // If user_matches view doesn't exist, return empty array
        if (error.code === 'PGRST205') {
          return [];
        }
        logger.error('Error fetching matches', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getMatches', error);
      throw error;
    }
  }

  // Get messages for a specific match
  async getMatchMessages(matchId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching messages', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getMatchMessages', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(matchId: string, receiverId: string, content: string): Promise<ChatMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error sending message', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in sendMessage', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(matchId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .eq('receiver_id', user.id)
        .is('read_at', null);

      if (error) {
        logger.error('Error marking messages as read', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error in markMessagesAsRead', error);
      throw error;
    }
  }

  // Subscribe to new messages for a match
  subscribeToMessages(matchId: string, callback: (message: ChatMessage) => void) {
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return subscription;
  }

  // Subscribe to new matches
  async subscribeToMatches(callback: (match: any) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  }

  // Update user's active status
  async updateLastActive(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to update with full schema, fall back to basic update
      let { error } = await supabase
        .from('profiles')
        .update({
          last_active: new Date().toISOString(),
          is_active: true
        })
        .eq('id', user.id);

      // If is_active column doesn't exist, try without it
      if (error && error.code === 'PGRST204') {
        const { error: basicError } = await supabase
          .from('profiles')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (basicError && basicError.code !== 'PGRST204') {
          logger.error('Error updating last active (basic)', basicError);
        }
        return;
      }

      if (error) {
        logger.error('Error updating last active', error);
      }
    } catch (error) {
      logger.error('Error in updateLastActive', error);
    }
  }

  // Set user as inactive
  async setUserInactive(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', user.id);

      if (error) {
        // If is_active column doesn't exist, just ignore
        if (error.code === 'PGRST204') {
          return;
        }
        logger.error('Error setting user inactive', error);
      }
    } catch (error) {
      logger.error('Error in setUserInactive', error);
    }
  }
}

export const datingService = new DatingService();
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { datingService, DatingProfile, DatingMatch, ChatMessage } from '@/lib/datingService';
import { useAuth } from './AuthContext';
import { logger } from '@/lib/logger';

interface DatingContextType {
  // User feed
  userFeed: DatingProfile[];
  loadingFeed: boolean;
  refreshFeed: () => Promise<void>;
  
  // Likes
  likedProfiles: DatingProfile[];
  loadingLikes: boolean;
  likeUser: (userId: string) => Promise<boolean>;
  unlikeUser: (userId: string) => Promise<void>;
  passUser: (userId: string) => Promise<void>;
  
  // Matches
  matches: DatingMatch[];
  loadingMatches: boolean;
  refreshMatches: () => Promise<void>;
  
  // Chat
  sendMessage: (matchId: string, receiverId: string, content: string) => Promise<void>;
  markMessagesAsRead: (matchId: string) => Promise<void>;
  getMessages: (matchId: string) => Promise<ChatMessage[]>;
  
  // Real-time subscriptions
  subscribeToMessages: (matchId: string, callback: (message: ChatMessage) => void) => any;
  subscribeToMatches: (callback: (match: any) => void) => any;
}

const DatingContext = createContext<DatingContextType | undefined>(undefined);

export const useDating = () => {
  const context = useContext(DatingContext);
  if (!context) {
    throw new Error('useDating must be used within a DatingProvider');
  }
  return context;
};

interface DatingProviderProps {
  children: ReactNode;
}

export const DatingProvider: React.FC<DatingProviderProps> = ({ children }) => {
  const { session, user } = useAuth();
  
  // State
  const [userFeed, setUserFeed] = useState<DatingProfile[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  
  const [likedProfiles, setLikedProfiles] = useState<DatingProfile[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load initial data when user logs in
  useEffect(() => {
    console.log('DatingContext: Auth state changed - session:', !!session, 'user:', !!user);
    
    if (session && user) {
      console.log('DatingContext: User logged in, loading initial data...');
      refreshFeed();
      refreshLikes();
      refreshMatches();
      
      // Update user's last active status
      datingService.updateLastActive();
      
      // Set up interval to update last active every 5 minutes
      const interval = setInterval(() => {
        datingService.updateLastActive();
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(interval);
        // Set user as inactive when they leave
        datingService.setUserInactive();
      };
    } else {
      console.log('DatingContext: User logged out, clearing data...');
      // Clear data when user logs out
      setUserFeed([]);
      setLikedProfiles([]);
      setMatches([]);
    }
  }, [session, user]);

  // User Feed Functions
  const refreshFeed = async () => {
    if (!session) {
      console.log('No session for refreshFeed');
      return;
    }
    
    try {
      setLoadingFeed(true);
      console.log('DatingContext: Refreshing user feed...');
      
      const feed = await datingService.getUserFeed(20);
      console.log('DatingContext: Received feed with', feed.length, 'profiles');
      
      setUserFeed(feed);
    } catch (error) {
      logger.error('Error refreshing feed', error);
      console.log('DatingContext: Feed refresh error:', error);
      
      // Set empty feed on error to show proper empty state
      setUserFeed([]);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Likes Functions
  const refreshLikes = async () => {
    if (!session) return;
    
    try {
      setLoadingLikes(true);
      const likes = await datingService.getLikedProfiles();
      setLikedProfiles(likes);
    } catch (error) {
      logger.error('Error refreshing likes', error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const likeUser = async (userId: string): Promise<boolean> => {
    try {
      const isMatch = await datingService.likeUser(userId);
      
      // Refresh likes and matches after liking
      await refreshLikes();
      if (isMatch) {
        await refreshMatches();
      }
      
      // Remove from feed
      setUserFeed(prev => prev.filter(profile => profile.id !== userId));
      
      return isMatch;
    } catch (error) {
      logger.error('Error liking user', error);
      throw error;
    }
  };

  const unlikeUser = async (userId: string): Promise<void> => {
    try {
      await datingService.unlikeUser(userId);
      
      // Refresh likes
      await refreshLikes();
      
      // Remove from liked profiles immediately for better UX
      setLikedProfiles(prev => prev.filter(profile => profile.id !== userId));
    } catch (error) {
      logger.error('Error unliking user', error);
      throw error;
    }
  };

  const passUser = async (userId: string): Promise<void> => {
    try {
      await datingService.passUser(userId);
      
      // Remove from feed immediately
      setUserFeed(prev => prev.filter(profile => profile.id !== userId));
    } catch (error) {
      logger.error('Error passing user', error);
      throw error;
    }
  };

  // Matches Functions
  const refreshMatches = async () => {
    if (!session) return;
    
    try {
      setLoadingMatches(true);
      const matchesData = await datingService.getMatches();
      setMatches(matchesData);
    } catch (error) {
      logger.error('Error refreshing matches', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Chat Functions
  const sendMessage = async (matchId: string, receiverId: string, content: string): Promise<void> => {
    try {
      await datingService.sendMessage(matchId, receiverId, content);
      
      // Refresh matches to update last message info
      await refreshMatches();
    } catch (error) {
      logger.error('Error sending message', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (matchId: string): Promise<void> => {
    try {
      await datingService.markMessagesAsRead(matchId);
      
      // Update matches to reflect read status
      await refreshMatches();
    } catch (error) {
      logger.error('Error marking messages as read', error);
      throw error;
    }
  };

  const getMessages = async (matchId: string): Promise<ChatMessage[]> => {
    try {
      return await datingService.getMatchMessages(matchId);
    } catch (error) {
      logger.error('Error getting messages', error);
      throw error;
    }
  };

  // Real-time subscription functions
  const subscribeToMessages = (matchId: string, callback: (message: ChatMessage) => void) => {
    return datingService.subscribeToMessages(matchId, callback);
  };

  const subscribeToMatches = (callback: (match: any) => void) => {
    return datingService.subscribeToMatches(callback);
  };

  const value = {
    // User feed
    userFeed,
    loadingFeed,
    refreshFeed,
    
    // Likes
    likedProfiles,
    loadingLikes,
    likeUser,
    unlikeUser,
    passUser,
    
    // Matches
    matches,
    loadingMatches,
    refreshMatches,
    
    // Chat
    sendMessage,
    markMessagesAsRead,
    getMessages,
    
    // Real-time subscriptions
    subscribeToMessages,
    subscribeToMatches,
  };

  return (
    <DatingContext.Provider value={value}>
      {children}
    </DatingContext.Provider>
  );
};
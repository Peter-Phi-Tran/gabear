import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface User {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: any;
}

export interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Match {
  id: string;
  user: User;
  messages: Message[];
  lastMessage?: Message;
  matchedAt: Date;
}

interface LikesContextType {
  likedProfiles: User[];
  matches: Match[];
  addLikedProfile: (user: User) => void;
  removeLikedProfile: (userId: number) => void;
  isProfileLiked: (userId: number) => boolean;
  checkForMatch: (user: User) => boolean;
  sendMessage: (matchId: string, text: string) => void;
  markMessagesAsRead: (matchId: string) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};

interface LikesProviderProps {
  children: ReactNode;
}

// Mock data for users who have already liked the current user
const usersWhoLikedMe = [2, 5, 8]; // Sam, Morgan, Blake have already liked the user

export const LikesProvider: React.FC<LikesProviderProps> = ({ children }) => {
  const [likedProfiles, setLikedProfiles] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const addLikedProfile = (user: User) => {
    setLikedProfiles(prev => {
      // Check if user is already liked
      if (prev.some(profile => profile.id === user.id)) {
        return prev;
      }
      
      // Check if this creates a match
      if (usersWhoLikedMe.includes(user.id)) {
        createMatch(user);
      }
      
      return [...prev, user];
    });
  };

  const createMatch = (user: User) => {
    const newMatch: Match = {
      id: `match_${user.id}_${Date.now()}`,
      user,
      messages: [],
      matchedAt: new Date(),
    };
    
    setMatches(prev => [...prev, newMatch]);
  };

  const removeLikedProfile = (userId: number) => {
    setLikedProfiles(prev => prev.filter(profile => profile.id !== userId));
    // Also remove from matches if exists
    setMatches(prev => prev.filter(match => match.user.id !== userId));
  };

  const isProfileLiked = (userId: number) => {
    return likedProfiles.some(profile => profile.id === userId);
  };

  const checkForMatch = (user: User) => {
    return usersWhoLikedMe.includes(user.id);
  };

  const sendMessage = useCallback((matchId: string, text: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 0, // Current user ID (placeholder)
      receiverId: 0, // Will be set based on match
      text,
      timestamp: new Date(),
      read: true, // Own messages are automatically read
    };

    setMatches(prev => prev.map(match => {
      if (match.id === matchId) {
        const updatedMessages = [...match.messages, newMessage];
        return {
          ...match,
          messages: updatedMessages,
          lastMessage: newMessage,
        };
      }
      return match;
    }));
  }, []);

  const markMessagesAsRead = useCallback((matchId: string) => {
    setMatches(prev => prev.map(match => {
      if (match.id === matchId) {
        // Only update if there are actually unread messages
        const hasUnreadMessages = match.messages.some(msg => !msg.read && msg.senderId !== 0);
        if (!hasUnreadMessages) {
          return match; // No changes needed
        }
        
        const updatedMessages = match.messages.map(msg => ({
          ...msg,
          read: msg.senderId !== 0 ? true : msg.read, // Only mark received messages as read
        }));
        return {
          ...match,
          messages: updatedMessages,
        };
      }
      return match;
    }));
  }, []);

  const value = {
    likedProfiles,
    matches,
    addLikedProfile,
    removeLikedProfile,
    isProfileLiked,
    checkForMatch,
    sendMessage,
    markMessagesAsRead,
  };

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
};
import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLikes, User } from '@/contexts/LikesContext';
import { LikePopup } from '@/components/LikePopup';
import { MatchPopup } from '@/components/MatchPopup';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const generateMockUsers = (): User[] => [
  { id: 1, name: 'Alex', age: 25, bio: 'Love hiking and coffee dates', image: require('@/assets/images/react-logo.png') },
  { id: 2, name: 'Sam', age: 28, bio: 'Photographer and dog lover', image: require('@/assets/images/react-logo.png') },
  { id: 3, name: 'Jordan', age: 24, bio: 'Yoga instructor and foodie', image: require('@/assets/images/react-logo.png') },
  { id: 4, name: 'Casey', age: 30, bio: 'Travel enthusiast', image: require('@/assets/images/react-logo.png') },
  { id: 5, name: 'Morgan', age: 26, bio: 'Artist and music lover', image: require('@/assets/images/react-logo.png') },
  { id: 6, name: 'Riley', age: 29, bio: 'Chef and wine connoisseur', image: require('@/assets/images/react-logo.png') },
  { id: 7, name: 'Avery', age: 27, bio: 'Fitness trainer', image: require('@/assets/images/react-logo.png') },
  { id: 8, name: 'Blake', age: 31, bio: 'Software engineer', image: require('@/assets/images/react-logo.png') },
  { id: 9, name: 'Drew', age: 23, bio: 'Student and part-time model', image: require('@/assets/images/react-logo.png') },
  { id: 10, name: 'Parker', age: 32, bio: 'Entrepreneur', image: require('@/assets/images/react-logo.png') },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { addLikedProfile, checkForMatch } = useLikes();
  const [users, setUsers] = useState(generateMockUsers());
  const [passedUsers, setPassedUsers] = useState<Set<number>>(new Set());
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [likedUserName, setLikedUserName] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  const handleRefresh = () => {
    setUsers(generateMockUsers());
    setPassedUsers(new Set());
    setCurrentProfileIndex(0);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePass = (userId: number) => {
    setPassedUsers(prev => new Set([...prev, userId]));
    const filteredUsers = users.filter(user => !passedUsers.has(user.id) && user.id !== userId);
    if (currentProfileIndex < filteredUsers.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    }
  };

  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      if (scrollDirection.current !== 'down') {
        scrollDirection.current = 'down';
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            transform: [{ translateY: 100 }],
            transition: 'transform 0.3s ease',
          },
        });
      }
    } else if (currentScrollY < lastScrollY.current) {
      if (scrollDirection.current !== 'up') {
        scrollDirection.current = 'up';
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            transform: [{ translateY: 0 }],
            transition: 'transform 0.3s ease',
          },
        });
      }
    }
    lastScrollY.current = currentScrollY;
  }, [navigation]);

  const handleLike = (user: User) => {
    addLikedProfile(user);
    
    // Check if this creates a match
    if (checkForMatch(user)) {
      setMatchedUser(user);
      setShowMatchPopup(true);
    } else {
      setLikedUserName(user.name);
      setShowPopup(true);
    }
    
    handlePass(user.id); // Also move to next profile
  };

  const handleSendMessage = () => {
    setShowMatchPopup(false);
    // Switch to matches tab
    router.push('/(tabs)/matches');
  };

  const filteredUsers = users.filter(user => !passedUsers.has(user.id));
  const currentUser = filteredUsers[currentProfileIndex];

  const UserCard = ({ user }: { user: User }) => (
    <ThemedView style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={user.image} style={styles.cardImage} />
        {/* Like button overlay on image */}
        <TouchableOpacity
          style={[styles.likeButtonOverlay, { backgroundColor: Colors[colorScheme ?? 'light'].pastelGreen }]}
          onPress={() => handleLike(user)}
        >
          <IconSymbol name="heart.fill" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardName}>
          {user.name}, {user.age}
        </ThemedText>
        <ThemedText style={styles.cardBio}>
          {user.bio}
        </ThemedText>
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <ThemedView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              Discover
            </ThemedText>
          </View>
          {currentUser ? (
            <UserCard user={currentUser} />
          ) : (
            <ThemedView style={styles.endMessage}>
              <ThemedText style={styles.endMessageText}>
                No more profiles!
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Floating pass button at bottom left */}
        {currentUser && (
          <TouchableOpacity
            style={[styles.passButtonFixed, { backgroundColor: '#ff4458', left: 20, right: undefined }]}
            onPress={() => handlePass(currentUser.id)}
          >
            <ThemedText style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>✕</ThemedText>
          </TouchableOpacity>
        )}
        
        {/* Like popup notification */}
        <LikePopup 
          userName={likedUserName}
          visible={showPopup}
          onHide={() => setShowPopup(false)}
        />
        
        {/* Match popup notification */}
        <MatchPopup
          userName={matchedUser?.name || ''}
          visible={showMatchPopup}
          onHide={() => setShowMatchPopup(false)}
          onSendMessage={handleSendMessage}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 10,       // Added top padding for better spacing
    paddingBottom: 15,    // Added bottom padding
    marginTop: 0,         // Keep at 0 to avoid double buffer
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 34,      // Added line height to prevent text cropping
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  likeButtonOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardBio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  endMessage: {
    padding: 32,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  passButtonFixed: {
    position: 'absolute',
    bottom: 30,
    left: 20,            // Changed from right: 20 to left: 20
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
});
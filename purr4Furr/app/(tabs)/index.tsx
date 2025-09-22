import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDating } from '@/contexts/DatingContext';
import { useAuth } from '@/contexts/AuthContext';
import { DatingProfile } from '@/lib/datingService';
import { LikePopup } from '@/components/LikePopup';
import { MatchPopup } from '@/components/MatchPopup';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { session } = useAuth();
  const { userFeed, loadingFeed, refreshFeed, likeUser, passUser } = useDating();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [likedUserName, setLikedUserName] = useState('');
  const [matchedUser, setMatchedUser] = useState<DatingProfile | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  // Load feed on component mount
  useEffect(() => {
    if (session) {
      console.log('Discover: Component mounted, refreshing feed...');
      refreshFeed();
    }
  }, [session]);

  // Debug effect to monitor userFeed changes
  useEffect(() => {
    console.log('Discover: userFeed updated, length:', userFeed.length);
    console.log('Discover: loadingFeed:', loadingFeed);
    console.log('Discover: currentProfileIndex:', currentProfileIndex);
  }, [userFeed, loadingFeed, currentProfileIndex]);

  const handleRefresh = () => {
    if (!session) {
      console.log('No session available for refresh');
      return;
    }
    setCurrentProfileIndex(0);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    refreshFeed();
  };

  const handlePass = async (userId: string) => {
    try {
      await passUser(userId);
      // Move to next profile
      if (currentProfileIndex < userFeed.length - 1) {
        setCurrentProfileIndex(prev => prev + 1);
      }
    } catch (error) {
      logger.error('Error passing user', error);
      Alert.alert('Error', 'Failed to pass user. Please try again.');
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

  const handleLike = async (user: DatingProfile) => {
    try {
      const isMatch = await likeUser(user.id);
      
      if (isMatch) {
        setMatchedUser(user);
        setShowMatchPopup(true);
      } else {
        setLikedUserName(user.display_name || user.first_name);
        setShowPopup(true);
      }
      
      // Move to next profile
      if (currentProfileIndex < userFeed.length - 1) {
        setCurrentProfileIndex(prev => prev + 1);
      }
    } catch (error) {
      logger.error('Error liking user', error);
      Alert.alert('Error', 'Failed to like user. Please try again.');
    }
  };

  const handleSendMessage = () => {
    setShowMatchPopup(false);
    // Switch to matches tab
    router.push('/(tabs)/matches');
  };

  const currentUser = userFeed[currentProfileIndex];

  const formatInterests = (interests: string[] | string | null) => {
    if (!interests) return [];
    if (typeof interests === 'string') {
      try {
        return JSON.parse(interests);
      } catch {
        return interests.split(',').map(i => i.trim());
      }
    }
    return interests;
  };

  const UserCard = ({ user }: { user: DatingProfile }) => (
    <ThemedView style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={
            user.profile_picture 
              ? { uri: user.profile_picture }
              : require('@/assets/images/furry1.jpg')
          } 
          style={styles.cardImage} 
        />
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
          {user.display_name || user.first_name}, {user.age}
        </ThemedText>
        <ThemedText style={styles.cardBio}>
          {user.bio || 'No bio provided'}
        </ThemedText>
        
        {/* Additional profile info */}
        <View style={styles.profileDetails}>
          {user.gender && (
            <View style={styles.detailTag}>
              <ThemedText style={styles.detailText}>{user.gender}</ThemedText>
            </View>
          )}
          {user.fursona && (
            <View style={styles.detailTag}>
              <ThemedText style={styles.detailText}>{user.fursona}</ThemedText>
            </View>
          )}
          {user.location_city && (
            <View style={styles.detailTag}>
              <ThemedText style={styles.detailText}>{user.location_city}</ThemedText>
            </View>
          )}
        </View>

        {/* Interests */}
        {formatInterests(user.interests).length > 0 && (
          <View style={styles.interestsContainer}>
            {formatInterests(user.interests).slice(0, 3).map((interest: string, index: number) => (
              <View key={index} style={[styles.interestTag, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                <ThemedText style={styles.interestText}>{interest}</ThemedText>
              </View>
            ))}
            {formatInterests(user.interests).length > 3 && (
              <ThemedText style={styles.moreInterests}>
                +{formatInterests(user.interests).length - 3} more
              </ThemedText>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );

  if (loadingFeed && userFeed.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        <ThemedView style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Finding amazing people near you...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <IconSymbol name="arrow.clockwise" size={20} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
          </View>
          
          {currentUser ? (
            <UserCard user={currentUser} />
          ) : userFeed.length === 0 && !loadingFeed ? (
            <ThemedView style={styles.endMessage}>
              <IconSymbol name="heart" size={64} color={Colors[colorScheme ?? 'light'].icon} />
              <ThemedText style={styles.endMessageText}>
                No profiles available
              </ThemedText>
              <ThemedText style={styles.endMessageSubtext}>
                There might be no users in the database yet, or they may all be inactive.
              </ThemedText>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshEndButton}>
                <ThemedText style={styles.refreshEndText}>Refresh</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView style={styles.endMessage}>
              <IconSymbol name="heart" size={64} color={Colors[colorScheme ?? 'light'].icon} />
              <ThemedText style={styles.endMessageText}>
                No more profiles!
              </ThemedText>
              <ThemedText style={styles.endMessageSubtext}>
                Check back later for new people in your area.
              </ThemedText>
              <TouchableOpacity onPress={handleRefresh} style={styles.refreshEndButton}>
                <ThemedText style={styles.refreshEndText}>Refresh</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ScrollView>

        {/* Floating pass button at bottom left */}
        {currentUser && (
          <TouchableOpacity
            style={[styles.passButtonFixed, { backgroundColor: '#ff4458' }]}
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
          userName={matchedUser?.display_name || matchedUser?.first_name || ''}
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
    paddingTop: 10,
    paddingBottom: 15,
    marginTop: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 34,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
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
    marginBottom: 16,
  },
  profileDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  detailTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  moreInterests: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    color: '#666',
  },
  endMessage: {
    padding: 32,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 16,
  },
  endMessageSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
  },
  refreshEndButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshEndText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  passButtonFixed: {
    position: 'absolute',
    bottom: 30,
    left: 20,
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
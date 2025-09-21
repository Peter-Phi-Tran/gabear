import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const generateMockUsers = () => [
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
  const [users, setUsers] = useState(generateMockUsers());
  const [passedUsers, setPassedUsers] = useState<Set<number>>(new Set());
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
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

  const filteredUsers = users.filter(user => !passedUsers.has(user.id));
  const currentUser = filteredUsers[currentProfileIndex];

  const UserCard = ({ user }: { user: any }) => (
    <ThemedView style={styles.card}>
      <Image source={user.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardName}>
          {user.name}, {user.age}
        </ThemedText>
        <ThemedText style={styles.cardBio}>
          {user.bio}
        </ThemedText>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].pastelGreen }]}
            onPress={() => console.log('Like', user.name)}
          >
            <IconSymbol name="heart.fill" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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

        {/* Floating pass button at bottom right */}
        {currentUser && (
          <TouchableOpacity
            style={[styles.passButtonFixed, { backgroundColor: '#ff4458', right: 20, left: undefined }]}
            onPress={() => handlePass(currentUser.id)}
          >
            <ThemedText style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>✕</ThemedText>
          </TouchableOpacity>
        )}
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
    paddingVertical: 15,
    marginTop: 0,         // was 15; set to 0 to avoid double buffer
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    // No extra padding/margin here
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
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    right: 20,
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

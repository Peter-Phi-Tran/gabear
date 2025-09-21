import React from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLikes } from '@/contexts/LikesContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LikesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { likedProfiles, removeLikedProfile } = useLikes();

  const LikedProfileCard = ({ user }: { user: any }) => (
    <ThemedView style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={user.image} style={styles.cardImage} />
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: '#ff4458' }]}
          onPress={() => removeLikedProfile(user.id)}
        >
          <IconSymbol name="xmark" size={20} color="#fff" />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ThemedView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              Likes
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {likedProfiles.length} {likedProfiles.length === 1 ? 'profile' : 'profiles'} liked
            </ThemedText>
          </View>

          {/* Liked Profiles */}
          {likedProfiles.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <IconSymbol name="heart" size={64} color={Colors[theme].icon} />
              <ThemedText style={styles.emptyStateTitle}>No likes yet</ThemedText>
              <ThemedText style={styles.emptyStateSubtitle}>
                Start exploring profiles to find your matches!
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.profilesContainer}>
              {likedProfiles.map((user) => (
                <LikedProfileCard key={user.id} user={user} />
              ))}
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    marginTop: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  profilesContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
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
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  cardBio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
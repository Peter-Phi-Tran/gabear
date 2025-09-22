import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDating } from '@/contexts/DatingContext';
import { DatingMatch } from '@/lib/datingService';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { matches, refreshMatches } = useDating();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    refreshMatches();
  }, []);

  // Get fresh match data from context based on selected ID
  const selectedMatch = selectedMatchId ? matches.find((m: DatingMatch) => m.match_id === selectedMatchId) || null : null;

  const openChat = (match: DatingMatch) => {
    setSelectedMatchId(match.match_id);
    setShowChatModal(true);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const MatchCard = ({ match }: { match: DatingMatch }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => openChat(match)}
    >
      <View style={styles.matchImageContainer}>
        <Image 
          source={
            match.profile_picture 
              ? { uri: match.profile_picture }
              : require('@/assets/images/furry2.jpg')
          } 
          style={styles.matchImage} 
        />
        {match.unread_count > 0 && <View style={styles.unreadIndicator} />}
      </View>
      
      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <ThemedText style={styles.matchName}>
            {match.display_name || match.first_name}
          </ThemedText>
          {match.last_message_time && (
            <ThemedText style={styles.matchTime}>
              {formatLastMessageTime(match.last_message_time)}
            </ThemedText>
          )}
        </View>
        
        <ThemedText style={styles.matchLastMessage} numberOfLines={1}>
          {match.last_message_content || 'You matched! Say hello 👋'}
        </ThemedText>
      </View>
      
      <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
    </TouchableOpacity>
  );

  const NewMatchCard = ({ match }: { match: DatingMatch }) => (
    <TouchableOpacity
      style={styles.newMatchCard}
      onPress={() => openChat(match)}
    >
      <View style={styles.newMatchImageContainer}>
        <Image 
          source={
            match.profile_picture 
              ? { uri: match.profile_picture }
              : require('@/assets/images/furry1.jpg')
          } 
          style={styles.newMatchImage} 
        />
        <View style={styles.newMatchBadge}>
          <IconSymbol name="heart.fill" size={12} color="#fff" />
        </View>
      </View>
      <ThemedText style={styles.newMatchName} numberOfLines={1}>
        {match.display_name || match.first_name}
      </ThemedText>
    </TouchableOpacity>
  );

  const newMatches = matches.filter((match: DatingMatch) => !match.last_message_content);
  const activeMatches = matches.filter((match: DatingMatch) => match.last_message_content);

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
              Matches
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </ThemedText>
          </View>

          {matches.length === 0 ? (
            /* Empty State */
            <ThemedView style={styles.emptyState}>
              <IconSymbol name="person.2.fill" size={64} color={Colors[theme].icon} />
              <ThemedText style={styles.emptyStateTitle}>No matches yet</ThemedText>
              <ThemedText style={styles.emptyStateSubtitle}>
                When you and someone else like each other, you'll see them here!
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {/* New Matches Section */}
              {newMatches.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>New Matches</ThemedText>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.newMatchesContainer}
                  >
                    {newMatches.slice(0, 5).map((match: DatingMatch) => (
                      <NewMatchCard key={match.match_id} match={match} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Messages Section */}
              {activeMatches.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Messages</ThemedText>
                  <View style={styles.messagesContainer}>
                    {activeMatches
                      .sort((a: DatingMatch, b: DatingMatch) => {
                        const aTime = new Date(a.last_message_time || a.matched_at).getTime();
                        const bTime = new Date(b.last_message_time || b.matched_at).getTime();
                        return bTime - aTime;
                      })
                      .map((match: DatingMatch) => (
                        <MatchCard key={match.match_id} match={match} />
                      ))}
                  </View>
                </View>
              )}

              {/* All Matches if no separation needed */}
              {newMatches.length === 0 && activeMatches.length === 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>All Matches</ThemedText>
                  <View style={styles.messagesContainer}>
                    {matches
                      .sort((a: DatingMatch, b: DatingMatch) => {
                        const aTime = new Date(a.matched_at).getTime();
                        const bTime = new Date(b.matched_at).getTime();
                        return bTime - aTime;
                      })
                      .map((match: DatingMatch) => (
                        <MatchCard key={match.match_id} match={match} />
                      ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
        
        {/* Chat Modal - Need to create a simpler version */}
        {showChatModal && selectedMatch && (
          <ThemedView style={styles.chatPlaceholder}>
            <ThemedText style={styles.chatPlaceholderText}>
              Chat with {selectedMatch.display_name || selectedMatch.first_name}
            </ThemedText>
            <ThemedText style={styles.chatPlaceholderSubtext}>
              Chat functionality coming soon!
            </ThemedText>
            <TouchableOpacity
              style={styles.chatCloseButton}
              onPress={() => {
                setShowChatModal(false);
                setSelectedMatchId(null);
              }}
            >
              <ThemedText style={styles.chatCloseText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  newMatchesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  newMatchCard: {
    alignItems: 'center',
    width: 80,
  },
  newMatchImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  newMatchImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
  },
  newMatchBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff6b9d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  newMatchName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesContainer: {
    gap: 0,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  matchImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  matchImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff6b9d',
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchInfo: {
    flex: 1,
    marginRight: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  matchLastMessage: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
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
    lineHeight: 22,
  },
  chatPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  chatPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  chatPlaceholderSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  chatCloseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  chatCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
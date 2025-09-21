import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLikes, Match } from '@/contexts/LikesContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatModal } from '@/components/ChatModal';

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { matches } = useLikes();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Get fresh match data from context based on selected ID
  const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) || null : null;

  const openChat = (match: Match) => {
    setSelectedMatchId(match.id);
    setShowChatModal(true);
  };

  const formatLastMessageTime = (date: Date) => {
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

  const MatchCard = ({ match }: { match: Match }) => {
    const hasUnreadMessages = match.messages.some(msg => !msg.read && msg.senderId !== 0);
    
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => openChat(match)}
      >
        <View style={styles.matchImageContainer}>
          <Image source={match.user.image} style={styles.matchImage} />
          {hasUnreadMessages && <View style={styles.unreadIndicator} />}
        </View>
        
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <ThemedText style={styles.matchName}>{match.user.name}</ThemedText>
            {match.lastMessage && (
              <ThemedText style={styles.matchTime}>
                {formatLastMessageTime(match.lastMessage.timestamp)}
              </ThemedText>
            )}
          </View>
          
          <ThemedText style={styles.matchLastMessage} numberOfLines={1}>
            {match.lastMessage 
              ? match.lastMessage.text 
              : `You matched with ${match.user.name}! Say hello 👋`
            }
          </ThemedText>
        </View>
        
        <IconSymbol name="chevron.right" size={16} color={Colors[theme].icon} />
      </TouchableOpacity>
    );
  };

  const NewMatchCard = ({ match }: { match: Match }) => (
    <TouchableOpacity
      style={styles.newMatchCard}
      onPress={() => openChat(match)}
    >
      <View style={styles.newMatchImageContainer}>
        <Image source={match.user.image} style={styles.newMatchImage} />
        <View style={styles.newMatchBadge}>
          <IconSymbol name="heart.fill" size={12} color="#fff" />
        </View>
      </View>
      <ThemedText style={styles.newMatchName} numberOfLines={1}>
        {match.user.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const newMatches = matches.filter(match => match.messages.length === 0);
  const activeMatches = matches.filter(match => match.messages.length > 0);

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
                    {newMatches.map((match) => (
                      <NewMatchCard key={match.id} match={match} />
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
                      .sort((a, b) => {
                        const aTime = a.lastMessage?.timestamp.getTime() || a.matchedAt.getTime();
                        const bTime = b.lastMessage?.timestamp.getTime() || b.matchedAt.getTime();
                        return bTime - aTime;
                      })
                      .map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
        
        {/* Chat Modal */}
        <ChatModal
          visible={showChatModal}
          match={selectedMatch}
          onClose={() => {
            setShowChatModal(false);
            setSelectedMatchId(null);
          }}
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
});
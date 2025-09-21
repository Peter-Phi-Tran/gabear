import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLikes, Match, Message } from '@/contexts/LikesContext';

interface ChatModalProps {
  visible: boolean;
  match: Match | null;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ visible, match, onClose }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { sendMessage, markMessagesAsRead } = useLikes();
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && match) {
      // Only mark as read if there are unread messages
      const hasUnreadMessages = match.messages.some(msg => !msg.read && msg.senderId !== 0);
      if (hasUnreadMessages) {
        markMessagesAsRead(match.id);
      }
    }
  }, [visible, match?.id, markMessagesAsRead]);

  // Separate effect for scrolling to avoid conflicts
  useEffect(() => {
    if (visible && match && scrollViewRef.current) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, match?.messages?.length]); // Only depend on message count

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        // Scroll to bottom when keyboard opens with more delay
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() && match) {
      sendMessage(match.id, inputText.trim());
      setInputText('');
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[
        styles.messageBubble, 
        isOwn 
          ? { backgroundColor: Colors[theme].tint } 
          : { backgroundColor: Colors[theme].icon + '20' }
      ]}>
        <ThemedText style={[
          styles.messageText,
          isOwn ? { color: Colors[theme].background } : { color: Colors[theme].text }
        ]}>
          {message.text}
        </ThemedText>
      </View>
      <ThemedText style={[
        styles.messageTime,
        isOwn ? styles.ownMessageTime : styles.otherMessageTime
      ]}>
        {formatMessageTime(message.timestamp)}
      </ThemedText>
    </View>
  );

  if (!match) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: Colors[theme].icon + '20' }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{match.user.name}</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {match.messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <ThemedText style={styles.emptyChatText}>
                  You matched with {match.user.name}!
                </ThemedText>
                <ThemedText style={styles.emptyChatSubtext}>
                  Start the conversation and say hello 👋
                </ThemedText>
              </View>
            ) : (
              match.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === 0} // 0 is current user
                />
              ))
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputContainer, { 
            borderTopColor: Colors[theme].icon + '20',
            backgroundColor: Colors[theme].background
          }]}>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: Colors[theme].icon + '10',
                  color: Colors[theme].text
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={Colors[theme].icon}
              multiline
              maxLength={500}
              onFocus={() => {
                // Scroll to bottom when input is focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: inputText.trim() ? Colors[theme].tint : Colors[theme].icon + '40',
                }
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <IconSymbol 
                name="arrow.up" 
                size={20} 
                color={inputText.trim() ? Colors[theme].background : Colors[theme].icon} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyChatSubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  ownMessageTime: {
    textAlign: 'right',
  },
  otherMessageTime: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 20,
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    minHeight: 60,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
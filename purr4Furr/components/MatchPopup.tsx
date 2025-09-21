import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface MatchPopupProps {
  userName: string;
  visible: boolean;
  onHide: () => void;
  onSendMessage: () => void;
}

export const MatchPopup: React.FC<MatchPopupProps> = ({ userName, visible, onHide, onSendMessage }) => {
  const colorScheme = useColorScheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Scale up and fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const hidePopup = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <ThemedView style={[styles.popup, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.heartsContainer}>
            <IconSymbol name="heart.fill" size={40} color={Colors[colorScheme ?? 'light'].pastelGreen} />
            <IconSymbol name="heart.fill" size={40} color="#ff6b9d" />
          </View>
          
          <ThemedText style={styles.matchTitle}>It's a Match!</ThemedText>
          <ThemedText style={styles.matchSubtitle}>
            You and {userName} liked each other
          </ThemedText>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.messageButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={onSendMessage}
            >
              <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                Send Message
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={hidePopup}
            >
              <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Keep Swiping
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    width: '85%',
    maxWidth: 320,
  },
  popup: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  messageButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import React from 'react';
import { StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Collapsible } from '@/components/ui/collapsible';

export default function HelpSecurityScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact our support team:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@purr4furr.com?subject=Purr4Furr Support Request')
        },
        { 
          text: 'Report Bug', 
          onPress: () => Linking.openURL('mailto:bugs@purr4furr.com?subject=Bug Report')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to permanently delete your account and all associated data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Please contact support at support@purr4furr.com to request account deletion. We will process your request within 24-48 hours.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Help & Security</ThemedText>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Help Section */}
          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Getting Started">
              <ThemedText style={styles.sectionText}>
                Welcome to Purr4Furr! Here's how to get started:
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>• Complete your profile survey to help others find you</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Browse other users in the main feed</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Like profiles you're interested in</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Check your matches to see mutual likes</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Update your profile anytime from the Profile tab</ThemedText>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Privacy & Safety">
              <ThemedText style={styles.sectionText}>
                Your safety and privacy are our top priorities:
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>• Your profile is only visible to other verified users</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Report inappropriate behavior immediately</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Block users who make you uncomfortable</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Never share personal information like addresses or financial details</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Meet in public places for initial meetups</ThemedText>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Community Guidelines">
              <ThemedText style={styles.sectionText}>
                To maintain a positive community for everyone:
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>• Be respectful and kind to all users</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Use recent and accurate photos</ThemedText>
              <ThemedText style={styles.bulletPoint}>• No harassment, hate speech, or discrimination</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Keep conversations appropriate and consensual</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Report users who violate these guidelines</ThemedText>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Technical Support">
              <ThemedText style={styles.sectionText}>
                Having technical issues? Try these solutions:
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>• Close and restart the app</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Check your internet connection</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Update to the latest app version</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Clear app cache in device settings</ThemedText>
              <ThemedText style={styles.bulletPoint}>• Contact support if issues persist</ThemedText>
            </Collapsible>
          </ThemedView>

          {/* Action Buttons */}
          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.actionButton, { borderColor: Colors[theme].tint }]}
              onPress={handleContactSupport}
            >
              <IconSymbol name="envelope" size={20} color={Colors[theme].tint} />
              <ThemedText style={[styles.actionButtonText, { color: Colors[theme].tint }]}>
                Contact Support
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.actionButton, { borderColor: Colors[theme].tint }]}
              onPress={() => Linking.openURL('https://purr4furr.com/privacy')}
            >
              <IconSymbol name="doc.text" size={20} color={Colors[theme].tint} />
              <ThemedText style={[styles.actionButtonText, { color: Colors[theme].tint }]}>
                Privacy Policy
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.actionButton, { borderColor: Colors[theme].tint }]}
              onPress={() => Linking.openURL('https://purr4furr.com/terms')}
            >
              <IconSymbol name="doc.text" size={20} color={Colors[theme].tint} />
              <ThemedText style={[styles.actionButtonText, { color: Colors[theme].tint }]}>
                Terms of Service
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Danger Zone */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedText style={styles.dangerSectionTitle}>Danger Zone</ThemedText>
            <Pressable 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleDeleteAccount}
            >
              <IconSymbol name="trash" size={20} color="#dc3545" />
              <ThemedText style={[styles.actionButtonText, { color: '#dc3545' }]}>
                Delete Account
              </ThemedText>
            </Pressable>
            <ThemedText style={styles.dangerText}>
              This action cannot be undone. All your data will be permanently deleted.
            </ThemedText>
          </ThemedView>

          {/* App Info */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedText style={styles.appInfo}>
              Purr4Furr v1.0.0{'\n'}
              © 2025 Purr4Furr. All rights reserved.{'\n'}
              Made with ❤️ for the furry community
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
  },
  dangerButton: {
    borderColor: '#dc3545',
  },
  dangerText: {
    fontSize: 12,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  appInfo: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 16,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Collapsible } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available for profile fetch');
        Alert.alert('Error', 'User session not found. Please log in again.');
        return;
      }
      
      console.log('Fetching profile for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile fetch error details:', error);
        
        if (error.code === 'PGRST116') {
          // No profile found - redirect to create profile
          console.log('No profile found for user, redirecting to create profile');
          router.push('/auth/createAccount');
        } else {
          logger.error('Error fetching profile', error);
          Alert.alert('Error', 'Failed to load profile data. Please try refreshing.');
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      logger.error('Unexpected error fetching profile', error);
      console.log('Unexpected profile fetch error:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your profile.');
    } finally {
      setLoading(false);
    }
  };

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

  const getDisplayName = () => {
    return profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'User';
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Profile: Starting sign out process...');
              await signOut();
              console.log('Profile: Sign out completed');
            } catch (error) {
              logger.error('Profile: Error during sign out process', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <ThemedView style={[styles.outerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
          <ThemedText style={{ marginTop: 16 }}>Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ThemedView style={styles.outerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section to match index spacing */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              Profile
            </ThemedText>
          </View>
          
          {/* Profile Card Section */}
          <ThemedView style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View>
                <ThemedText type="title" style={styles.profileName}>
                  {getDisplayName()}
                </ThemedText>
                <ThemedText style={styles.profileStatus}>
                  {profile?.pronouns || 'Active'}
                </ThemedText>
              </View>
            </View>
            <Image
              source={profile?.profile_picture ? { uri: profile.profile_picture } : require('@/assets/images/purr4furr-high-resolution-logo.png')}
              style={styles.profileImage}
              contentFit="cover"
            />
          </ThemedView>

          {/* Dynamic Information Sections */}
          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="My Profile Info">
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Gender:</ThemedText>
                <ThemedText>{profile?.gender || 'Not specified'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Age:</ThemedText>
                <ThemedText>{profile?.age ? `${profile.age} years old` : 'Not specified'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Height:</ThemedText>
                <ThemedText>{profile?.height || 'Not specified'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Ethnicity:</ThemedText>
                <ThemedText>{profile?.ethnicity || 'Not specified'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Sexual Attraction:</ThemedText>
                <ThemedText>{profile?.sexuality || 'Not specified'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Fursona:</ThemedText>
                <ThemedText>{profile?.fursona || 'Not specified'}</ThemedText>
              </View>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Interests">
              <View style={styles.interestsContainer}>
                {formatInterests(profile?.interests).map((interest: string, index: number) => (
                  <View key={index} style={[styles.interestTag, { backgroundColor: Colors[theme].tint }]}>
                    <ThemedText style={{ color: Colors[theme].background }}>{interest}</ThemedText>
                  </View>
                ))}
                {formatInterests(profile?.interests).length === 0 && (
                  <ThemedText style={{ opacity: 0.6 }}>No interests specified</ThemedText>
                )}
              </View>
            </Collapsible>
          </ThemedView>

          {/* General App Info Sections */}
          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.editButton, { borderColor: Colors[theme].tint }]}
              onPress={() => {
                Alert.alert(
                  'Update Profile',
                  'This will take you to the profile survey to update your information.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Update', 
                      onPress: () => {
                        try {
                          router.push('/auth/survey');
                        } catch (error) {
                          logger.error('Navigation error to survey', error);
                          Alert.alert('Error', 'Unable to open profile editor. Please try again.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <ThemedText style={[styles.editButtonText, { color: Colors[theme].tint }]}>Update Profile Info</ThemedText>
            </Pressable>
          </ThemedView>
          
          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.editButton, { borderColor: Colors[theme].tint }]}
              onPress={() => router.push('/helpSecurity' as any)}
            >
              <ThemedText style={[styles.editButtonText, { color: Colors[theme].tint }]}>Help and Security</ThemedText>
            </Pressable>
          </ThemedView>
          {/* Log out*/}
          <ThemedView style={styles.sectionContainer}>
            <Pressable style={styles.logoutButton} onPress={handleSignOut}>
              <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 16,
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
  profileCard: {
    padding: 24,
    marginHorizontal: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileStatus: {
    fontSize: 14,
    opacity: 0.6,
  },
  editIconContainer: {
    padding: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 14,
    marginTop: -8,
  },
  editButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  editButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestTag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButton:{
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#a93535ff',
    borderWidth: 0,
  },
  logoutButtonText:{
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
});
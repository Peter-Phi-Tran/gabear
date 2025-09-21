import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, ScrollView, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Collapsible } from '@/components/ui/collapsible';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  // Placeholder data for the user profile
  const user = {
    user: 'Peter',
    profile_photos: require('@/assets/images/FurryPeter.jpg'),
    profile_info: {
        
        gender: 'Gayman',
        location: 'Arlington, TX',
        height: '5\'10"',
        birthday: "9/11/2004",
        sexual_orientation: "Gay",
        animal: "cow"
    },
    interests: ['Hiking', 'Coding', 'Art','Gooning'],
    
  };

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
                  {user.user}
                </ThemedText>
                <ThemedText style={styles.profileStatus}>Active</ThemedText>
              </View>
              <Pressable style={styles.editIconContainer}>
                <IconSymbol name="pencil" size={24} color={Colors[theme].text} />
              </Pressable>
            </View>
            <Image
              source={user.profile_photos}
              style={styles.profileImage}
              contentFit="cover"
            />
            <Pressable style={[styles.editButton, { borderColor: Colors[theme].tint }]}>
              <ThemedText style={[styles.editButtonText, { color: Colors[theme].tint }]}>Edit profile</ThemedText>
            </Pressable>
          </ThemedView>

          {/* Dynamic Information Sections */}
          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="My Profile Info">
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Gender:</ThemedText>
                <ThemedText>{user.profile_info.gender}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Location:</ThemedText>
                <ThemedText>{user.profile_info.location}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Height:</ThemedText>
                <ThemedText>{user.profile_info.height}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Birthdate:</ThemedText>
                <ThemedText>{user.profile_info.birthday}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Sexual Attraction:</ThemedText>
                <ThemedText>{user.profile_info.sexual_orientation}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText type="defaultSemiBold">Fursona:</ThemedText>
                <ThemedText>{user.profile_info.animal}</ThemedText>
              </View>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.sectionContainer}>
            <Collapsible title="Interests">
              <View style={styles.interestsContainer}>
                {user.interests.map((interest, index) => (
                  <View key={index} style={[styles.interestTag, { backgroundColor: Colors[theme].tint }]}>
                    <ThemedText style={{ color: Colors[theme].background }}>{interest}</ThemedText>
                  </View>
                ))}
              </View>
            </Collapsible>
          </ThemedView>

          {/* General App Info Sections */}
          <ThemedView style={styles.sectionContainer}>
            <Pressable 
              style={[styles.editButton, { borderColor: Colors[theme].tint }]}
              onPress={() => router.push('/auth/survey' as any)}
            >
              <ThemedText style={[styles.editButtonText, { color: Colors[theme].tint }]}>Update Profile Info</ThemedText>
            </Pressable>
          </ThemedView>
          
          <ThemedView style={styles.sectionContainer}>
            <Pressable style={[styles.editButton, { borderColor: Colors[theme].tint }]}>
              <ThemedText style={[styles.editButtonText, { color: Colors[theme].tint }]}>Help and Security</ThemedText>
            </Pressable>
          </ThemedView>
          {/* Log out*/}
          <ThemedView style={styles.sectionContainer}>
            <Pressable style={styles.logoutButton}>
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
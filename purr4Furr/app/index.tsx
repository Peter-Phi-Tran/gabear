import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Image, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const { session, loading, isSigningOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Landing: Auth state - loading:', loading, 'session:', !!session, 'isSigningOut:', isSigningOut);
    
    // Only redirect to tabs if we have a session and we're not in the middle of signing out
    if (!loading && session && !isSigningOut) {
      console.log('Landing: User has session and not signing out, navigating to tabs');
      router.replace('/(tabs)');
    } else if (!loading && !session) {
      console.log('Landing: No session, staying on landing page');
      // Ensure we're on the landing page (in case we were redirected here from logout)
      if (router.canGoBack()) {
        router.replace('/');
      }
    }
  }, [session, loading, isSigningOut, router]);

  // Show loading spinner while checking authentication or signing out
  if (loading || isSigningOut) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>
          {isSigningOut ? 'Signing out...' : 'Loading...'}
        </ThemedText>
      </ThemedView>
    );
  }

  // Show loading if we have a session but haven't redirected yet
  if (session && !isSigningOut) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Redirecting...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('@/assets/images/purr4furr-high-resolution-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ThemedText type="title" style={styles.appName}>
          Purr4Furr
        </ThemedText>
        <ThemedText style={styles.tagline}>
          Connect with fellow fursonas
        </ThemedText>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <Link href="/auth/login" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.loginButton,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }
            ]}
          >
            <ThemedText 
              style={[
                styles.buttonText, 
                styles.loginButtonText,
                { color: Colors[colorScheme ?? 'light'].tint }
                ]}
            >
              Login
            </ThemedText>
          </Pressable>
        </Link>

        <Link href="/auth/createAccount" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.createAccountButton,
              { 
                borderColor: Colors[colorScheme ?? 'light'].tint,
                borderWidth: 2,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }
            ]}
          >
            <ThemedText 
              style={[
                styles.buttonText,
                styles.createAccountButtonText,
                { color: Colors[colorScheme ?? 'light'].tint }
              ]}
            >
                Create Account
            </ThemedText>
          </Pressable>
        </Link>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Welcome to the community where you can find your mate or pack
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  centered: {
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 60,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginVertical: 4,
    width: 220,
  },
  loginButton: {
    borderColor: '#888'
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    borderColor: '#888',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loginButtonText: {
  },
  createAccountButtonText: {
    // color will be set dynamically based on theme
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },

});
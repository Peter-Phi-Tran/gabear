import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase'; // Back to real Supabase
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { mockSupabase } from '@/lib/mock-supabase'; // Mock disabled

export default function CreateAccountScreen() {
  const [email, setEmail] = useState('');
  const [ password, setPassword ] = useState('');
  const [confirmPassword, setConfirmPassword ] = useState('');
  const [ error, setError] = useState('');
  const colorScheme = useColorScheme();

  const onSignUpPress = () => {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return;
    }
  }


  const handleEmailSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    try {
      console.log('Attempting Supabase signup...');
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('User already registered')) {
          // Don't log this error - it's a normal user flow case
          Alert.alert(
            'Account Already Exists', 
            'An account with this email already exists. Would you like to sign in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign In', onPress: () => router.push('/auth/login') }
            ]
          );
        } else if (error.message.includes('Invalid email')) {
          console.error('Supabase error:', error);
          Alert.alert('Invalid Email', 'Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          console.error('Supabase error:', error);
          Alert.alert('Weak Password', 'Please choose a stronger password.');
        } else {
          console.error('Supabase error:', error);
          Alert.alert('Signup Failed', error.message || 'Unable to create account. Please try again.');
        }
      } else {
        console.log('Signup successful:', data);
        Alert.alert('Success', 'Account created! Please complete your profile.', [
          { text: 'OK', onPress: () => router.push('/auth/survey' as any) }
        ]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Connection Error', 'Unable to connect to our servers. Please check your internet connection and try again.');
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google sign-up logic
    Alert.alert('Google Sign Up', 'Signing up with Google');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol 
            name="chevron.left" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text || '#000'} 
          />
        </Pressable>

        <Text style={styles.title}>Purr4Furr</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter your password (min 8 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {password.length > 0 && password.length < 8 && (
        <Text style={styles.errorText}>Password must be at least 8 characters</Text>
      )}
      
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <Pressable 
        style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].pastelGreen }
        ]} 
        onPress={handleEmailSignup}
      >
        <Text style={styles.buttonText}>Sign Up with Email</Text>
      </Pressable>

      <Text style={styles.or}>OR</Text>

      <Pressable 
        style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].pastelBlue }
        ]} 
        onPress={handleGoogleSignup}
      >
        <Text style={styles.buttonText}>Sign Up with Google</Text>
      </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  or: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    color: '#888',
  },
  linkText: {
    color: '#4F46E5',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
  },
});
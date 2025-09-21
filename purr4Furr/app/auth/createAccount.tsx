import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase'

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
    // TODO: Implement email sign-up logic
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Account made!');
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google sign-up logic
    Alert.alert('Google Sign Up', 'Signing up with Google');
  };

  return (
    <View style={styles.container}>
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
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
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
});
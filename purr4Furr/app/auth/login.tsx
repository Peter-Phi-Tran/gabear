import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const colorScheme = useColorScheme();
    const router = useRouter();

    const handleEmailLogin = () => {
        // TODO: Implement email authentication logic
        Alert.alert('Email Login', `Logging in with email: ${email}`);
        router.replace('/(tabs)');
    };

    const handleGoogleLogin = () => {
    // TODO: Implement Google authentication logic
    Alert.alert('Google Login', 'Logging in with Google');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purr4Furr</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
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
      
      <Pressable 
        style={[
          styles.button, 
          { backgroundColor: Colors[colorScheme ?? 'light'].pastelGreen }
        ]} 
        onPress={handleEmailLogin}
      >
        <Text style={styles.buttonText}>Login with Email</Text>
      </Pressable>

      <Text style={styles.or}>OR</Text>

      <Pressable 
        style={[
          styles.button, 
          { backgroundColor: Colors[colorScheme ?? 'light'].pastelBlue }
        ]} 
        onPress={handleGoogleLogin}
      >
        <Text style={styles.buttonText}>Login with Google</Text>
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
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
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
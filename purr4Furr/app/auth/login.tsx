import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const colorScheme = useColorScheme();
    const router = useRouter();

    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting Supabase login...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                console.error('Login error:', error);
                
                // Handle specific login errors
                if (error.message.includes('Invalid login credentials')) {
                    Alert.alert('Login Failed', 'Invalid email or password. Please check your credentials and try again.');
                } else if (error.message.includes('Email not confirmed')) {
                    Alert.alert('Email Not Verified', 'Please check your email and click the verification link before logging in.');
                } else {
                    Alert.alert('Login Failed', error.message || 'Unable to log in. Please try again.');
                }
            } else {
                console.log('Login successful:', data);
                // For existing users logging in, go directly to main app
                // Profile completion check is only for new signups
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('Unexpected login error:', err);
            Alert.alert('Connection Error', 'Unable to connect to our servers. Please check your internet connection and try again.');
        }
    };

    const handleGoogleLogin = () => {
    // TODO: Implement Google authentication logic
    Alert.alert('Google Login', 'Logging in with Google');
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
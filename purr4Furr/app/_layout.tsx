import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LikesProvider } from '@/contexts/LikesContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DatingProvider } from '@/contexts/DatingContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <DatingProvider>
        <LikesProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen 
                name="index" 
                options={{ 
                  headerShown: false, 
                  title: 'Home'
                }} 
              />
              <Stack.Screen 
                name="auth" 
                options={{ 
                  title: 'Authorization',
                  headerShown: false 
                }}
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false  // Prevent swipe back to avoid navigation issues
                }} 
              />
              <Stack.Screen 
                name="helpSecurity" 
                options={{ 
                  headerShown: false,
                  title: 'Help & Security'
                }} 
              />
              <Stack.Screen 
                name="modal" 
                options={{ 
                  presentation: 'modal', 
                  title: 'Modal' 
                }} 
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </LikesProvider>
      </DatingProvider>
    </AuthProvider>
  );
}

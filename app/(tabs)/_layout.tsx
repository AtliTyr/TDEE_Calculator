import { Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  Calculator, 
  History as HistoryIcon, 
  User,
  LogIn
} from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false, // Убираем заголовки!
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      
      {/* Экран калькулятора */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Калькулятор',
          tabBarIcon: ({ color, size }) => (
            <Calculator size={size} color={color} />
          ),
        }}
      />
      
      {/* Экран истории */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'История',
          tabBarIcon: ({ color, size }) => (
            isAuthenticated ? (
              <HistoryIcon size={size} color={color} />
            ) : (
              <HistoryIcon size={size} color={color} opacity={0.5} />
            )
          ),
        }}
      />
      
      {/* Экран профиля/входа */}
      <Tabs.Screen
        name="profile"
        options={{
          title: isAuthenticated ? 'Профиль' : 'Войти',
          tabBarIcon: ({ color, size }) => (
            isAuthenticated ? (
              <User size={size} color={color} />
            ) : (
              <LogIn size={size} color={color} />
            )
          ),
        }}
      />
    </Tabs>
  );
}
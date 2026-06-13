import '../global.css';
import { useEffect, useState, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Home, AlertTriangle, ShieldAlert, Map as MapIcon, User, CloudRain, Compass } from 'lucide-react-native';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { useColorScheme } from 'nativewind';

function TabNavigator() {
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
        },
        tabBarActiveTintColor: '#ef4444', // red-500
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('alerts'),
          tabBarIcon: ({ color }) => <AlertTriangle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: t('sos'),
          tabBarIcon: ({ color }) => <ShieldAlert color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('map'),
          tabBarIcon: ({ color }) => <MapIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: t('weatherTab') || 'Weather',
          tabBarIcon: ({ color }) => <CloudRain color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="compass"
        options={{
          title: t('compass') || 'Compass',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen name="auth" options={{ href: null }} />
      <Tabs.Screen name="assistant" options={{ href: null }} />
      <Tabs.Screen name="guidelines" options={{ href: null }} />
      <Tabs.Screen name="incident-reports" options={{ href: null }} />

      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="checklist" options={{ href: null }} />
      <Tabs.Screen name="first-aid" options={{ href: null }} />
      <Tabs.Screen name="volunteer" options={{ href: null }} />
    </Tabs>
  );
}

import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

export default function TabLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <LanguageProvider>
        <TabNavigator />
      </LanguageProvider>
    </ClerkProvider>
  );
}

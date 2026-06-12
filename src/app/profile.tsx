import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, MapPin, Phone, Bell, FileText, Settings, HelpCircle, LogOut, Flashlight, Volume2, Moon, Sun } from 'lucide-react-native';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useColorScheme } from 'nativewind';

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [permission, requestPermission] = useState({ granted: true });

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  const toggleSiren = () => {
    setIsPlaying(!isPlaying);
  };



  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('profile')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 items-center mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <View className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mb-4">
            <User color={colorScheme === 'dark' ? '#60a5fa' : '#3b82f6'} size={40} />
          </View>
          
          <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isSignedIn ? "Anuraj Singh" : "Guest Account"}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium mb-4">
            {isSignedIn ? "anuraj@example.com" : "Not logged in"}
          </Text>



          {!isSignedIn && (
            <TouchableOpacity 
              onPress={() => router.push('/auth')}
              className="bg-blue-600 rounded-2xl py-3 px-8 shadow-sm"
            >
              <Text className="text-white font-bold text-lg text-center">Log In or Sign Up</Text>
            </TouchableOpacity>
          )}

          {isSignedIn && (
            <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
              <Shield color="#16a34a" size={14} className="mr-1" />
              <Text className="text-green-700 dark:text-green-400 text-xs font-bold">Verified Medical ID</Text>
            </View>
          )}
        </View>

        <Text className="text-slate-900 dark:text-white font-bold text-lg mb-3 ml-1">{t('emergencyToolkit')}</Text>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity 
            className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center mr-2 border border-slate-200 dark:border-slate-800 shadow-sm"
            activeOpacity={0.7}
            onPress={() => {
               if(!permission?.granted) requestPermission({granted: true});
               else alert("Flashlight toggled! (Requires native build)");
            }}
          >
            <View className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mb-3">
              <Flashlight color="#eab308" size={24} />
            </View>
            <Text className="text-slate-900 dark:text-white font-bold text-sm">{t('flashlight')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-1 rounded-3xl p-4 items-center justify-center ml-2 border border-slate-200 dark:border-slate-800 shadow-sm ${isPlaying ? 'bg-red-100 dark:bg-red-900/50' : 'bg-white dark:bg-slate-900'}`}
            activeOpacity={0.7}
            onPress={toggleSiren}
          >
            <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-3">
              <Volume2 color="#ef4444" size={24} />
            </View>
            <Text className="text-slate-900 dark:text-white font-bold text-sm">{isPlaying ? 'Stop Siren' : t('loudSiren')}</Text>
          </TouchableOpacity>
        </View>



        <View className="gap-3">
          
          <TouchableOpacity onPress={toggleLanguage} className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
              <Text className="font-bold text-slate-700 dark:text-slate-300">A/अ</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-bold text-lg">{t('language')}</Text>
              <Text className="text-slate-500 dark:text-slate-400">{locale === 'en' ? 'English' : 'हिंदी'}</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
              {colorScheme === 'dark' ? <Moon color="#94a3b8" size={20} /> : <Sun color="#64748b" size={20} />}
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-bold text-lg">Dark Mode</Text>
              <Text className="text-slate-500 dark:text-slate-400">Default is Light</Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
            />
          </View>

          {isSignedIn && (
            <TouchableOpacity onPress={handleSignOut} className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm mt-4">
              <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
                <LogOut color="#ef4444" size={20} />
              </View>
              <Text className="text-red-600 font-bold text-lg">Log Out</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

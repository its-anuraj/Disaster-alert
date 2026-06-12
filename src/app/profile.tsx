import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, FileText, HeartPulse, Flashlight, Volume2, Globe, LogOut, LogIn } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useCameraPermissions } from 'expo-camera';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const { t, locale, setLocale } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  const toggleSiren = async () => {
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (e) {
      Alert.alert('Error', 'Could not play siren audio.');
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
        
        {/* User Profile Section */}
        <View className="items-center py-8 bg-white border border-slate-200 rounded-3xl mb-6 shadow-sm">
          {!isLoaded ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : isSignedIn ? (
            <>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} className="w-24 h-24 rounded-full mb-4 border-2 border-slate-200" />
              ) : (
                <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
                  <User color="#3b82f6" size={48} />
                </View>
              )}
              <Text className="text-slate-900 text-2xl font-bold">{user?.fullName || "DisasterShield User"}</Text>
              <Text className="text-slate-600">{user?.primaryEmailAddress?.emailAddress}</Text>
            </>
          ) : (
            <>
              <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center mb-4 border border-slate-200">
                <User color="#94a3b8" size={48} />
              </View>
              <Text className="text-slate-900 text-2xl font-bold mb-2">{t('guestAccount')}</Text>
              <TouchableOpacity 
                onPress={() => router.push('/auth')}
                className="bg-blue-600 px-6 py-2 rounded-full flex-row items-center mt-2 shadow-sm"
              >
                <LogIn color="white" size={16} className="mr-2" />
                <Text className="text-white font-bold">{t('loginSignUp')}</Text>
              </TouchableOpacity>
              
              <Text className="text-slate-500 text-xs text-center mt-4">
                System Status: Loaded={String(isLoaded)} | SignedIn={String(isSignedIn)} | Token={user ? "Yes" : "No"}
              </Text>
            </>
          )}
        </View>

        <Text className="text-slate-900 font-bold text-lg mb-3 ml-1">{t('emergencyToolkit')}</Text>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity 
            className="flex-1 bg-white rounded-3xl p-4 items-center justify-center mr-2 border border-slate-200 shadow-sm"
            activeOpacity={0.7}
            onPress={() => {
               if(!permission?.granted) requestPermission();
               else alert("Flashlight toggled! (Requires native build)");
            }}
          >
            <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center mb-3">
              <Flashlight color="#eab308" size={24} />
            </View>
            <Text className="text-slate-900 font-bold text-sm">{t('flashlight')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-1 rounded-3xl p-4 items-center justify-center ml-2 border border-slate-200 shadow-sm ${isPlaying ? 'bg-red-100' : 'bg-white'}`}
            activeOpacity={0.7}
            onPress={toggleSiren}
          >
            <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
              <Volume2 color="#ef4444" size={24} />
            </View>
            <Text className="text-slate-900 font-bold text-sm">{isPlaying ? 'Stop Siren' : t('loudSiren')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="bg-red-600 rounded-3xl p-4 items-center justify-center mb-6 shadow-sm flex-row"
          activeOpacity={0.7}
          onPress={() => {
            import('../lib/notifications').then(({ sendDisasterAlert }) => {
              sendDisasterAlert(
                "CRITICAL: Flash Flood Warning",
                "Move to higher ground immediately. Do not drive through flooded waters!"
              );
            });
          }}
        >
          <Text className="text-white font-bold text-sm">Test Disaster Push Alert (Simulate)</Text>
        </TouchableOpacity>

        <View className="gap-3">
          
          <TouchableOpacity onPress={toggleLanguage} className="flex-row items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Globe color="#a855f7" size={20} />
            </View>
            <View className="flex-1 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-900 font-bold">{t('language')}</Text>
                <Text className="text-slate-500 text-xs">{t('switchLanguage')}</Text>
              </View>
              <Text className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{locale.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
          
          {isSignedIn && (
            <TouchableOpacity onPress={() => router.push('/incident-reports')} className="flex-row items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <FileText color="#3b82f6" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold">{t('myIncidentReports')}</Text>
                <Text className="text-slate-500 text-xs">{t('viewManageReports')}</Text>
              </View>
            </TouchableOpacity>
          )}

          {isSignedIn && (
            <TouchableOpacity onPress={() => signOut()} className="flex-row items-center bg-white border border-slate-200 p-5 rounded-2xl mb-8 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                <LogOut color="#ef4444" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-red-500 font-bold">{t('logOut')}</Text>
                <Text className="text-slate-500 text-xs">{t('signOutDesc')}</Text>
              </View>
            </TouchableOpacity>
          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

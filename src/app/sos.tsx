import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneCall, ShieldAlert, Navigation, Hospital, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function SOSScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<number | null>(null);



  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerEmergency();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const triggerEmergency = () => {
    Alert.alert("Emergency Triggered", "Calling 112...");
    Linking.openURL('tel:112');
  };

  const emergencyContacts = [
    { id: 1, name: t('police'), number: "100", icon: Shield },
    { id: 2, name: t('ambulance'), number: "108", icon: Hospital },
    { id: 3, name: t('fireBrigade'), number: "101", icon: ShieldAlert },
    { id: 4, name: t('disasterHelpline'), number: "1078", icon: PhoneCall },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('sos')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Main SOS Button */}
        <View className="items-center py-8 mb-4">
          <View className="relative items-center justify-center">
            {countdown !== null && (
              <View className="absolute z-10 w-48 h-48 rounded-full items-center justify-center bg-black/40">
                <Text className="text-white text-6xl font-black">{countdown}</Text>
                <Text className="text-white text-sm font-bold mt-2">Tap to Cancel</Text>
              </View>
            )}
            <TouchableOpacity 
              onPress={() => countdown !== null ? setCountdown(null) : setCountdown(5)}
              className="w-56 h-56 rounded-full bg-red-600 items-center justify-center border-8 border-red-200 dark:border-red-900 shadow-xl"
              activeOpacity={0.8}
            >
              <ShieldAlert color="white" size={72} className="mb-2" />
              <Text className="text-white text-3xl font-black tracking-widest text-center px-2">{t('sos')}</Text>
              <Text className="text-white text-2xl font-black mt-1 tracking-widest text-center px-2">112</Text>
              <Text className="text-white text-xs font-bold opacity-90 mt-1 text-center px-2">Press & Hold to Call</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-500 dark:text-slate-400 text-center mt-6 px-4">
            {t('sosDesc')}
          </Text>
        </View>

        {/* Local Emergency Numbers */}
        <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4 ml-1">{t('emergencyNumbers')}</Text>
        <View className="flex-row flex-wrap justify-between">
          {emergencyContacts.map((contact) => (
            <TouchableOpacity 
              key={contact.id}
              onPress={() => Linking.openURL(`tel:${contact.number}`)}
              className="w-[48%] bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm items-center"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-3">
                <contact.icon color="#ef4444" size={24} />
              </View>
              <Text className="text-slate-900 dark:text-white font-bold text-sm mb-1">{contact.name}</Text>
              <Text className="text-red-600 dark:text-red-400 font-black">{contact.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby Shelters */}
        <TouchableOpacity 
          onPress={() => router.push('/map')}
          className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-5 mt-2 flex-row items-center justify-between shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg mb-1">{t('nearbyShelters')}</Text>
            <Text className="text-slate-400 text-sm">{t('nearbyDesc')}</Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-slate-800 dark:bg-slate-700 items-center justify-center">
            <Navigation color="#60a5fa" size={24} />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

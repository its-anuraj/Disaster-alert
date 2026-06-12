import { useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneCall, MessageCircle, Navigation, ShieldAlert, AlertTriangle, HeartPulse } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SOS() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const callEmergency = () => {
    // 112 is standard emergency in India/Europe. 911 in US.
    Linking.openURL('tel:112');
  };

  const textFamily = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Need location permission to share SOS.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
      
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(
          [], // empty array means user picks the contact
          `EMERGENCY SOS: I need immediate help. I am currently at this location: ${mapLink}`
        );
      } else {
        Alert.alert('SMS unavailable', 'Your device does not support SMS.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-Flashlight check
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      Alert.alert("Night Time Detected", "Auto-Flashlight would turn on here to help you see in the dark! (Requires native build for hardware control)");
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4">
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        
        <View className="items-center py-6">
          <Text className="text-3xl font-black text-slate-900">{t('emergencySOS')}</Text>
          <Text className="text-slate-500 mt-2">{t('getHelp')}</Text>
        </View>

        <TouchableOpacity 
          onPress={callEmergency}
          className="bg-red-600 rounded-3xl p-6 flex-row items-center mb-6 border border-red-500 shadow-sm"
          activeOpacity={0.8}
        >
          <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mr-4">
            <PhoneCall color="white" size={28} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold">{t('call112')}</Text>
            <Text className="text-red-100 text-sm">{t('emergencyServices')}</Text>
          </View>
        </TouchableOpacity>

        <Text className="text-slate-500 font-bold mb-3 px-1 uppercase tracking-wider text-xs">India Emergency Numbers</Text>
        <View className="flex-row flex-wrap justify-between mb-4">
          <TouchableOpacity onPress={() => Linking.openURL('tel:100')} activeOpacity={0.8} className="bg-white border border-slate-200 p-4 rounded-2xl w-[48%] mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <ShieldAlert color="#3b82f6" size={20} />
            </View>
            <View>
              <Text className="text-slate-900 font-bold">Police</Text>
              <Text className="text-slate-500 text-xs">100</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Linking.openURL('tel:101')} activeOpacity={0.8} className="bg-white border border-slate-200 p-4 rounded-2xl w-[48%] mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <AlertTriangle color="#ef4444" size={20} />
            </View>
            <View>
              <Text className="text-slate-900 font-bold">Fire</Text>
              <Text className="text-slate-500 text-xs">101</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Linking.openURL('tel:102')} activeOpacity={0.8} className="bg-white border border-slate-200 p-4 rounded-2xl w-[48%] mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
              <HeartPulse color="#22c55e" size={20} />
            </View>
            <View>
              <Text className="text-slate-900 font-bold">Ambulance</Text>
              <Text className="text-slate-500 text-xs">102</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Linking.openURL('tel:108')} activeOpacity={0.8} className="bg-white border border-slate-200 p-4 rounded-2xl w-[48%] mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
              <PhoneCall color="#f97316" size={20} />
            </View>
            <View>
              <Text className="text-slate-900 font-bold">Disaster</Text>
              <Text className="text-slate-500 text-xs">108</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={textFamily}
          disabled={loading}
          className={`bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex-row items-center mb-4 ${loading ? 'opacity-50' : ''}`}
          activeOpacity={0.8}
        >
          <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
            <MessageCircle color="#3b82f6" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-xl font-bold">{loading ? t('locating') : t('messageFamily')}</Text>
            <Text className="text-slate-500 text-sm">{t('shareLiveLocation')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/map')}
          className="bg-white rounded-3xl p-6 flex-row items-center border border-slate-200 shadow-sm mb-6"
          activeOpacity={0.8}
        >
          <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mr-4">
            <Navigation color="#22c55e" size={28} />
          </View>
          <View>
            <Text className="text-slate-900 text-xl font-bold">{t('nearbyShelters')}</Text>
            <Text className="text-slate-500 text-sm">{t('findSafeZones')}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

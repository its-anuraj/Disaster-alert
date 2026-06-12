import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapPin, Thermometer, Droplets, Wind, ShieldAlert, AlertTriangle, CloudRain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState("Locating...");
  const [countryCode, setCountryCode] = useState("--");
  const [weather, setWeather] = useState({ temp: "--", humidity: "--", wind: "--" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setCity("Location Disabled");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (geocode.length > 0) {
          setCity(geocode[0].city || geocode[0].region || "Unknown");
          setCountryCode(geocode[0].isoCountryCode || "IN");
        }

        // Fetch Real Weather Data in Celsius
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        const weatherData = await weatherRes.json();
        if (weatherData.current) {
          setWeather({
            temp: `${Math.round(weatherData.current.temperature_2m)}°C`,
            humidity: `${weatherData.current.relative_humidity_2m}%`,
            wind: `${weatherData.current.wind_speed_10m} km/h`
          });
        }
      } catch(e) {
        setCity("GPS Location");
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4">
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900 tracking-tight">DisasterShield AI</Text>
            <Text className="text-sm text-slate-600">{t('smartAssistant')}</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
            <Text className="font-bold text-slate-900">{countryCode}</Text>
          </View>
        </View>

        {/* Location & Risk Indicator */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden mb-6">
          <View className="absolute top-4 right-4 bg-green-500/20 px-3 py-1 rounded-full flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Text className="text-green-600 font-bold text-xs">{t('lowRisk')}</Text>
          </View>
          
          <View className="flex-row items-start mb-6 mt-1">
            <MapPin color="#3b82f6" size={24} className="mt-1 mr-3" />
            <View>
              <Text className="text-xl font-bold text-slate-900">{city}</Text>
              <Text className="text-slate-600 text-sm">{t('currentLocation')}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center border-t border-slate-100 pt-4">
            <View className="flex-row items-center">
              <Thermometer color="#fb923c" size={16} />
              <Text className="text-slate-700 ml-1.5 font-medium">{weather.temp}</Text>
            </View>
            <View className="flex-row items-center">
              <Droplets color="#60a5fa" size={16} />
              <Text className="text-slate-700 ml-1.5 font-medium">{weather.humidity} {t('humidity')}</Text>
            </View>
            <View className="flex-row items-center">
              <Wind color="#94a3b8" size={16} />
              <Text className="text-slate-700 ml-1.5 font-medium">{weather.wind} {t('wind')}</Text>
            </View>
          </View>
        </View>

        {/* SOS Action */}
        <View className="items-center py-6 mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/sos')}
            className="w-48 h-48 rounded-full bg-red-600 items-center justify-center border-4 border-red-200 shadow-xl"
            activeOpacity={0.8}
          >
            <ShieldAlert color="white" size={64} className="mb-2" />
            <Text 
              className="text-white text-4xl font-black tracking-widest text-center px-4 w-full"
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {t('sos')}
            </Text>
            <Text 
              className="text-white text-xs font-bold opacity-90 mt-1 tracking-widest text-center px-4 w-full"
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {t('tapToAlert')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/guidelines')}
            className="flex-1 bg-white rounded-3xl p-4 items-center justify-center mr-2 border border-slate-200 shadow-sm"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
              <AlertTriangle color="#3b82f6" size={24} />
            </View>
            <Text className="text-slate-900 font-bold text-sm">{t('survivalGuides')}</Text>
            <Text className="text-slate-500 text-xs mt-1 text-center">{t('offlineTips')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Alert.alert("Coming Soon", "Our AI Assistant is currently undergoing upgrades. Please check back later!")}
            className="flex-1 bg-slate-100 rounded-3xl p-4 items-center justify-center ml-2 border border-slate-200 opacity-70"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-purple-200 items-center justify-center mb-3">
              <ShieldAlert color="#a855f7" size={24} />
            </View>
            <Text className="text-purple-600 font-bold text-sm text-center">{t('aiAssistant')}</Text>
            <Text className="text-slate-500 text-xs mt-1 font-bold">Coming Soon</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/weather')}
            className="bg-white rounded-3xl p-4 items-center flex-row border border-slate-200 shadow-sm"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
              <CloudRain color="#3b82f6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-lg">{t('weatherForecast') || 'Weather Forecast'}</Text>
              <Text className="text-slate-500 text-sm">{t('fourteenDayData') || '14-Day Rain & Weather Data'}</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

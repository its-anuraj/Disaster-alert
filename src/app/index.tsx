import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapPin, Thermometer, Droplets, Wind, ShieldAlert, AlertTriangle, CloudRain, PackageOpen, RadioReceiver, HeartHandshake } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState("Locating...");
  const [countryCode, setCountryCode] = useState("--");
  const [weather, setWeather] = useState({ temp: "--", humidity: "--", wind: "--" });
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setCity("Location Disabled");
        return;
      }

      let loc = await Location.getLastKnownPositionAsync();
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } else {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(l => setLocation(l)).catch(()=>{});
      }
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
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`);
        const weatherData = await weatherRes.json();
        if (weatherData.current) {
          const temp = weatherData.current.temperature_2m;
          const wind = weatherData.current.wind_speed_10m;
          const precip = weatherData.current.precipitation || 0;

          if (wind > 65 || precip > 15 || temp > 45) {
             setRiskLevel('high');
          } else if (wind > 40 || precip > 5 || temp > 40) {
             setRiskLevel('medium');
          } else {
             setRiskLevel('low');
          }

          setWeather({
            temp: `${Math.round(temp)}°C`,
            humidity: `${weatherData.current.relative_humidity_2m}%`,
            wind: `${wind} km/h`
          });
        }
      } catch(e) {
        setCity("GPS Location");
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 px-4">
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">DisasterShield AI</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">{t('smartAssistant')}</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center">
            <Text className="font-bold text-slate-900 dark:text-white">{countryCode}</Text>
          </View>
        </View>

        {/* Location & Risk Indicator */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-6">
          <View className={`absolute top-4 right-4 px-3 py-1 rounded-full flex-row items-center ${riskLevel === 'high' ? 'bg-red-500/20' : riskLevel === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
            <View className={`w-2 h-2 rounded-full mr-2 ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <Text className={`font-bold text-xs ${riskLevel === 'high' ? 'text-red-600 dark:text-red-400' : riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              {riskLevel === 'high' ? t('highRisk') : riskLevel === 'medium' ? t('mediumRisk') : t('lowRisk')}
            </Text>
          </View>
          
          <View className="flex-row items-start mb-6 mt-1">
            <MapPin color="#3b82f6" size={24} className="mt-1 mr-3" />
            <View>
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{city}</Text>
              <Text className="text-slate-600 dark:text-slate-400 text-sm">{t('currentLocation')}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <View className="flex-row items-center">
              <Thermometer color="#fb923c" size={16} />
              <Text className="text-slate-700 dark:text-slate-300 ml-1.5 font-medium">{weather.temp}</Text>
            </View>
            <View className="flex-row items-center">
              <Droplets color="#60a5fa" size={16} />
              <Text className="text-slate-700 dark:text-slate-300 ml-1.5 font-medium">{weather.humidity} {t('humidity')}</Text>
            </View>
            <View className="flex-row items-center">
              <Wind color="#94a3b8" size={16} />
              <Text className="text-slate-700 dark:text-slate-300 ml-1.5 font-medium">{weather.wind} {t('wind')}</Text>
            </View>
          </View>
        </View>

        {/* SOS Action */}
        <View className="items-center py-6 mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/sos')}
            className="w-48 h-48 rounded-full bg-red-600 dark:bg-red-700 items-center justify-center border-4 border-red-200 dark:border-red-900 shadow-xl"
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

        {/* Quick Actions Grid */}
        <View className="mb-6">
          <Text className="text-slate-900 dark:text-white font-bold text-lg mb-3 ml-1">{t('emergencyToolkit') || 'Emergency Tools'}</Text>
          
          <View className="flex-row justify-between mb-3">
            <TouchableOpacity 
              onPress={() => {
                if (location) {
                  const mapLink = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
                  import('react-native').then(({ Share }) => {
                    Share.share({
                      message: `I need help! My current location is: ${mapLink}`
                    });
                  });
                } else {
                  Alert.alert("Location Error", "Could not fetch your location yet.");
                }
              }}
              className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center mr-2 border border-slate-200 dark:border-slate-800 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-3">
                <MapPin color="#3b82f6" size={24} />
              </View>
              <Text className="text-slate-900 dark:text-white font-bold text-sm text-center">{t('shareLiveLocation') || 'Share Location'}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 text-center">With Family</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/volunteer')}
              className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center ml-2 border border-slate-200 dark:border-slate-800 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-3">
                <HeartHandshake color="#ef4444" size={24} />
              </View>
              <Text className="text-slate-900 dark:text-white font-bold text-sm text-center">Blood / Help</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 text-center">Volunteer Hub</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => router.push('/guidelines')}
              className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center mr-2 border border-slate-200 dark:border-slate-800 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
                <AlertTriangle color="#f97316" size={24} />
              </View>
              <Text className="text-slate-900 dark:text-white font-bold text-sm text-center">{t('survivalGuides')}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 text-center">{t('offlineTips')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/checklist')}
              className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center ml-2 border border-slate-200 dark:border-slate-800 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-3">
                <PackageOpen color="#16a34a" size={24} />
              </View>
              <Text className="text-slate-900 dark:text-white font-bold text-sm text-center">Emergency Kit</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 text-center">Go-Bag</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <TouchableOpacity 
            onPress={() => router.push('/weather')}
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 items-center flex-row border border-slate-200 dark:border-slate-800 shadow-sm"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
              <CloudRain color="#3b82f6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-bold text-lg">{t('weatherForecast') || 'Weather Forecast'}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">{t('fourteenDayData') || '14-Day Rain & Weather Data'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <TouchableOpacity 
            onPress={() => Alert.alert("Coming Soon", "Our AI Assistant is currently undergoing upgrades. Please check back later!")}
            className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-4 items-center flex-row border border-slate-200 dark:border-slate-700 opacity-70"
            activeOpacity={0.7}
          >
            <View className="w-12 h-12 rounded-full bg-purple-200 dark:bg-purple-900/30 items-center justify-center mr-4">
              <ShieldAlert color="#a855f7" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-purple-600 dark:text-purple-400 font-bold text-lg">{t('aiAssistant')}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-bold">Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

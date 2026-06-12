import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

// Helper to get weather icon based on WMO code
const getWeatherIcon = (code: number) => {
  if (code <= 3) return <Sun color="#facc15" size={24} />;
  if (code <= 48) return <Cloud color="#94a3b8" size={24} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain color="#60a5fa" size={24} />;
  if (code >= 95) return <CloudLightning color="#a855f7" size={24} />;
  return <CloudRain color="#60a5fa" size={24} />;
};

export default function WeatherScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        let loc = await Location.getLastKnownPositionAsync();
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        } else {
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(()=>{});
        }
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&hourly=temperature_2m,precipitation_probability,weathercode&timezone=auto&forecast_days=14`);
        const data = await res.json();

        if (data && data.daily) {
          const days = data.daily.time.map((time: string, i: number) => {
            const startIdx = i * 24;
            const endIdx = startIdx + 24;
            const hourly = data.hourly.time.slice(startIdx, endIdx).map((hTime: string, j: number) => {
              const globalIdx = startIdx + j;
              return {
                time: new Date(hTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: Math.round(data.hourly.temperature_2m[globalIdx]),
                rainProb: data.hourly.precipitation_probability[globalIdx],
                code: data.hourly.weathercode[globalIdx]
              };
            });

            return {
              date: new Date(time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
              maxTemp: Math.round(data.daily.temperature_2m_max[i]),
              minTemp: Math.round(data.daily.temperature_2m_min[i]),
              rainProb: data.daily.precipitation_probability_max[i],
              rainSum: data.daily.precipitation_sum[i],
              code: data.daily.weathercode[i],
              hourly
            };
          });
          setForecast(days);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('weatherForecastTitle') || '14-Day Weather Forecast'}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-slate-500 dark:text-slate-400 mt-4">{t('fetchingWeather') || 'Fetching weather data...'}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {forecast.map((day, index) => (
            <View key={index} className="mb-3">
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setExpandedDayIndex(expandedDayIndex === index ? null : index)}
                className="flex-row items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <View className="flex-row items-center w-36">
                  <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
                    {getWeatherIcon(day.code)}
                  </View>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold">{index === 0 ? (t('today')||'Today') : index === 1 ? (t('tomorrow')||'Tomorrow') : day.date.split(',')[0]}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">{day.date.split(',')[1]?.trim() || day.date}</Text>
                  </View>
                </View>

                <View className="items-center w-24">
                  <Text className={day.rainProb > 40 ? "text-blue-500 font-bold" : "text-slate-600 dark:text-slate-400 font-bold"}>
                    {day.rainProb}% {t('rainProb') || 'Rain'}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">{day.rainSum} mm</Text>
                </View>

                <View className="items-end flex-1">
                  <Text className="text-slate-900 dark:text-white font-bold">{day.maxTemp}°C</Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">{day.minTemp}°C</Text>
                </View>
              </TouchableOpacity>

              {expandedDayIndex === index && (
                <View className="bg-slate-100 dark:bg-slate-800 rounded-b-2xl -mt-2 pt-4 pb-2 px-2 border-x border-b border-slate-200 dark:border-slate-700">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {day.hourly.map((hourData: any, hIndex: number) => (
                      <View key={hIndex} className="items-center justify-center mx-2 w-16">
                        <Text className="text-slate-600 dark:text-slate-300 text-xs mb-1">{hourData.time}</Text>
                        <View className="mb-1">{getWeatherIcon(hourData.code)}</View>
                        <Text className="text-slate-900 dark:text-white font-bold mb-1">{hourData.temp}°C</Text>
                        <Text className={hourData.rainProb > 40 ? "text-blue-500 text-xs font-bold" : "text-slate-500 dark:text-slate-400 text-xs"}>{hourData.rainProb}%</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
          
          {forecast.length === 0 && (
            <Text className="text-slate-500 dark:text-slate-400 text-center mt-10">{t('loadError') || 'Could not load weather data.'}</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export default function CompassScreen() {
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<any>(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    Magnetometer.setUpdateInterval(50);
    const sub = Magnetometer.addListener(data => {
      let { x, y } = data;
      let heading = Math.atan2(y, x) * (180 / Math.PI);
      
      // Adjusting for orientation (varies by device, but usually -90 is standard for portrait)
      heading -= 90;
      
      if (heading < 0) {
        heading += 360;
      }
      
      // If the values seem inverted on real device, it might need to be 360 - heading
      setMagnetometer(Math.round(heading));
    });
    setSubscription(sub);

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  const getDirection = (degree: number) => {
    if (degree >= 337.5 || degree < 22.5) return 'N';
    if (degree >= 22.5 && degree < 67.5) return 'NE';
    if (degree >= 67.5 && degree < 112.5) return 'E';
    if (degree >= 112.5 && degree < 157.5) return 'SE';
    if (degree >= 157.5 && degree < 202.5) return 'S';
    if (degree >= 202.5 && degree < 247.5) return 'SW';
    if (degree >= 247.5 && degree < 292.5) return 'W';
    if (degree >= 292.5 && degree < 337.5) return 'NW';
    return 'N';
  };

  const degree = magnetometer;
  const direction = getDirection(degree);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Compass</Text>
        <Text className="text-lg text-slate-500 mb-12 dark:text-slate-400">
          Realtime Direction
        </Text>

        {/* Compass Dial */}
        <View className="items-center justify-center relative w-80 h-80 rounded-full border-[6px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          
          {/* Compass labels */}
          <Text className="absolute top-4 text-3xl font-black text-red-500">N</Text>
          <Text className="absolute bottom-4 text-2xl font-bold text-slate-400">S</Text>
          <Text className="absolute right-4 text-2xl font-bold text-slate-400">E</Text>
          <Text className="absolute left-4 text-2xl font-bold text-slate-400">W</Text>

          <Text className="absolute top-14 right-14 text-lg font-bold text-slate-300">NE</Text>
          <Text className="absolute top-14 left-14 text-lg font-bold text-slate-300">NW</Text>
          <Text className="absolute bottom-14 right-14 text-lg font-bold text-slate-300">SE</Text>
          <Text className="absolute bottom-14 left-14 text-lg font-bold text-slate-300">SW</Text>

          {/* Rotating Needle */}
          <View style={{ transform: [{ rotate: `${degree}deg` }] }}>
             <Navigation size={140} color="#ef4444" fill="#ef4444" strokeWidth={1.5} />
          </View>
          
          {/* Center Pivot */}
          <View className="absolute w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-200 shadow-md" />
        </View>

        {/* Readings */}
        <View className="mt-16 items-center">
          <Text className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter">
            {degree}°
          </Text>
          <Text className="text-4xl font-bold text-red-500 mt-2 tracking-widest">
            {direction}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

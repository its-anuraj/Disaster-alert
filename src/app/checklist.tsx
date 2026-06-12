import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_ITEMS = [
  { id: '1', title: 'Water (1 Gallon per person per day)', checked: false },
  { id: '2', title: 'Non-perishable Food (3-day supply)', checked: false },
  { id: '3', title: 'Flashlight and Extra Batteries', checked: false },
  { id: '4', title: 'First Aid Kit', checked: false },
  { id: '5', title: 'Whistle to signal for help', checked: false },
  { id: '6', title: 'Dust Mask', checked: false },
  { id: '7', title: 'Moist Towelettes & Garbage Bags', checked: false },
  { id: '8', title: 'Wrench or Pliers (turn off utilities)', checked: false },
  { id: '9', title: 'Manual Can Opener', checked: false },
  { id: '10', title: 'Local Maps', checked: false },
  { id: '11', title: 'Cell phone with Chargers and Backup Battery', checked: false },
  { id: '12', title: 'Important Family Documents', checked: false }
];

export default function ChecklistScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [items, setItems] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const saved = await AsyncStorage.getItem('@gobag_checklist');
      if (saved !== null) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load checklist", e);
    }
  };

  const toggleItem = async (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    try {
      await AsyncStorage.setItem('@gobag_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save checklist", e);
    }
  };

  const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Emergency Go-Bag</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Progress Card */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Text className="text-slate-900 dark:text-white font-bold text-lg mb-2">Readiness Score</Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">Essential Items Packed</Text>
            <Text className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</Text>
          </View>
          <View className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </View>
        </View>

        <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4 ml-1">Checklist Items</Text>
        
        <View className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          {items.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              activeOpacity={0.7}
              onPress={() => toggleItem(item.id)}
              className={`flex-row items-center p-4 ${index !== items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
            >
              <View className="mr-4">
                {item.checked ? (
                  <CheckCircle2 color="#10b981" size={24} />
                ) : (
                  <Circle color="#94a3b8" size={24} />
                )}
              </View>
              <Text className={`flex-1 text-base ${item.checked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

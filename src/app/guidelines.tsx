import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Droplets, Flame, Wind, Mountain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function GuidelinesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const guides = [
    {
      id: 1,
      title: t('earthquake'),
      icon: Mountain,
      color: "bg-orange-500",
      iconColor: "#f97316",
      bgLight: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-500",
      steps: [
        "Drop, Cover, and Hold On.",
        "Stay away from glass, windows, outside doors and walls.",
        "Do not use elevators.",
        "If outdoors, move away from buildings, streetlights, and utility wires."
      ]
    },
    {
      id: 2,
      title: t('flood'),
      icon: Droplets,
      color: "bg-blue-500",
      iconColor: "#3b82f6",
      bgLight: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-500",
      steps: [
        "Move to higher ground immediately.",
        "Do not walk, swim, or drive through flood waters.",
        "Stay off bridges over fast-moving water.",
        "Evacuate if told to do so."
      ]
    },
    {
      id: 3,
      title: t('wildfire'),
      icon: Flame,
      color: "bg-red-500",
      iconColor: "#ef4444",
      bgLight: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-500",
      steps: [
        "Evacuate immediately if ordered.",
        "Keep windows and doors closed.",
        "Turn on lights outside and in every room.",
        "Remove flammable window shades."
      ]
    },
    {
      id: 4,
      title: t('cyclone'),
      icon: Wind,
      color: "bg-purple-500",
      iconColor: "#a855f7",
      bgLight: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-500",
      steps: [
        "Stay indoors and away from windows.",
        "Close all interior doors.",
        "Keep curtains and blinds closed.",
        "Take refuge in a small interior room, closet, or hallway."
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('survivalGuides')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-slate-600 dark:text-slate-400 mb-4 px-1">
          {t('offlineTips')}
        </Text>

        <TouchableOpacity 
          onPress={() => router.push('/first-aid')}
          className="bg-blue-600 rounded-2xl p-4 mb-6 flex-row items-center justify-between shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg mb-1">Interactive First-Aid Guides</Text>
            <Text className="text-blue-100 text-sm">Offline visual animations for CPR, Bleeding & more.</Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
            <Mountain color="white" size={24} />
          </View>
        </TouchableOpacity>

        {guides.map((guide) => (
          <View key={guide.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <View className={`h-2 ${guide.color}`} />
            <View className="p-5">
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 rounded-full ${guide.bgLight} items-center justify-center mr-4`}>
                  <guide.icon color={guide.iconColor} size={24} />
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">{guide.title}</Text>
              </View>
              
              <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                {guide.steps.map((step, index) => (
                  <View key={index} className="flex-row items-start mb-3 last:mb-0">
                    <Text className={`${guide.textColor} font-black mr-3 text-lg leading-6`}>•</Text>
                    <Text className="text-slate-700 dark:text-slate-300 flex-1 leading-5">{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

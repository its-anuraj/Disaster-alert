import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpen, AlertTriangle, Droplets, Wind } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function Guidelines() {
  const router = useRouter();
  const { t } = useLanguage();

  const guidelines = [
    {
      id: 1,
      title: t('earthquakeTitle') || "Earthquake Survival",
      icon: <AlertTriangle color="#f97316" size={24} />,
      tips: (t('earthquakeTips') || "Drop, Cover, and Hold On.\nStay away from glass, windows, outside doors and walls.\nDo not use elevators.\nIf outdoors, move away from buildings, streetlights, and utility wires.").split('\n')
    },
    {
      id: 2,
      title: t('floodTitle') || "Flood Safety",
      icon: <Droplets color="#3b82f6" size={24} />,
      tips: (t('floodTips') || "Move to higher ground immediately.\nDo not walk, swim, or drive through flood waters (Turn Around, Don't Drown!).\nStay off of bridges over fast-moving water.\nEvacuate if told to do so.").split('\n')
    },
    {
      id: 3,
      title: t('hurricaneTitle') || "Hurricane / Cyclone",
      icon: <Wind color="#a855f7" size={24} />,
      tips: (t('hurricaneTips') || "Stay indoors and away from windows and glass doors.\nClose all interior doors, secure and brace external doors.\nTake refuge in a small interior room, closet, or hallway on the lowest level.\nDo not go outside until the storm has completely passed.").split('\n')
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center p-4 border-b border-slate-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Survival Guidelines</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        
        <View className="mb-6 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
            <BookOpen color="#3b82f6" size={24} />
          </View>
          <Text className="text-xl font-bold text-slate-900 mb-2">{t('survivalGuides') || 'Offline Tips'}</Text>
          <Text className="text-slate-600 text-sm leading-relaxed">
            These guidelines are stored on your device and are available even when you have no internet connection.
          </Text>
        </View>

        {guidelines.map(guide => (
          <View key={guide.id} className="mb-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <View className="flex-row items-center mb-4 pb-4 border-b border-slate-100">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                {guide.icon}
              </View>
              <Text className="text-lg font-bold text-slate-900 flex-1">{guide.title}</Text>
            </View>
            
            <View className="pl-2">
              {guide.tips.map((tip, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-3" />
                  <Text className="text-slate-700 flex-1 leading-relaxed">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

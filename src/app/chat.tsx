import { View, Text, TouchableOpacity } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RadioReceiver, Wrench } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Community Chat</Text>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-8 relative">
          <RadioReceiver color="#3b82f6" size={64} />
          <View className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full items-center justify-center border-4 border-slate-50 dark:border-slate-950">
            <Wrench color="#713f12" size={20} />
          </View>
        </View>

        <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-4">
          Coming Soon!
        </Text>
        
        <Text className="text-slate-500 dark:text-slate-400 text-center text-lg leading-relaxed mb-8">
          We are currently building the Live Walkie-Talkie feature. Soon you'll be able to communicate with people in your city without cellular networks!
        </Text>

        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 px-8 py-4 rounded-full shadow-sm"
        >
          <Text className="text-white font-bold text-lg">Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

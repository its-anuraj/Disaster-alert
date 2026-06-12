import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLanguage } from '../context/LanguageContext';

export default function Assistant() {
  const router = useRouter();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your DisasterShield AI Assistant. Ask me anything about survival guidelines, emergency preparation, or disaster alerts.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Setup Gemini API
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent(
        `You are an emergency disaster assistant. Keep responses short and helpful. User says: ${userMsg}`
      );
      
      const text = result.response.text();
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">{t('aiAssistant')}</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg, index) => (
            <View key={index} className={`mb-4 max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 self-end rounded-tr-sm' : 'bg-slate-800 self-start rounded-tl-sm'}`}>
              <Text className="text-white text-base leading-relaxed">{msg.text}</Text>
            </View>
          ))}
          {loading && (
            <View className="bg-slate-800 self-start rounded-2xl p-4 mb-4 rounded-tl-sm">
              <ActivityIndicator color="#3b82f6" />
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center p-4 bg-slate-900 border-t border-slate-800">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('askQuestion')}
            placeholderTextColor="#64748b"
            className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-full mr-3 border border-slate-700"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={loading}
            className={`w-12 h-12 rounded-full items-center justify-center ${input.trim() ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';

export default function IncidentReportsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reports
  useEffect(() => {
    const q = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching incidents:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const submitReport = async () => {
    if (!isSignedIn) {
      alert("Please log in to submit an incident report.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert("Please provide both title and description.");
      return;
    }

    setSubmitting(true);
    try {
      let locationData = null;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        locationData = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        };
      }

      await addDoc(collection(db, 'incidents'), {
        title,
        description,
        authorId: user?.id,
        authorName: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Anonymous',
        location: locationData,
        createdAt: serverTimestamp()
      });

      setTitle('');
      setDescription('');
      alert("Incident reported successfully.");
    } catch (error) {
      console.error("Error adding incident:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('incidentReports')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Form */}
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('reportIncident')}</Text>
          
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('titlePlaceholder')}
            placeholderTextColor="#64748b"
            className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl mb-3 border border-slate-200 dark:border-slate-700"
          />
          
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('descPlaceholder')}
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={3}
            className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl mb-4 border border-slate-200 dark:border-slate-700 h-24 text-top"
            textAlignVertical="top"
          />

          <TouchableOpacity 
            onPress={submitReport}
            disabled={submitting}
            className="bg-blue-600 rounded-xl py-3 flex-row justify-center items-center shadow-sm"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Camera color="white" size={18} className="mr-2" />
                <Text className="text-white font-bold">{t('submitReport')}</Text>
              </>
            )}
          </TouchableOpacity>
          <Text className="text-slate-500 dark:text-slate-400 text-xs text-center mt-3">{t('gpsNotice')}</Text>
        </View>

        {/* Recent Reports List */}
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-1">{t('recentReports')}</Text>
        
        {loading ? (
          <ActivityIndicator color="#ef4444" size="large" className="mt-8" />
        ) : reports.length === 0 ? (
          <Text className="text-slate-500 dark:text-slate-400 text-center mt-8">No incidents reported yet.</Text>
        ) : (
          reports.map(report => (
            <View key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-slate-900 dark:text-white font-bold text-lg flex-1">{report.title}</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs">{report.createdAt ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Just now'}</Text>
              </View>
              <Text className="text-slate-700 dark:text-slate-300 text-sm mb-3">{report.description}</Text>
              
              <View className="flex-row items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                <View className="flex-row items-center flex-1">
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold mr-2">Reported by:</Text>
                  <Text className="text-blue-600 dark:text-blue-400 text-xs">{report.authorName}</Text>
                </View>
                {report.location && (
                  <View className="flex-row items-center">
                    <MapPin color="#94a3b8" size={12} className="mr-1" />
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">Location attached</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

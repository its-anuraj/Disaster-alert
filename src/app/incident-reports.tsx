import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, MapPin, Send, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

export default function IncidentReports() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useUser();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Report State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch real-time reports from Firestore
    const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      Alert.alert("Error", "Could not load incident reports. Please check your Firebase configuration.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const submitReport = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords = null;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude
        };
      }

      await addDoc(collection(db, 'incidents'), {
        title,
        description,
        authorId: user?.id,
        authorName: user?.fullName || user?.primaryEmailAddress?.emailAddress || "Anonymous",
        location: coords,
        createdAt: serverTimestamp()
      });

      Alert.alert("Success", "Incident reported successfully!");
      setTitle('');
      setDescription('');
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center p-4 border-b border-slate-200 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">{t('incidentReports')}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
          
          {/* Form */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">{t('reportIncident')}</Text>
            
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('titlePlaceholder')}
              placeholderTextColor="#64748b"
              className="bg-slate-50 text-slate-900 px-4 py-3 rounded-xl mb-3 border border-slate-200"
            />
            
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('descPlaceholder')}
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              className="bg-slate-50 text-slate-900 px-4 py-3 rounded-xl mb-4 border border-slate-200 h-24 text-top"
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
            <Text className="text-slate-500 text-xs text-center mt-3">{t('gpsNotice')}</Text>
          </View>

          {/* Recent Reports List */}
          <Text className="text-lg font-bold text-slate-900 mb-4 ml-1">{t('recentReports')}</Text>
          
          {loading ? (
            <ActivityIndicator color="#ef4444" size="large" className="mt-8" />
          ) : reports.length === 0 ? (
            <Text className="text-slate-500 text-center mt-8">No incidents reported yet.</Text>
          ) : (
            reports.map(report => (
              <View key={report.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-slate-900 font-bold text-lg flex-1">{report.title}</Text>
                  <Text className="text-slate-500 text-xs">{report.createdAt ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Just now'}</Text>
                </View>
                <Text className="text-slate-700 text-sm mb-3">{report.description}</Text>
                
                <View className="flex-row items-center border-t border-slate-100 pt-3">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-slate-500 text-xs font-bold mr-2">Reported by:</Text>
                    <Text className="text-blue-600 text-xs">{report.authorName}</Text>
                  </View>
                  {report.location && (
                    <View className="flex-row items-center">
                      <MapPin color="#94a3b8" size={12} className="mr-1" />
                      <Text className="text-slate-500 text-xs">Location attached</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

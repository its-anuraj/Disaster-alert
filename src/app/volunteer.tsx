import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Droplet, HeartHandshake, Package, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as Location from 'expo-location';

export default function VolunteerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [reqType, setReqType] = useState('Blood');
  const [desc, setDesc] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'volunteer_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!isSignedIn) {
      Alert.alert("Authentication Required", "Please log in to post a request.");
      return;
    }
    if (!desc.trim() || !contact.trim()) {
      Alert.alert("Missing Info", "Please provide a description and contact info.");
      return;
    }

    setSubmitting(true);
    try {
      let locationData = null;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        locationData = geocode.length > 0 ? geocode[0].city || geocode[0].region : 'Unknown Location';
      }

      await addDoc(collection(db, 'volunteer_requests'), {
        type: reqType,
        description: desc,
        contactInfo: contact,
        locationName: locationData,
        authorId: user?.id,
        authorName: user?.fullName || 'Anonymous',
        status: 'open',
        createdAt: serverTimestamp()
      });

      setDesc('');
      setContact('');
      setShowForm(false);
      Alert.alert("Success", "Your request has been posted.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to post request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'Blood') return <Droplet color="#ef4444" size={24} />;
    if (type === 'Rescue') return <HeartHandshake color="#3b82f6" size={24} />;
    return <Package color="#10b981" size={24} />;
  };

  const getColor = (type: string) => {
    if (type === 'Blood') return 'text-red-500 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    if (type === 'Rescue') return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    return 'text-green-500 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Community Help</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowForm(!showForm)}
          className="bg-red-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold text-sm">{showForm ? 'Cancel' : 'Request Help'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {showForm && (
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Post Urgent Request</Text>
            
            <View className="flex-row mb-4">
              {['Blood', 'Rescue', 'Supplies'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setReqType(t)}
                  className={`flex-1 items-center py-2 mr-2 rounded-xl border ${reqType === t ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                  <Text className={`font-bold text-sm ${reqType === t ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="What help is needed?"
              placeholderTextColor="#64748b"
              multiline
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl mb-3 border border-slate-200 dark:border-slate-700 h-24 text-top"
              textAlignVertical="top"
            />
            
            <TextInput
              value={contact}
              onChangeText={setContact}
              placeholder="Contact number or info"
              placeholderTextColor="#64748b"
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl mb-4 border border-slate-200 dark:border-slate-700"
            />

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 rounded-xl py-3 items-center justify-center"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-1">Live Help Requests</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ef4444" className="mt-8" />
        ) : requests.length === 0 ? (
          <Text className="text-center text-slate-500 dark:text-slate-400 mt-8">No requests at the moment. Community is safe.</Text>
        ) : (
          requests.map(req => (
            <View key={req.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border ${getColor(req.type)}`}>
                    {getIcon(req.type)}
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">{req.type} Needed</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">By {req.authorName}</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs">{req.createdAt ? new Date(req.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}</Text>
              </View>

              <Text className="text-slate-700 dark:text-slate-300 text-sm mb-4 leading-5">{req.description}</Text>

              <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <View className="flex-row items-center">
                  <Navigation color="#94a3b8" size={14} className="mr-1" />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold">{req.locationName || 'Unknown'}</Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => Alert.alert("Contact Info", req.contactInfo)}
                  className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700"
                >
                  <Text className="text-slate-900 dark:text-white font-bold text-xs">Offer Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

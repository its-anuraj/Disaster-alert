import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

export default function MapScreen() {
  const { t } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);
  const [destination, setDestination] = useState<{latitude: number, longitude: number} | null>(null);
  const [shelters, setShelters] = useState<{latitude: number, longitude: number, title: string}[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        
        setShelters([
          { latitude: loc.coords.latitude + 0.015, longitude: loc.coords.longitude + 0.008, title: 'Govt School Relief Camp' },
          { latitude: loc.coords.latitude - 0.012, longitude: loc.coords.longitude - 0.015, title: 'City Hospital Safe Zone' },
          { latitude: loc.coords.latitude + 0.005, longitude: loc.coords.longitude - 0.018, title: 'Community Hall Shelter' },
          { latitude: loc.coords.latitude - 0.008, longitude: loc.coords.longitude + 0.012, title: 'Sports Stadium Camp' }
        ]);
      }
    })();
  }, []);

  const handleMapPress = async (e: any) => {
    const dest = e.nativeEvent.coordinate;
    routeToDestination(dest);
  };

  const routeToDestination = async (dest: {latitude: number, longitude: number}) => {
    setDestination(dest);
    if (location) {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTESERVICE_KEY;
      if (apiKey) {
        try {
          const res = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${location.coords.longitude},${location.coords.latitude}&end=${dest.longitude},${dest.latitude}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const encodedPolyline = data.features[0].geometry.coordinates;
            const coords = encodedPolyline.map((point: any) => ({
              latitude: point[1],
              longitude: point[0]
            }));
            setRouteCoords(coords);
          }
        } catch (err) {
          setRouteCoords([{ latitude: location.coords.latitude, longitude: location.coords.longitude }, dest]);
        }
      } else {
        setRouteCoords([{ latitude: location.coords.latitude, longitude: location.coords.longitude }, dest]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View className="px-4 py-4 absolute top-10 z-10 w-full">
        <View className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <Text className="text-white font-bold text-lg">{t('findSafeZones')}</Text>
          <Text className="text-slate-400 text-xs">Tap any green shelter marker or map area to route</Text>
        </View>
      </View>
      
      {location ? (
        <MapView 
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          onPress={handleMapPress}
        >
          {shelters.map((shelter, index) => (
            <Marker 
              key={index}
              coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
              title={shelter.title}
              description="Safe Zone / Shelter"
              pinColor="green"
              onPress={(e) => {
                e.stopPropagation();
                routeToDestination(e.nativeEvent.coordinate);
              }}
            />
          ))}

          {destination && (
            <Marker 
              coordinate={destination}
              title="Destination"
              pinColor="blue"
            />
          )}

          {routeCoords.length > 0 && (
            <Polyline 
              coordinates={routeCoords}
              strokeColor="#3b82f6"
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Text className="text-white">{t('loadingMap')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

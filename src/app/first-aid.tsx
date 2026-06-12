import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Activity, Droplet, Flame, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function FirstAidScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [activeGuide, setActiveGuide] = useState<number | null>(null);

  const guides = [
    {
      id: 1,
      title: "CPR (Adult)",
      icon: Activity,
      color: "#ef4444",
      bg: "bg-red-100 dark:bg-red-900/30",
      steps: [
        "Check for responsiveness and normal breathing.",
        "Call emergency services immediately.",
        "Place the heel of one hand on the center of the chest.",
        "Place your other hand on top and interlock fingers.",
        "Push hard and fast: at least 2 inches deep, 100-120 compressions per minute.",
        "Allow chest to return to normal position after each compression."
      ],
      AnimationComponent: CPRAnimation
    },
    {
      id: 2,
      title: "Severe Bleeding",
      icon: Droplet,
      color: "#dc2626",
      bg: "bg-red-100 dark:bg-red-900/30",
      steps: [
        "Find the source of bleeding.",
        "Cover the wound with a clean cloth or sterile dressing.",
        "Apply direct continuous pressure using both hands.",
        "If bleeding continues, add more layers. DO NOT remove the first layer.",
        "If it's a limb and bleeding won't stop, consider a tourniquet 2-3 inches above the wound."
      ],
      AnimationComponent: PressureAnimation
    },
    {
      id: 3,
      title: "Choking (Heimlich)",
      icon: AlertCircle,
      color: "#f97316",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      steps: [
        "Ask 'Are you choking?' If they cannot cough, speak, or breathe, act quickly.",
        "Stand behind them and wrap your arms around their waist.",
        "Make a fist with one hand and place the thumb side just above their belly button.",
        "Grasp your fist with the other hand.",
        "Give quick, upward thrusts as if trying to lift the person up."
      ],
      AnimationComponent: HeimlichAnimation
    },
    {
      id: 4,
      title: "Burns",
      icon: Flame,
      color: "#f97316",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      steps: [
        "Move away from the heat source.",
        "Cool the burn with cool (not ice cold) running water for 10-20 minutes.",
        "Remove constricting items (rings, belts) before swelling starts.",
        "Cover loosely with a sterile, non-fluffy dressing or cling film.",
        "DO NOT pop blisters or apply ointments/butter."
      ],
      AnimationComponent: BurnAnimation
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">First-Aid Video Guides</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-slate-600 dark:text-slate-400 mb-6">Visual offline guides for critical emergency procedures.</Text>

        {guides.map((guide) => (
          <View key={guide.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)}
              className="p-5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-full ${guide.bg} items-center justify-center mr-4`}>
                  <guide.icon color={guide.color} size={24} />
                </View>
                <Text className="text-lg font-bold text-slate-900 dark:text-white">{guide.title}</Text>
              </View>
              <Text className="text-slate-400 font-bold">{activeGuide === guide.id ? 'Hide' : 'View'}</Text>
            </TouchableOpacity>

            {activeGuide === guide.id && (
              <View className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800">
                <View className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  <guide.AnimationComponent />
                </View>
                <Text className="text-slate-900 dark:text-white font-bold text-lg mb-3">Steps</Text>
                {guide.steps.map((step, index) => (
                  <View key={index} className="flex-row mb-3 last:mb-0">
                    <View className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center mr-3">
                      <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs">{index + 1}</Text>
                    </View>
                    <Text className="flex-1 text-slate-700 dark:text-slate-300 leading-5">{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom Offline Animations using React Native Animated API

function CPRAnimation() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 300, // Roughly 100 compressions per minute
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View className="items-center justify-center w-full h-full relative">
      <Text className="absolute top-2 right-2 text-slate-400 dark:text-slate-500 text-xs font-bold">~100 BPM Pace</Text>
      <View className="items-center justify-center">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg">
               <Text className="text-white font-black text-xl">PUSH</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function PressureAnimation() {
  const pressureAnim = useRef(new Animated.Value(1)).current;
  const opacAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pressureAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(pressureAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ]),
      ])
    ).start();
  }, [pressureAnim, opacAnim]);

  return (
    <View className="items-center justify-center w-full h-full relative">
      <Animated.View style={{ transform: [{ scale: pressureAnim }], opacity: opacAnim }}>
        <View className="w-32 h-16 rounded-full bg-red-500/20 border-4 border-red-500 items-center justify-center">
          <Text className="text-red-500 font-bold">Apply Pressure</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function HeimlichAnimation() {
  const upAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(upAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500)
      ])
    ).start();
  }, [upAnim]);

  return (
    <View className="items-center justify-center w-full h-full relative">
      <View className="w-12 h-32 bg-slate-300 dark:bg-slate-700 rounded-full" />
      <Animated.View style={{ transform: [{ translateY: upAnim }], position: 'absolute', top: 80, zIndex: 10 }}>
        <View className="w-16 h-8 bg-orange-500 rounded-full items-center justify-center shadow-sm">
          <Text className="text-white text-xs font-bold">Thrust</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function BurnAnimation() {
  const flowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 50,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 0, // instant reset
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [flowAnim]);

  return (
    <View className="items-center justify-center w-full h-full relative">
      <View className="w-24 h-6 bg-orange-200 dark:bg-orange-900/50 rounded-full mb-8 relative overflow-hidden">
        <Text className="text-center text-xs text-orange-600 mt-1">Burn Area</Text>
      </View>
      <Animated.View style={{ transform: [{ translateY: flowAnim }], position: 'absolute', top: 20 }}>
        <View className="w-8 h-8 rounded-full bg-blue-400 opacity-50" />
      </Animated.View>
      <Text className="absolute top-4 right-4 text-slate-400 text-xs">Run Cool Water</Text>
    </View>
  );
}

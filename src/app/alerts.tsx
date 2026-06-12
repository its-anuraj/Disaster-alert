import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Clock, Navigation } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export default function Alerts() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getEventTypeName = (code: string) => {
    if (!code) return t('warning');
    const types: Record<string, string> = {
      'FL': t('flood'),
      'EQ': t('earthquake'),
      'TC': t('cyclone'),
      'DR': t('drought'),
      'VO': t('volcano'),
      'WF': t('wildfire'),
      'TS': t('tsunami')
    };
    return types[code] || code;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?version=4');
        const data = await res.json();
        
        if (data && data.features) {
          // Filter unique events by eventid to prevent duplicate keys and duplicate alerts
          const uniqueFeatures: any[] = Array.from(new Map(data.features.map((f: any) => [f.properties.eventid, f])).values());
          const liveAlerts = uniqueFeatures.slice(0, 10).map((feature: any, index: number) => {
            const props = feature.properties;
            const isHigh = props.alertscore > 1.5;
            return {
              id: (props.eventid?.toString() || Math.random().toString()) + '_' + index,
              type: getEventTypeName(props.eventtype),
              severity: isHigh ? t('high') : t('medium'),
              desc: props.eventname || t('disasterEvent'),
              distance: t('global'),
              time: props.fromdate ? new Date(props.fromdate).toLocaleDateString() : t('recent'),
              color: isHigh ? 'bg-red-500' : 'bg-orange-500',
              textColor: isHigh ? 'text-red-500' : 'text-orange-500',
              bgLight: isHigh ? 'bg-red-500/10' : 'bg-orange-500/10',
              url: typeof props.url === 'string' ? props.url : (props.url?.report || props.url?.details || null)
            };
          });
          setAlerts(liveAlerts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4">
      <View className="py-4">
        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('disasterAlerts')}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {alerts.map((alert) => (
            <TouchableOpacity 
              key={alert.id} 
              activeOpacity={0.8}
              onPress={() => {
                if (alert.url) {
                  Linking.openURL(alert.url);
                }
              }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-4 shadow-sm"
            >
              <View className={`h-1.5 ${alert.color}`} />
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className={`w-10 h-10 rounded-full ${alert.bgLight} items-center justify-center mr-3`}>
                      <AlertTriangle color={alert.severity === t('high') ? '#ef4444' : '#f97316'} size={20} />
                    </View>
                    <Text className="text-slate-900 font-bold text-lg flex-1">{alert.type} {t('warning')}</Text>
                  </View>
                  <View className={`${alert.bgLight} px-3 py-1 rounded-full`}>
                    <Text className={`${alert.textColor} font-bold text-xs`}>{alert.severity}</Text>
                  </View>
                </View>
                
                <Text className="text-slate-600 text-sm mb-5 leading-relaxed">{alert.desc}</Text>

                <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-4">
                      <Navigation color="#94a3b8" size={14} className="mr-1.5" />
                      <Text className="text-slate-500 text-xs font-bold">{alert.distance}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock color="#94a3b8" size={14} className="mr-1.5" />
                      <Text className="text-slate-500 text-xs font-bold">{alert.time}</Text>
                    </View>
                  </View>
                  
                  {alert.url && (
                    <Text className="text-blue-500 font-bold text-xs">{t('readMore')} ➔</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

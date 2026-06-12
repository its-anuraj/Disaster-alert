import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('disasters', {
      name: 'Disaster Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // For local notifications, we don't strictly need an Expo push token, 
    // but this ensures permissions are granted.
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendDisasterAlert(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // trigger immediately
  });

  // Check auto-flashlight logic
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    // Night time - simulate flashlight
    Alert.alert(
      "Auto-Flashlight Triggered",
      "Because of a severe alert at night, your flashlight would automatically turn on! (Requires Native module in production)"
    );
  }
}

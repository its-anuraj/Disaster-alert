// Notifications have been removed because expo-notifications crashes in Expo Go SDK 53
export const sendDisasterAlert = async (title: string, body: string) => {
  console.log("Mock Notification: ", title, body);
};

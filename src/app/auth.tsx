import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isSignInLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setSignInActive({ session: completeSignIn.createdSessionId });
      router.replace('/');
    } catch (err: any) {
      alert(err.errors[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const onSignUpPress = async () => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      alert(err.errors[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setSignUpActive({ session: completeSignUp.createdSessionId });
      router.replace('/');
    } catch (err: any) {
      alert(err.errors[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft className="text-slate-900 dark:text-white" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">{isLogin ? t('signIn') : t('createAccount')}</Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">{isLogin ? t('welcomeBack') : t('joinApp')}</Text>
          <Text className="text-slate-600 dark:text-slate-400 mb-8">{isLogin ? "Log in to view your reports and medical ID." : "Sign up to report incidents and help others."}</Text>

          {!pendingVerification && (
            <>
              <View className="mb-4">
                <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">{t('email')}</Text>
                <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                  <Mail color="#64748b" size={20} className="mr-3" />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748b"
                    onChangeText={(email) => setEmailAddress(email)}
                    className="flex-1 text-slate-900 dark:text-white"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">{t('password')}</Text>
                <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                  <Lock color="#64748b" size={20} className="mr-3" />
                  <TextInput
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    className="flex-1 text-slate-900 dark:text-white"
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={isLogin ? onSignInPress : onSignUpPress}
                disabled={loading}
                className="bg-blue-600 rounded-2xl py-4 items-center justify-center mb-6 flex-row shadow-sm"
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">{isLogin ? t('signIn') : t('createAccount')}</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="items-center">
                <Text className="text-slate-600 dark:text-slate-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text className="text-blue-600 dark:text-blue-400 font-bold">{isLogin ? "Sign Up" : "Sign In"}</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {pendingVerification && (
            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">{t('verificationCode')}</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-4 ml-1">We sent a code to {emailAddress}</Text>
              <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 mb-6 shadow-sm">
                <TextInput
                  value={code}
                  placeholder="Enter code"
                  placeholderTextColor="#64748b"
                  onChangeText={(code) => setCode(code)}
                  className="flex-1 text-slate-900 dark:text-white"
                />
              </View>
              <TouchableOpacity 
                onPress={onPressVerify}
                disabled={loading}
                className="bg-green-600 rounded-2xl py-4 items-center justify-center mb-6 flex-row shadow-sm"
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">{t('verifyEmail')}</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPendingVerification(false)}
                className="items-center py-2"
              >
                <Text className="text-slate-600 dark:text-slate-400 font-bold">{t('goBack')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

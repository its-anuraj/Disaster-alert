import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  
  const [isLogin, setIsLogin] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
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
      router.replace('/profile');
    } catch (err: any) {
      Alert.alert("Error", err.errors[0]?.message || "Failed to sign in");
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
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert("Error", err.errors[0]?.message || "Failed to sign up");
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
      router.replace('/profile');
    } catch (err: any) {
      Alert.alert("Error", err.errors[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center p-4 border-b border-slate-200 bg-white shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#0f172a" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">{isLogin ? t('signIn') : t('createAccount')}</Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <Text className="text-3xl font-black text-slate-900 mb-2">{isLogin ? t('welcomeBack') : t('joinApp')}</Text>
          <Text className="text-slate-600 mb-8">{isLogin ? "Log in to view your reports and medical ID." : "Sign up to report incidents and help others."}</Text>

          {!pendingVerification && (
            <>
              <View className="mb-4">
                <Text className="text-slate-700 font-bold mb-2 ml-1">{t('email')}</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <Mail color="#64748b" size={20} className="mr-3" />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748b"
                    onChangeText={(email) => setEmailAddress(email)}
                    className="flex-1 text-slate-900"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-slate-700 font-bold mb-2 ml-1">{t('password')}</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <Lock color="#64748b" size={20} className="mr-3" />
                  <TextInput
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    className="flex-1 text-slate-900"
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
                <Text className="text-slate-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text className="text-blue-600 font-bold">{isLogin ? "Sign Up" : "Sign In"}</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {pendingVerification && (
            <View>
              <Text className="text-slate-700 font-bold mb-2 ml-1">{t('verificationCode')}</Text>
              <Text className="text-slate-500 text-xs mb-4 ml-1">We sent a code to {emailAddress}</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6">
                <TextInput
                  value={code}
                  placeholder="Enter code"
                  placeholderTextColor="#64748b"
                  onChangeText={(code) => setCode(code)}
                  className="flex-1 text-slate-900"
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
                <Text className="text-slate-600 font-bold">{t('goBack')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    home: 'Home',
    alerts: 'Alerts',
    sos: 'SOS',
    map: 'Map',
    profile: 'Profile',
    currentLocation: 'Current Location',
    lowRisk: 'Low Risk',
    smartAssistant: 'Smart Emergency Assistant',
    tapToAlert: 'TAP TO ALERT',
    survivalGuides: 'Survival Guides',
    offlineTips: 'Offline tips',
    aiAssistant: 'AI Assistant',
    chat: 'Chat',
    disasterAlerts: 'Disaster Alerts',
    emergencySOS: 'Emergency SOS',
    getHelp: 'Get immediate help when you need it',
    call112: 'Call 112',
    emergencyServices: 'Emergency Services',
    messageFamily: 'Message Family',
    shareLiveLocation: 'Share live location',
    nearbyShelters: 'Nearby Shelters',
    findSafeZones: 'Find safe zones',
    account: 'Account',
    medicalId: 'Medical ID',
    myIncidentReports: 'My Incident Reports',
    settings: 'Settings',
    flashlight: 'Flashlight',
    loudSiren: 'Loud Siren',
    humidity: 'Humidity',
    wind: 'Wind',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back',
    joinApp: 'Join DisasterShield',
    email: 'Email',
    password: 'Password',
    goBack: 'Go Back',
    verifyEmail: 'Verify Email',
    warning: 'Warning',
    global: 'Global',
    recent: 'Recent',
    tapMapToRoute: 'Tap anywhere on the map to find a route',
    guestAccount: 'Guest Account',
    loginSignUp: 'Log In / Sign Up',
    emergencyToolkit: 'Emergency Toolkit',
    language: 'Language',
    switchLanguage: 'Switch to Hindi / English',
    viewManageReports: 'View and manage reports',
    logOut: 'Log Out',
    signOutDesc: 'Sign out of your account',
    locating: 'Locating...',
    loadingMap: 'Loading Map & Route...',
    askQuestion: 'Ask a question...',
    incidentReports: 'Incident Reports',
    reportIncident: 'Report an Incident',
    submitReport: 'Submit Report',
    gpsNotice: 'Your GPS location will be automatically attached if permission is granted.',
    recentReports: 'Recent Reports',
    noReports: 'No incidents reported yet.',
    titlePlaceholder: 'Incident Title',
    descPlaceholder: 'Describe the situation...',
    high: 'High',
    medium: 'Medium',
    disasterEvent: 'Disaster Event',
    flood: 'Flood',
    earthquake: 'Earthquake',
    cyclone: 'Cyclone',
    drought: 'Drought',
    volcano: 'Volcano',
    wildfire: 'Wildfire',
    tsunami: 'Tsunami',
    readMore: 'Read Full Report',
    familyContacts: 'Family Contacts',
    addContact: 'Add Contact',
    familyContacts: 'Family Contacts',
    addContact: 'Add Contact',
    phoneNumber: 'Phone Number',
    earthquakeTitle: 'Earthquake',
    earthquakeDesc: 'Drop to your hands and knees. Cover your head and neck under a sturdy table or desk. Hold on until the shaking stops. Stay away from windows and heavy furniture.',
    earthquakeTips: 'Drop, Cover, and Hold On.\nStay away from glass, windows, outside doors and walls.\nDo not use elevators.\nIf outdoors, move away from buildings, streetlights, and utility wires.',
    floodTitle: 'Flood',
    floodDesc: 'Immediately move to higher ground. Never walk, swim, or drive through floodwaters. 6 inches of moving water can knock you down.',
    floodTips: 'Move to higher ground immediately.\nDo not walk, swim, or drive through flood waters (Turn Around, Don\'t Drown!).\nStay off of bridges over fast-moving water.\nEvacuate if told to do so.',
    fireTitle: 'Fire',
    fireDesc: 'Get out immediately and stay out. Crawl low under smoke to avoid toxic gases. Once outside, call emergency services. Never use elevators.',
    tornadoTitle: 'Tornado',
    tornadoDesc: 'Seek shelter in a basement, storm cellar, or an interior room with no windows on the lowest floor. Protect your head and neck.',
    hurricaneTitle: 'Hurricane / Cyclone',
    hurricaneTips: 'Stay indoors and away from windows and glass doors.\nClose all interior doors, secure and brace external doors.\nTake refuge in a small interior room, closet, or hallway on the lowest level.\nDo not go outside until the storm has completely passed.',
    weatherForecast: 'Weather Forecast',
    fourteenDayData: '14-Day Rain & Weather Data',
    weatherForecastTitle: '14-Day Weather Forecast',
    fetchingWeather: 'Fetching weather data...',
    today: 'Today',
    tomorrow: 'Tomorrow',
    rainProb: 'Rain',
    loadError: 'Could not load weather data.'
  },
  hi: {
    home: 'होम',
    alerts: 'अलर्ट',
    sos: 'एसओएस (SOS)',
    map: 'नक्शा',
    profile: 'प्रोफ़ाइल',
    currentLocation: 'वर्तमान स्थान',
    lowRisk: 'कम ख़तरा',
    smartAssistant: 'स्मार्ट आपातकालीन सहायक',
    tapToAlert: 'अलर्ट के लिए टैप करें',
    survivalGuides: 'बचाव गाइड',
    offlineTips: 'ऑफ़लाइन टिप्स',
    aiAssistant: 'एआई (AI) सहायक',
    chat: 'बातचीत',
    disasterAlerts: 'आपदा अलर्ट',
    emergencySOS: 'आपातकालीन एसओएस',
    getHelp: 'ज़रूरत पड़ने पर तुरंत मदद पाएं',
    call112: '112 डायल करें',
    emergencyServices: 'आपातकालीन सेवाएं',
    messageFamily: 'परिवार को संदेश भेजें',
    shareLiveLocation: 'लाइव लोकेशन शेयर करें',
    nearbyShelters: 'आसपास के शेल्टर',
    findSafeZones: 'सुरक्षित जगह खोजें',
    account: 'खाता',
    medicalId: 'मेडिकल आईडी',
    myIncidentReports: 'मेरी घटना रिपोर्ट',
    settings: 'सेटिंग्स',
    flashlight: 'टॉर्च',
    loudSiren: 'तेज़ सायरन',
    humidity: 'नमी',
    wind: 'हवा',
    signIn: 'लॉग इन (Sign In)',
    createAccount: 'खाता बनाएँ',
    welcomeBack: 'वापसी पर स्वागत है',
    joinApp: 'DisasterShield से जुड़ें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    goBack: 'पीछे जाएँ',
    verifyEmail: 'ईमेल वेरिफाई करें',
    warning: 'चेतावनी',
    global: 'वैश्विक',
    recent: 'हाल ही में',
    tapMapToRoute: 'रास्ता खोजने के लिए नक्शे पर कहीं भी टैप करें',
    guestAccount: 'अतिथि खाता',
    loginSignUp: 'लॉग इन / साइन अप',
    emergencyToolkit: 'आपातकालीन टूलकिट',
    language: 'भाषा',
    switchLanguage: 'हिंदी / अंग्रेजी में बदलें',
    viewManageReports: 'रिपोर्ट देखें और प्रबंधित करें',
    logOut: 'लॉग आउट',
    signOutDesc: 'अपने खाते से साइन आउट करें',
    getHelp: 'तुरंत मदद प्राप्त करें।',
    locating: 'पता लगा रहा है...',
    loadingMap: 'नक्शा और रास्ता लोड हो रहा है...',
    askQuestion: 'कोई सवाल पूछें...',
    incidentReports: 'घटना की रिपोर्ट',
    reportIncident: 'घटना की रिपोर्ट करें',
    submitReport: 'रिपोर्ट जमा करें',
    gpsNotice: 'अनुमति मिलने पर आपका जीपीएस स्थान स्वचालित रूप से जुड़ जाएगा।',
    recentReports: 'हाल की रिपोर्ट',
    noReports: 'अभी तक कोई घटना रिपोर्ट नहीं की गई है।',
    titlePlaceholder: 'घटना का शीर्षक',
    descPlaceholder: 'स्थिति का वर्णन करें...',
    high: 'उच्च',
    medium: 'मध्यम',
    disasterEvent: 'आपदा घटना',
    flood: 'बाढ़',
    earthquake: 'भूकंप',
    cyclone: 'चक्रवात',
    drought: 'सूखा',
    volcano: 'ज्वालामुखी',
    wildfire: 'जंगल की आग',
    tsunami: 'सुनामी',
    readMore: 'पूरी रिपोर्ट पढ़ें',
    familyContacts: 'परिवार के संपर्क',
    addContact: 'जोड़ें',
    phoneNumber: 'फोन नंबर',
    earthquakeTitle: 'भूकंप (Earthquake)',
    earthquakeDesc: 'तुरंत ज़मीन पर बैठ जाएं। किसी मज़बूत मेज़ के नीचे छिपकर अपने सिर और गर्दन को बचाएं। जब तक झटके न रुकें, कसकर पकड़ें। खिड़कियों से दूर रहें।',
    earthquakeTips: 'तुरंत ज़मीन पर बैठ जाएं (Drop, Cover, Hold)।\nकांच, खिड़कियों, बाहरी दरवाजों और दीवारों से दूर रहें।\nलिफ्ट का इस्तेमाल न करें।\nअगर आप बाहर हैं, तो इमारतों, स्ट्रीटलाइट्स और तारों से दूर रहें।',
    floodTitle: 'बाढ़ (Flood)',
    floodDesc: 'तुरंत किसी ऊंचे स्थान पर चले जाएं। बहते हुए पानी में कभी पैदल न चलें या गाड़ी न चलाएं। 6 इंच पानी भी आपको गिरा सकता है।',
    floodTips: 'तुरंत किसी ऊंचे स्थान पर चले जाएं।\nबाढ़ के पानी में पैदल न चलें, न तैरें और न ही गाड़ी चलाएं।\nतेज बहते पानी के ऊपर बने पुलों से दूर रहें।\nअगर निर्देश मिले तो तुरंत जगह खाली कर दें।',
    fireTitle: 'आग (Fire)',
    fireDesc: 'तुरंत बाहर निकलें और बाहर ही रहें। धुएं से बचने के लिए ज़मीन पर रेंगते हुए बाहर जाएं। लिफ्ट का प्रयोग बिल्कुल न करें।',
    tornadoTitle: 'तूफ़ान (Tornado)',
    tornadoDesc: 'बेसमेंट या सबसे निचली मंज़िल के बिना खिड़की वाले कमरे में जाएं। अपने सिर और गर्दन को अपने हाथों या गद्दे से सुरक्षित करें।',
    hurricaneTitle: 'तूफान (Cyclone)',
    hurricaneTips: 'घर के अंदर रहें और खिड़कियों व कांच के दरवाजों से दूर रहें।\nअंदर के सभी दरवाजे बंद कर दें, बाहरी दरवाजों को सुरक्षित करें।\nसबसे निचले स्तर पर किसी छोटे अंदरूनी कमरे, कोठरी या दालान में शरण लें।\nतूफान पूरी तरह से गुजर जाने तक बाहर न जाएं।',
    weatherForecast: 'मौसम पूर्वानुमान',
    fourteenDayData: '14 दिन का बारिश और मौसम का डेटा',
    weatherForecastTitle: '14 दिन का मौसम पूर्वानुमान',
    fetchingWeather: 'मौसम का डेटा लाया जा रहा है...',
    today: 'आज',
    tomorrow: 'कल',
    rainProb: 'बारिश',
    loadError: 'मौसम का डेटा लोड नहीं हो सका।'
  }
};

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

type LanguageContextType = {
  locale: string;
  setLocale: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState(i18n.locale);

  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((lang) => {
      if (lang) {
        i18n.locale = lang;
        setLocaleState(lang);
      }
    });
  }, []);

  const setLocale = (lang: string) => {
    i18n.locale = lang;
    setLocaleState(lang);
    AsyncStorage.setItem('appLanguage', lang);
  };

  const t = (key: string) => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

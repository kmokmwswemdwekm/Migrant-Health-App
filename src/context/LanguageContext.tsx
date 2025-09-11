import React, { createContext, useContext } from 'react';

interface LanguageContextType {
  language: string;
  changeLanguage: (language: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation helper
export const translations = {
  malayalam: {
    welcome: 'സ്വാഗതം',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    family: 'കുടുംബം',
    tests: 'പരിശോധനകൾ',
    notifications: 'അറിയിപ്പുകൾ',
    healthReport: 'ആരോഗ്യ റിപ്പോർട്ട്',
    emergency: 'അത്യാഹിതം',
    login: 'പ്രവേശിക്കുക',
    signup: 'രജിസ്റ്റർ ചെയ്യുക',
    phone: 'ഫോൺ നമ്പർ',
    password: 'പാസ്‌വേഡ്',
    name: 'പേര്',
    save: 'സംരക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    addFamilyMember: 'കുടുംബാംഗം ചേർക്കുക',
    scheduleTest: 'പരിശോധന ഷെഡ്യൂൾ ചെയ്യുക',
    emergencyAlert: 'അത്യാഹിത അലേർട്ട്',
    healthStatus: 'ആരോഗ്യ സ്ഥിതി',
    upcomingTests: 'വരാനിരിക്കുന്ന പരിശോധനകൾ'
  },
  hindi: {
    welcome: 'स्वागत',
    dashboard: 'डैशबोर्ड',
    family: 'परिवार',
    tests: 'जांच',
    notifications: 'सूचनाएं',
    healthReport: 'स्वास्थ्य रिपोर्ट',
    emergency: 'आपातकाल',
    login: 'लॉग इन',
    signup: 'साइन अप',
    phone: 'फोन नंबर',
    password: 'पासवर्ड',
    name: 'नाम',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    addFamilyMember: 'परिवारी सदस्य जोड़ें',
    scheduleTest: 'जांच शेड्यूल करें',
    emergencyAlert: 'आपातकालीन अलर्ट',
    healthStatus: 'स्वास्थ्य की स्थिति',
    upcomingTests: 'आगामी जांच'
  },
  bengali: {
    welcome: 'স্বাগতম',
    dashboard: 'ড্যাশবোর্ড',
    family: 'পরিবার',
    tests: 'পরীক্ষা',
    notifications: 'বিজ্ঞপ্তি',
    healthReport: 'স্বাস্থ্য রিপোর্ট',
    emergency: 'জরুরি',
    login: 'লগ ইন',
    signup: 'সাইন আপ',
    phone: 'ফোন নম্বর',
    password: 'পাসওয়ার্ড',
    name: 'নাম',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    addFamilyMember: 'পরিবারের সদস্য যোগ করুন',
    scheduleTest: 'পরীক্ষার সময় নির্ধারণ করুন',
    emergencyAlert: 'জরুরি সতর্কতা',
    healthStatus: 'স্বাস্থ্যের অবস্থা',
    upcomingTests: 'আসন্ন পরীক্ষা'
  },
  english: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    family: 'Family',
    tests: 'Tests',
    notifications: 'Notifications',
    healthReport: 'Health Report',
    emergency: 'Emergency',
    login: 'Login',
    signup: 'Sign Up',
    phone: 'Phone Number',
    password: 'Password',
    name: 'Name',
    save: 'Save',
    cancel: 'Cancel',
    addFamilyMember: 'Add Family Member',
    scheduleTest: 'Schedule Test',
    emergencyAlert: 'Emergency Alert',
    healthStatus: 'Health Status',
    upcomingTests: 'Upcoming Tests'
  }
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    const lang = language as keyof typeof translations;
    const translation = translations[lang];
    if (!translation) {
      return translations.english[key as keyof typeof translations.english] || key;
    }
    return translation[key as keyof typeof translation] || key;
  };

  return { t };
};
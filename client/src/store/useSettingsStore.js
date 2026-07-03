import { create } from 'zustand';

const translations = {
  en: {
    newChat: "New Chat",
    aiToolsRoom: "AI Tools Room",
    recent: "Recent",
    noRecentChats: "No recent chats.",
    profileSettings: "Profile Settings",
    logOut: "Log Out",
    renameChat: "Rename Chat",
    deleteChat: "Delete Chat",
    saveTitle: "Save Title",
    cancel: "Cancel",
    deleteConfirmation: "Are you sure you want to delete this chat permanently? This action cannot be undone.",
    confirmDelete: "Delete Chat",
    welcomeTitle: "Welcome to AI Assistant",
    welcomeSubtitle: "Type a message, speak your voice, or upload/drop a TXT, CSV, or PDF file to begin analysis!",
    placeholder: "Ask AI Assistant or analyze files...",
    processing: "AI is processing your query...",
    mutePlayback: "Mute Playback",
    unmutePlayback: "Unmute Playback",
    readResponse: "Read Response",
    pauseReading: "Pause Reading",
    stopReading: "Stop Reading",
    startVoice: "Start Voice Recording",
    stopVoice: "Stop Voice Recording",
    settings: "Settings",
    preferences: "Preferences",
    theme: "Theme",
    language: "Language",
    notifications: "Notifications",
    saveChanges: "Save Changes",
    resetSettings: "Reset Settings",
    dark: "Dark Mode",
    light: "Light Mode",
    system: "System Default",
    savedMsg: "Settings saved successfully!",
    resetMsg: "Settings reset to defaults.",
    english: "English",
    tamil: "Tamil",
    hindi: "Hindi",
    dragDropOverlay: "Drop File to Upload",
    dragDropLimit: "Supports CSV, TXT, and PDF files (Max 10MB)",
  },
  ta: {
    newChat: "புதிய அரட்டை",
    aiToolsRoom: "AI கருவிகள் அறை",
    recent: "சமீபத்திய",
    noRecentChats: "சமீபத்திய அரட்டைகள் இல்லை.",
    profileSettings: "சுயவிவர அமைப்புகள்",
    logOut: "வெளியேறு",
    renameChat: "பெயர் மாற்று",
    deleteChat: "அரட்டையை நீக்கு",
    saveTitle: "தலைப்பைச் சேமி",
    cancel: "ரத்து செய்",
    deleteConfirmation: "இந்த அரட்டையை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இந்தச் செயலை மாற்ற முடியாது.",
    confirmDelete: "நீக்கு",
    welcomeTitle: "AI உதவியாளருக்கு வரவேற்கிறோம்",
    welcomeSubtitle: "பகுப்பாய்வைத் தொடங்க ஒரு செய்தியைத் தட்டச்சு செய்யவும், பேசவும் அல்லது கோப்பை பதிவேற்றவும்!",
    placeholder: "AI உதவியாளரிடம் கேளுங்கள் அல்லது கோப்புகளைப் பகுப்பாய்வு செய்யுங்கள்...",
    processing: "AI உங்கள் வினவலைச் செயலாக்குகிறது...",
    mutePlayback: "ஒலியை முடக்கு",
    unmutePlayback: "ஒலியை இயக்கு",
    readResponse: "பதில் வாசி",
    pauseReading: "வாசிப்பை நிறுத்து",
    stopReading: "வாசிப்பை முடக்கு",
    startVoice: "குரல் பதிவைத் தொடங்கு",
    stopVoice: "குரல் பதிவை நிறுத்து",
    settings: "அமைப்புகள்",
    preferences: "விருப்பங்கள்",
    theme: "தீம்",
    language: "மொழி",
    notifications: "அறிவிப்புகள்",
    saveChanges: "மாற்றங்களைச் சேமி",
    resetSettings: "அமைப்புகளை மீட்டமை",
    dark: "இருண்ட பயன்முறை",
    light: "ஒளி பயன்முறை",
    system: "கணினி இயல்புநிலை",
    savedMsg: "அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
    resetMsg: "அமைப்புகள் மீட்டமைக்கப்பட்டன.",
    english: "ஆங்கிலம்",
    tamil: "தமிழ்",
    hindi: "இந்தி",
    dragDropOverlay: "பதிவேற்ற கோப்பை விடுங்கள்",
    dragDropLimit: "CSV, TXT மற்றும் PDF கோப்புகளை ஆதரிக்கிறது (அதிகபட்சம் 10MB)",
  },
  hi: {
    newChat: "नया चैट",
    aiToolsRoom: "AI टूल्स रूम",
    recent: "हाल का",
    noRecentChats: "कोई हालिया चैट नहीं।",
    profileSettings: "प्रोफ़ाइल सेटिंग्स",
    logOut: "लॉग आउट",
    renameChat: "चैट का नाम बदलें",
    deleteChat: "चैट हटाएं",
    saveTitle: "शीर्षक सहेजें",
    cancel: "रद्द करें",
    deleteConfirmation: "क्या आप वाकई इस चैट को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
    confirmDelete: "चैट हटाएं",
    welcomeTitle: "AI सहायक में आपका स्वागत है",
    welcomeSubtitle: "विश्लेषण शुरू करने के लिए संदेश टाइप करें, बोलें, या कोई फ़ाइल अपलोड करें!",
    placeholder: "AI सहायक से पूछें या फ़ाइलों का विश्लेषण करें...",
    processing: "AI आपके अनुरोध पर काम कर रहा है...",
    mutePlayback: "प्लेबैक म्यूट करें",
    unmutePlayback: "प्लेबैक अनम्यूट करें",
    readResponse: "प्रतिक्रिया पढ़ें",
    pauseReading: "पढ़ना रोकें",
    stopReading: "पढ़ना समाप्त करें",
    startVoice: "आवाज इनपुट शुरू करें",
    stopVoice: "आवाज इनपुट बंद करें",
    settings: "सेटिंग्स",
    preferences: "प्राथमिकताएं",
    theme: "थीम",
    language: "भाषा",
    notifications: "सूचनाएं",
    saveChanges: "परिवर्तन सहेजें",
    resetSettings: "सेटिंग्स रीसेट करें",
    dark: "डार्क मोड",
    light: "लाइट मोड",
    system: "सिस्टम डिफ़ॉल्ट",
    savedMsg: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
    resetMsg: "सेटिंग्स डिफ़ॉल्ट पर रीसेट कर दी गईं।",
    english: "अंग्रेज़ी",
    tamil: "तमिल",
    hindi: "हिन्दी",
    dragDropOverlay: "अपलोड करने के लिए फ़ाइल छोड़ें",
    dragDropLimit: "CSV, TXT और PDF फ़ाइलों का समर्थन करता है (अधिकतम 10MB)",
  }
};

const applyTheme = (themeValue) => {
  const root = document.documentElement;
  if (themeValue === 'light') {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }
};

export const useSettingsStore = create((set, get) => ({
  theme: localStorage.getItem('theme') || 'dark',
  language: localStorage.getItem('language') || 'en',
  notifications: localStorage.getItem('notifications') !== 'false', // Default true

  initialize: () => {
    // Apply initial theme
    applyTheme(get().theme);
  },

  updateSettings: (newSettings) => {
    if (newSettings.theme !== undefined) {
      localStorage.setItem('theme', newSettings.theme);
      applyTheme(newSettings.theme);
    }
    if (newSettings.language !== undefined) {
      localStorage.setItem('language', newSettings.language);
    }
    if (newSettings.notifications !== undefined) {
      localStorage.setItem('notifications', newSettings.notifications);
    }
    set(newSettings);
  },

  resetSettings: () => {
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
    set({
      theme: 'dark'
    });
  },

  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }
}));

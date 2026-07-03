import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, User as UserIcon, Check, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function SettingsModal({ isOpen, onClose }) {
  const user = useAuthStore(state => state.user);
  const storeTheme = useSettingsStore(state => state.theme);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  const resetSettings = useSettingsStore(state => state.resetSettings);
  const t = useSettingsStore(state => state.t);

  // Temporary local states for changes before saving
  const [tempTheme, setTempTheme] = useState(storeTheme);
  const [toastMessage, setToastMessage] = useState(null);

  // Update temp states when store updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setTempTheme(storeTheme);
      setToastMessage(null);
    }
  }, [isOpen, storeTheme]);

  const handleSaveChanges = () => {
    updateSettings({
      theme: tempTheme
    });
    setToastMessage({ text: t('savedMsg'), type: 'success' });
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    resetSettings();
    setTempTheme('dark');
    setToastMessage({ text: t('resetMsg'), type: 'info' });
    setTimeout(() => setToastMessage(null), 1200);
  };

  const themeOptions = [
    { id: 'light', label: t('light'), icon: Sun },
    { id: 'dark', label: t('dark'), icon: Moon }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          {/* Backdrop click closes modal */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 font-sans flex flex-col max-h-[85vh] md:max-h-[75vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-gray-800/60 bg-slate-50/50 dark:bg-gray-900/40 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('settings')}</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                 <X size={18} />
              </button>
            </div>
            
            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 relative">
               {/* Floating Save/Confirmation Toast */}
               <AnimatePresence>
                 {toastMessage && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10, x: "-50%" }}
                     animate={{ opacity: 1, y: 0, x: "-50%" }}
                     exit={{ opacity: 0, y: -10, x: "-50%" }}
                     className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-lg z-25 ${
                       toastMessage.type === 'success'
                         ? 'bg-emerald-500/10 dark:bg-emerald-950/80 border-emerald-250 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                         : 'bg-indigo-500/10 dark:bg-indigo-950/80 border-indigo-250 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                     }`}
                   >
                     {toastMessage.type === 'success' && <Check size={14} />}
                     <span>{toastMessage.text}</span>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* User Info */}
               <div className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-gray-950/30 border border-slate-200/50 dark:border-gray-800/40 rounded-2xl">
                  <div className="w-12 h-12 bg-indigo-600/10 dark:bg-indigo-550/20 border border-indigo-250/20 dark:border-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                     <UserIcon size={24} />
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-sm font-bold text-slate-850 dark:text-white truncate">{user?.name || "User"}</h3>
                     <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
               </div>

               {/* Preferences */}
               <div className="space-y-4">
                 <h4 className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t('preferences')}</h4>
                 
                 {/* Theme Switcher Toggle Pill */}
                 <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">{t('theme')}</span>
                    <div className="grid grid-cols-2 bg-slate-100/80 dark:bg-gray-950/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-gray-800/40 relative">
                       {themeOptions.map((option) => {
                          const Icon = option.icon;
                          const isActive = tempTheme === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setTempTheme(option.id)}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative z-10 ${
                                isActive 
                                  ? 'text-indigo-600 dark:text-white' 
                                  : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeThemePill"
                                  className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-slate-200/20 dark:border-gray-700/50 -z-10"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              <Icon size={16} />
                              <span>{option.label}</span>
                            </button>
                          );
                       })}
                    </div>
                 </div>
               </div>
            </div>
            
            {/* Footer Buttons (Sticky/Shrink-0) */}
            <div className="p-4 border-t border-slate-200/80 dark:border-gray-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/40 shrink-0">
               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleReset} 
                 className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-gray-750 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-xl text-xs font-bold transition-all bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-sm"
                 title="Reset theme to default"
               >
                  <RotateCcw size={14} /> {t('resetSettings')}
               </motion.button>
               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleSaveChanges} 
                 className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 dark:bg-indigo-550 dark:hover:bg-indigo-600 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/30 transition-colors"
               >
                  {t('saveChanges')}
               </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

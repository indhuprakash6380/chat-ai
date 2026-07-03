import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceControl from './VoiceControl';
import MessageBubble from './MessageBubble';
import { useSettingsStore } from '../store/useSettingsStore';

export default function ChatBox({ messages, onSendMessage, isTyping, autoRead, onAutoReadToggle }) {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);
  const t = useSettingsStore(state => state.t);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedExtensions = ['.csv', '.txt', '.pdf'];
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      alert('Invalid file type! Only CSV, TXT, and PDF files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large! Maximum file size is 10MB.');
      return;
    }

    setAttachment(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() || attachment) {
      onSendMessage(input.trim(), attachment);
      setInput('');
      setAttachment(null);
    }
  };

  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const latestAssistantMessage = assistantMessages[assistantMessages.length - 1]?.content || '';

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full w-full lg:max-w-4xl mx-auto bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl md:rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-gray-700/50 relative transition-colors duration-200"
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 z-50 flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 rounded-2xl m-3 gap-3 font-sans"
          >
            <Upload size={48} className="text-indigo-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">{t('dragDropOverlay')}</h3>
            <p className="text-xs text-gray-400">{t('dragDropLimit')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth relative z-10">
        <AnimatePresence>
          {messages.filter(m => m.role !== 'system').length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 font-sans"
            >
              <div className="w-16 h-16 bg-indigo-600/10 dark:bg-indigo-650/20 rounded-full flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-550/10">
                 <span className="text-2xl text-indigo-500">⚡</span>
              </div>
              <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">{t('welcomeTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 text-center max-w-sm px-4 leading-relaxed">{t('welcomeSubtitle')}</p>
            </motion.div>
          ) : (
            messages.filter(m => m.role !== 'system').map((msg, idx) => (
               <MessageBubble key={idx} msg={msg} />
            ))
          )}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="flex justify-start"
          >
            <div className="bg-slate-100 dark:bg-gray-800/80 backdrop-blur-md border border-slate-200 dark:border-gray-700/50 text-slate-400 dark:text-gray-400 px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-md">
               <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full"/>
               <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full"/>
               <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full"/>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-gray-900 border-t border-slate-200/80 dark:border-gray-700/50 relative z-20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-white dark:bg-gray-800/85 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700/50 p-2.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all font-sans">
          
          {attachment && (
            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 text-indigo-650 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between w-max ml-12 animate-pulse mb-1">
               <span>📎 {attachment.name}</span>
               <button 
                 type="button" 
                 onClick={() => setAttachment(null)} 
                 className="ml-3 text-red-500 hover:text-red-400 transition-colors"
                 title="Remove file"
               >
                 <X size={14} />
               </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv,.txt,.pdf" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-gray-750 transition-all p-2 rounded-full" 
              title="Upload PDF, TXT, or CSV"
            >
              <Paperclip size={18} />
            </button>
            
            <input 
              type="text"
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-gray-500 py-2 focus:outline-none text-sm"
              placeholder={isTyping ? t('processing') : t('placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            
            <VoiceControl 
              onTextRecognized={(text) => setInput(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + text)}
              textToSpeak={latestAssistantMessage}
              autoRead={autoRead}
              onAutoReadToggle={onAutoReadToggle}
            />
            
            <button 
              type="submit"
              disabled={(!input.trim() && !attachment) || isTyping}
              className="bg-indigo-650 text-white p-2.5 rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-indigo-900/30 flex items-center justify-center"
            >
              {isTyping ? (
                <div className="w-[18px] h-[18px] border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

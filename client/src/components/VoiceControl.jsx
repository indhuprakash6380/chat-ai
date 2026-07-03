import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceControl({ onTextRecognized, textToSpeak, autoRead = false, onAutoReadToggle }) {
  const [isListening, setIsListening] = useState(false);
  const [speechState, setSpeechState] = useState('stopped'); // 'stopped' | 'playing' | 'paused'
  
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTextRecognized(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied! Please enable microphone permissions in your browser settings.');
        } else if (event.error !== 'no-speech') {
          alert(`Voice Input Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [onTextRecognized]);

  const speakText = (text) => {
    window.speechSynthesis.cancel(); // Cancel any active speech

    if (!text) {
      alert('No AI response available to read.');
      return;
    }

    // Strip markdown tags for clean voice narration
    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set volume based on mute button preference
    utterance.volume = autoRead ? 1 : 0;

    utterance.onstart = () => setSpeechState('playing');
    utterance.onend = () => setSpeechState('stopped');
    utterance.onerror = () => setSpeechState('stopped');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (speechState === 'playing') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    } else if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('playing');
    } else {
      speakText(textToSpeak);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeechState('stopped');
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (speechState === 'playing') {
        window.speechSynthesis.cancel();
        setSpeechState('stopped');
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  // Synchronize utterance volume when mute/unmute state changes during playback
  useEffect(() => {
    if (utteranceRef.current && speechState === 'playing') {
      // Note: Volume updates might not register mid-utterance in all browsers,
      // but setting it is standard practice.
      utteranceRef.current.volume = autoRead ? 1 : 0;
    }
  }, [autoRead, speechState]);

  return (
    <div className="flex items-center gap-1 bg-gray-950/40 p-1 rounded-full border border-gray-700/30">
      {/* 1. MUTE BUTTON (Keep separate) */}
      <button 
        type="button"
        onClick={onAutoReadToggle}
        className={`p-2 rounded-full transition-all duration-200 ${
          autoRead 
            ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-800/60' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
        }`}
        title={autoRead ? "Mute Playback" : "Unmute Playback"}
      >
        {autoRead ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* 2. MANUAL PLAY CONTROLS WITH TOGGLE ANIMATION */}
      <div className="flex items-center gap-1">
        {/* Play/Pause Button */}
        <button 
          type="button"
          onClick={handlePlayPause}
          className={`p-2 rounded-full transition-all duration-200 ${
            speechState === 'playing'
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-900/20'
              : speechState === 'paused'
              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-950/30 border border-yellow-900/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
          title={speechState === 'playing' ? "Pause Reading" : "Read Response"}
        >
          {speechState === 'playing' ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
        </button>

        {/* Animated Stop Button */}
        <AnimatePresence>
          {speechState !== 'stopped' && (
            <motion.button 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={handleStop}
              className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/20 overflow-hidden flex items-center justify-center"
              title="Stop Reading"
            >
              <Square size={14} className="fill-current" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 3. MICROPHONE VOICE INPUT */}
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isListening && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-red-500/40 rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
        <button 
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full transition-all duration-200 relative z-10 ${
            isListening 
              ? 'bg-red-650 text-white shadow-lg shadow-red-900/20' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
          title={isListening ? "Stop Voice Recording" : "Start Voice Recording"}
        >
          {isListening ? <Mic size={16} className="animate-pulse" /> : <MicOff size={16} />}
        </button>
      </div>
    </div>
  );
}

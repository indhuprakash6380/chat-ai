import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Plus, Bot, User, Trash2, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: input,
        session_id: sessionId
      });

      const aiMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check if the backend is running properly.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <Cpu color="#6366f1" size={32} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>INGRES AI</h2>
        </div>
        
        <button className="new-chat-btn" onClick={startNewChat}>
          <Plus size={20} />
          New Chat
        </button>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* History items can go here */}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
            No recent chats
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          INGRES AI Assistant v1.0
        </div>
      </aside>

      <main className="chat-area">
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(5px)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontWeight: '500' }}>INGRES Virtual Assistant</h3>
        </header>

        <div className="messages-container">
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
              <Bot size={64} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Welcome to INGRES AI</h2>
              <p>Ask me anything about tech, science, or daily life.</p>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${msg.role}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  {msg.role === 'user' ? 'You' : 'INGRES AI'}
                </div>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="message assistant" style={{ display: 'flex', gap: '5px' }}>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              rows="1"
              placeholder="Message INGRES AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
            INGRES AI can provide information on any topic.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;

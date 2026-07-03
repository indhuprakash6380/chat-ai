import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import SettingsModal from '../components/SettingsModal';
import api from '../services/api';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [autoRead, setAutoRead] = useState(() => {
    const saved = localStorage.getItem('audioPreference');
    return saved === 'ON'; // Default to false (OFF) if not set or set to OFF
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      try {
        const { data } = await api.get('/chat');
        if (isMounted) {
          setChats(data);
          if (data.length > 0 && !activeChatId) {
            selectChat(data[0]._id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchChats();
    return () => { isMounted = false; };
  }, [activeChatId]);

  const selectChat = async (id) => {
    setActiveChatId(id);
    try {
      const { data } = await api.get(`/chat/${id}`);
      setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/chat', { title: 'New Chat' });
      setChats([data, ...chats]);
      setActiveChatId(data._id);
      setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (content, file = null) => {
    let targetChatId = activeChatId;
    if (!targetChatId) {
      const { data } = await api.post('/chat', { title: 'New Chat' });
      setChats([data, ...chats]);
      setActiveChatId(data._id);
      targetChatId = data._id;
    }
    
    // Optimistic UI update
    const userMsg = { 
      role: 'user', 
      content: content + (file ? `\n\n📎 Attachment: ${file.name}` : '') 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let responseData;
      if (file) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('file', file);
        const { data } = await api.post(`/chat/${targetChatId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        responseData = data;
      } else {
        const { data } = await api.post(`/chat/${targetChatId}/messages`, { content });
        responseData = data;
      }
      
      setMessages(responseData.messages);
      
      // Update chat title in sidebar if it was updated by AI
      setChats(prev => prev.map(c => c._id === responseData._id ? { ...c, title: responseData.title } : c));
    } catch (error) {
      console.error(error);
      alert('Failed to send message: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsTyping(false);
    }
  };

  const handleRenameChat = async (id, title) => {
    try {
      const { data } = await api.put(`/chat/${id}`, { title });
      setChats(prev => prev.map(c => c._id === id ? { ...c, title: data.title } : c));
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await api.delete(`/chat/${id}`);
      setChats(prev => prev.filter(c => c._id !== id));
      if (activeChatId === id) {
        const remainingChats = chats.filter(c => c._id !== id);
        if (remainingChats.length > 0) {
          selectChat(remainingChats[0]._id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-100 font-sans transition-colors duration-200">
        <Sidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={selectChat} 
          onNewChat={handleNewChat} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
        <div className="flex-1 flex flex-col relative w-full h-full p-0 sm:py-4 sm:pr-4">
          <ChatBox 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping} 
            autoRead={autoRead}
            onAutoReadToggle={() => {
              const nextState = !autoRead;
              setAutoRead(nextState);
              localStorage.setItem('audioPreference', nextState ? 'ON' : 'OFF');
            }}
          />
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

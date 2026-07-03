import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, LogOut, Settings, LayoutGrid, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onOpenSettings, onRenameChat, onDeleteChat }) {
  const logout = useAuthStore((state) => state.logout);
  const t = useSettingsStore((state) => state.t);
  
  const [activeMenuChatId, setActiveMenuChatId] = useState(null);
  const [renameChatId, setRenameChatId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [deleteChatId, setDeleteChatId] = useState(null);

  return (
    <div className="w-64 bg-slate-100 dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col h-full overflow-hidden text-slate-700 dark:text-gray-300 relative transition-colors duration-200">
      <div className="p-3">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-md hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors mb-2 text-slate-800 dark:text-white font-semibold shadow-sm text-sm"
        >
          <Plus size={16} />
          {t('newChat')}
        </button>
        <button 
          onClick={() => window.location.href='/tools'} 
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-center hover:bg-blue-650 hover:text-white transition-colors bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
        >
           <LayoutGrid size={15} />
           {t('aiToolsRoom')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase mb-2 tracking-wider">{t('recent')}</h3>
        {chats.length > 0 ? (
          <ul className="space-y-1 px-2">
            {chats.map(chat => (
              <li key={chat._id} className="relative group">
                <button 
                  onClick={() => onSelectChat(chat._id)}
                  className={`w-full flex items-center gap-3 pl-3 pr-10 py-3 rounded-md text-sm text-left truncate transition-colors ${activeChatId === chat._id ? 'bg-slate-200/80 dark:bg-gray-800 text-slate-900 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate pr-2">{chat.title}</span>
                </button>

                {/* Three Dot Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuChatId(activeMenuChatId === chat._id ? null : chat._id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-slate-300 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-800 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {activeMenuChatId === chat._id && (
                    <>
                      {/* Invisible backdrop to dismiss menu on click outside */}
                      <div className="fixed inset-0 z-20 cursor-default" onClick={() => setActiveMenuChatId(null)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-2 top-10 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl py-1 w-32 z-30 font-sans"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameChatId(chat._id);
                            setRenameTitle(chat.title);
                            setActiveMenuChatId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t('renameChat')}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteChatId(chat._id);
                            setActiveMenuChatId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t('deleteChat')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 text-sm text-slate-400 dark:text-gray-500">{t('noRecentChats')}</p>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-1 bg-slate-50 dark:bg-gray-900/50">
        <button onClick={onOpenSettings} className="flex items-center gap-3 px-3 py-3 rounded-md text-sm hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors text-left text-slate-600 dark:text-gray-300 font-medium">
          <Settings size={16} />
          {t('profileSettings')}
        </button>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors text-left text-red-500 font-medium"
        >
          <LogOut size={16} />
          {t('logOut')}
        </button>
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {renameChatId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setRenameChatId(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl w-full max-w-sm z-50 font-sans"
            >
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">{t('renameChat')}</h3>
              <input 
                type="text" 
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 mb-6"
                placeholder="Enter new title..."
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setRenameChatId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => {
                    if (renameTitle.trim()) {
                      onRenameChat(renameChatId, renameTitle.trim());
                      setRenameChatId(null);
                    }
                  }}
                  className="bg-indigo-650 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-md hover:shadow-indigo-900/20 transition-all"
                >
                  {t('saveTitle')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteChatId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteChatId(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl w-full max-w-sm z-50 font-sans"
            >
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">{t('deleteChat')}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">{t('deleteConfirmation')}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeleteChatId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => {
                    onDeleteChat(deleteChatId);
                    setDeleteChatId(null);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-md hover:shadow-red-900/20 transition-all"
                >
                  {t('confirmDelete')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

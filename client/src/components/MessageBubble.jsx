import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check, File } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ msg, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  // Parser for attachment marker like: \n\n📎 Attachment: filename.csv
  const attachmentRegex = /\n\n📎 Attachment: (.+)$/;
  const match = msg.content.match(attachmentRegex);
  let cleanContent = msg.content;
  let attachmentName = '';

  if (match) {
    attachmentName = match[1];
    cleanContent = msg.content.replace(attachmentRegex, '');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`relative max-w-[85%] md:max-w-[75%] p-4 rounded-2xl border transition-colors duration-200 ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm shadow-md border-blue-600' 
          : 'bg-slate-100 dark:bg-gray-800/80 backdrop-blur-md border-slate-200/80 dark:border-gray-700/50 text-slate-800 dark:text-gray-250 rounded-bl-sm shadow-xl'
      }`}>
        {/* Render markdown for AI, normal text for user */}
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{cleanContent}</p>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-2">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="bg-slate-200 dark:bg-slate-950 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900/60 rounded-xl p-4 overflow-x-auto text-xs font-mono my-2 text-indigo-600 dark:text-indigo-300">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                }
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Attachment Card */}
        {attachmentName && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700/50 rounded-xl max-w-xs transition-all duration-205 hover:border-slate-300 dark:hover:border-gray-600">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
              <File size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate" title={attachmentName}>
                {attachmentName}
              </p>
              <p className="text-[10px] text-slate-400">File uploaded & parsed</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons (Visible on Hover for Assistant) */}
        {!isUser && (
          <div className="absolute -bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg p-0.5 shadow-lg z-10">
            <button 
              type="button"
              onClick={handleCopy} 
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 rounded" 
              title="Copy text"
            >
              {copied ? <Check size={12} className="text-green-500 dark:text-green-400"/> : <Copy size={12} />}
            </button>
            <button 
              type="button"
              onClick={() => onRegenerate && onRegenerate()} 
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 rounded" 
              title="Regenerate message"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

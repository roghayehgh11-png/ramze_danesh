import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Search,
  ExternalLink,
  Bot,
  Zap
} from 'lucide-react';

export const MessagesModule: React.FC = () => {
  const { chatChannels, messages, sendMessage, currentUser } = useApp();

  const [selectedChannelId, setSelectedChannelId] = useState<string>(chatChannels[0]?.id || 'c-2');
  const [inputText, setInputText] = useState('');

  const currentChannel = chatChannels.find(c => c.id === selectedChannelId);
  const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(selectedChannelId, inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            پیام‌رسان داخلی و اطلاع‌رسانی بله (Bale API Ready)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ارسال پیام‌های گروهی، کانال‌های دوره و آمادگی اتصال مستقیم به وب‌هوک پیام‌رسان بله
          </p>
        </div>

        {/* Bale Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>آماده اتصال به ربات بله (Bale Bot Ready)</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[500px] overflow-hidden">
        {/* Channels List Side */}
        <div className="border-l border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 className="font-bold text-xs text-slate-500">کانال‌ها و گفتگوی مستقیم</h3>

          <div className="space-y-1">
            {chatChannels.map(ch => {
              const isSelected = ch.id === selectedChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {ch.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window Side */}
        <div className="md:col-span-2 flex flex-col justify-between p-4">
          {/* Active Header */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{currentChannel?.name}</h3>
              <p className="text-[10px] text-slate-400">پیام‌ها همزمان به ربات بله همگام‌سازی می‌شوند.</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 py-4 overflow-y-auto space-y-3 max-h-[380px]">
            {channelMessages.map(msg => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 max-w-[80%] ${isMe ? 'mr-auto flex-row-reverse' : ''}`}
                >
                  {msg.senderAvatar ? (
                    <img src={msg.senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                      {msg.senderName ? msg.senderName.charAt(0) : 'U'}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tl-none shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 font-bold text-[10px] opacity-80">
                      <span>{msg.senderName}</span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="پیام خود را بنویسید..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              ارسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  ExternalLink,
  Zap,
  Copy,
  Check,
  Share2,
  Users
} from 'lucide-react';

const BALE_GROUP_URL = 'https://ble.ir/join/8PR5Yn669h';

export const MessagesModule: React.FC = () => {
  const { chatChannels, messages, sendMessage, currentUser } = useApp();

  const [selectedChannelId, setSelectedChannelId] = useState<string>(chatChannels[0]?.id || 'c-bale');
  const [inputText, setInputText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const currentChannel = chatChannels.find(c => c.id === selectedChannelId);
  const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(selectedChannelId, inputText);
    setInputText('');
  };

  const handleSendAndOpenBale = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(selectedChannelId, inputText);
      setInputText('');
    }
    window.open(BALE_GROUP_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(BALE_GROUP_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            پیام‌رسان آموزشگاه و اتصال به پیام‌رسان بله
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ارسال پیام‌های سازمانی، کانال‌های ارتباطی و اتصال مستقیم به گروه رسمی آموزشگاه در بله
          </p>
        </div>

        {/* Bale Connection Indicator & Action */}
        <div className="flex items-center gap-2">
          <a
            href={BALE_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ورود مستقیم به گروه بله</span>
          </a>
        </div>
      </div>

      {/* Bale Official Group Integration Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                گروه رسمی آموزشگاه شکوه دانش در پیام‌رسان بله
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 animate-pulse" />
                متصل و فعال
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>لینک گروه:</span>
              <a
                href={BALE_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-emerald-700 dark:text-emerald-400 font-bold hover:underline dir-ltr inline-block"
              >
                ble.ir/join/8PR5Yn669h
              </a>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                (جهت تبادل پیام‌ها، هماهنگی با دانشجویان و مدرسین)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                لینک کپی شد
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                کپی لینک گروه بله
              </>
            )}
          </button>

          <a
            href={BALE_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Share2 className="w-3.5 h-3.5" />
            عضویت در گروه
          </a>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[500px] overflow-hidden">
        {/* Channels List Side */}
        <div className="border-l border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 className="font-bold text-xs text-slate-500">کانال‌ها و گروه‌ها</h3>

          <div className="space-y-1">
            {chatChannels.map(ch => {
              const isSelected = ch.id === selectedChannelId;
              const isBale = ch.id === 'c-bale' || ch.name.includes('بله');
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
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : isBale ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {isBale && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${isSelected ? 'bg-blue-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'}`}>
                      بله
                    </span>
                  )}
                  {ch.unreadCount > 0 && !isBale && (
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
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {currentChannel?.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                اتصال مستقیم به لینک بله:{' '}
                <a
                  href={BALE_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-block dir-ltr"
                >
                  ble.ir/join/8PR5Yn669h
                </a>
              </p>
            </div>

            <a
              href={BALE_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              بازکردن گروه بله
            </a>
          </div>

          {/* Messages Area */}
          <div className="flex-1 py-4 overflow-y-auto space-y-3 max-h-[380px]">
            {channelMessages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">هنوز پیامی در این بخش ثبت نشده است.</p>
                <p className="text-[11px] text-slate-400">
                  برای ارتباط سریع می‌توانید پیام خود را در کادر زیر بنویسید یا وارد گروه پیام‌رسان بله شوید.
                </p>
              </div>
            ) : (
              channelMessages.map(msg => {
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
              })
            )}
          </div>

          {/* Input Box with Bale integration */}
          <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="پیام خود را بنویسید..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 dark:text-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                ارسال داخلی
              </button>

              <button
                type="button"
                onClick={handleSendAndOpenBale}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                title="ارسال پیام و بازکردن همزمان در گروه بله"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                ارسال و بازکردن در بله
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

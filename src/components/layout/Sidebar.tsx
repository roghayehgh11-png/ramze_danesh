import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveModule } from '../../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderKanban,
  FileCheck,
  DollarSign,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  GraduationCap,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
  allowedRoles?: string[];
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, dailyReports, customerLeads, notifications, currentUser, logout } = useApp();

  const pendingReportsCount = dailyReports.filter(r => r.status === 'submitted').length;
  const newLeadsCount = customerLeads.filter(l => l.status === 'new_lead').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  let navItems: NavItem[] = [];

  if (currentUser.role === 'admin') {
    navItems = [
      { id: 'dashboard', label: 'داشبورد مدیریتی', icon: LayoutDashboard },
      { id: 'reports', label: 'گزارش کلی آموزشگاه', icon: BarChart3 },
      { id: 'users', label: 'کاربران و CRM', icon: Users, badgeCount: newLeadsCount > 0 ? newLeadsCount : undefined },
      { id: 'courses', label: 'دوره‌ها و کلاس‌ها', icon: BookOpen },
      { id: 'projects', label: 'پروژه‌ها و کانبان', icon: FolderKanban },
      { id: 'daily_reports', label: 'گزارش روزانه کارآموزان', icon: FileCheck, badgeCount: pendingReportsCount > 0 ? pendingReportsCount : undefined },
      { id: 'financial', label: 'امور مالی و حسابداری', icon: DollarSign },
      { id: 'messages', label: 'پیام‌رسان داخلی', icon: MessageSquare },
      { id: 'notifications', label: 'اعلان‌ها', icon: Bell, badgeCount: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
      { id: 'settings', label: 'تنظیمات سیستم', icon: Settings }
    ];
  } else if (currentUser.role === 'teacher') {
    navItems = [
      { id: 'courses', label: 'کلاس‌ها و دوره‌های من', icon: BookOpen },
      { id: 'financial', label: 'حقوق و امور مالی من', icon: DollarSign },
      { id: 'daily_reports', label: 'گزارش روزانه کارآموزان', icon: FileCheck, badgeCount: pendingReportsCount > 0 ? pendingReportsCount : undefined },
      { id: 'messages', label: 'پیام‌ها و ارتباطات', icon: MessageSquare },
      { id: 'notifications', label: 'اعلان‌ها و رویدادها', icon: Bell, badgeCount: unreadNotifsCount > 0 ? unreadNotifsCount : undefined }
    ];
  } else if (currentUser.role === 'intern') {
    // Intern has exactly 4 items
    navItems = [
      { id: 'daily_reports', label: 'ثبت و پیگیری گزارش روزانه', icon: FileCheck },
      { id: 'projects', label: 'پروژه‌های من', icon: FolderKanban },
      { id: 'messages', label: 'پیام‌ها و ارتباطات', icon: MessageSquare },
      { id: 'notifications', label: 'اعلان‌ها و رویدادها', icon: Bell, badgeCount: unreadNotifsCount > 0 ? unreadNotifsCount : undefined }
    ];
  } else {
    // Student has exactly 3 items
    navItems = [
      { id: 'courses', label: 'دوره‌ها و کلاس‌های من', icon: BookOpen },
      { id: 'messages', label: 'پیام‌ها و ارتباطات', icon: MessageSquare },
      { id: 'notifications', label: 'اعلان‌ها و رویدادها', icon: Bell, badgeCount: unreadNotifsCount > 0 ? unreadNotifsCount : undefined }
    ];
  }

  const filteredNavItems = navItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-l border-slate-800 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-md">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-extrabold text-sm tracking-tight leading-snug truncate">
            آموزشگاه شکوه دانش
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider truncate">
            SHOKOOH DANESH
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {filteredNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs transition-all rounded-lg font-medium ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border-r-4 border-blue-500 font-bold shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/80 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white shadow-sm'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Direct Bale Group Shortcut */}
      <div className="px-3 pb-2">
        <a
          href="https://ble.ir/join/8PR5Yn669h"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold transition-all group"
          title="ورود به گروه آموزشگاه در پیام‌رسان بله (ble.ir/join/8PR5Yn669h)"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px]">گروه آموزشگاه در بله</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Current User Quick Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/40">
        <div className="flex items-center gap-2.5 min-w-0">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full bg-slate-700 object-cover ring-2 ring-slate-700 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-slate-700">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
          )}
          <div className="flex flex-col text-xs min-w-0">
            <span className="text-white font-semibold truncate">{currentUser.name}</span>
            <span className="text-slate-400 text-[10px] truncate">
              {currentUser.role === 'admin' && 'مدیر سیستم'}
              {currentUser.role === 'teacher' && 'مدرس'}
              {currentUser.role === 'intern' && 'کارآموز'}
              {currentUser.role === 'student' && 'دانشجو'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="خروج از سیستم"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

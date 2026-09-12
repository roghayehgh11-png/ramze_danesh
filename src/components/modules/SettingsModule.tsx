import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayPersianDate, getPersianFullDateInfo } from '../../utils/dateUtils';
import { BackupModal } from '../common/BackupModal';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Building,
  Save,
  CheckCircle2,
  Mail,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    resetAllData,
    restoreBackup,
    activityLogs,
    currentUser,
    users,
    courses,
    projects,
    dailyReports,
    customerLeads,
    tuitions,
    payments,
    expenses,
    teacherSalaries
  } = useApp();

  const [academyName, setAcademyName] = useState('آموزشگاه کامپیوتر و فناوری اطلاعات شکوه دانش');
  const [managerName, setManagerName] = useState('علی هاشمی');
  const [phone, setPhone] = useState('021-88889999');
  const [address, setAddress] = useState('تهران، خیابان ولیعصر، نرسیده به ونک');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const todayPersian = getTodayPersianDate();
  const dateInfo = getPersianFullDateInfo();

  const handleDownloadBackup = () => {
    const data = {
      version: 'shokooh_danesh_v2',
      exportDate: new Date().toISOString(),
      datePersian: todayPersian,
      localStorage: { ...localStorage }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_shokooh_danesh_${todayPersian.replace(/\//g, '-')}.json`;
    a.click();
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.localStorage) {
          Object.keys(parsed.localStorage).forEach(key => {
            localStorage.setItem(key, parsed.localStorage[key]);
          });
        }
        if (parsed.data?.localStorageDump) {
          Object.keys(parsed.data.localStorageDump).forEach(key => {
            localStorage.setItem(key, parsed.data.localStorageDump[key]);
          });
        }
        restoreBackup(parsed);
        alert('اطلاعات با موفقیت بازیابی شد. صفحه بازنشانی می‌شود.');
        window.location.reload();
      } catch (err) {
        alert('خطا در خواندن فایل پشتیبان. لطفاً فایل معتبر انتخاب کنید.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            تنظیمات سیستم و مدیریت پایگاه داده
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تنظیمات عمومی آموزشگاه شکوه دانش، تاریخ شمسی، مدیریت دیتابیس و پشتیبان‌گیری هوشمند
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Database className="w-4 h-4" />
            مرکز پشتیبان‌گیری و ارسال ایمیل
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academy Info Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-blue-500" />
            اطلاعات پایه آموزشگاه
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">نام رسمی آموزشگاه</label>
              <input
                type="text"
                value={academyName}
                onChange={e => setAcademyName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">نام مدیر مسئول</label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">شماره تلفن ثابت</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">آدرس ساختمان اصلی</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() => alert('اطلاعات پایه آموزشگاه ذخیره گردید.')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              ذخیره تغییرات
            </button>
          </div>
        </div>

        {/* Database Backup & Restore Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="w-4 h-4 text-emerald-500" />
            پشتیبان‌گیری و بازنشانی دیتابیس
          </h3>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 leading-relaxed">
              شما می‌توانید از تمامی داده‌های سیستم شامل کاربران، دوره‌ها، پروژه‌ها، گزارش‌ها و حسابداری خروجی تهیه نمایید.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-all"
              >
                <Database className="w-4 h-4" />
                پشتیبان‌گیری هوشمند (امروز / بخش‌های انتخابی / ایمیل)
              </button>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                دانلود مستقیم فایل کامل پایگاه داده (JSON)
              </button>

              <label className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center gap-2 transition-all">
                <Upload className="w-4 h-4" />
                بازیابی داده‌ها از فایل JSON
                <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (confirm('آیا از ریست کامل داده‌ها به حالت اولیه مطمئن هستید؟')) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                بازنشانی دیتابیس به داده‌های پیش‌فرض اول
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-purple-500" />
          لاگ فعالیت‌های امنیتی و سیستمی (System Audit Trail)
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {activityLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span> ({log.action} - {log.module}): {log.details}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      <BackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} />
    </div>
  );
};


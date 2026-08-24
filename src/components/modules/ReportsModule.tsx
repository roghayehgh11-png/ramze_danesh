import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  FolderKanban,
  FileText
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { tuitions, payments, expenses, users, courses, projects, dailyReports, customerLeads } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<'financial' | 'students' | 'interns' | 'crm'>('financial');

  const handleExportCSV = () => {
    let headers = '';
    let rows = '';

    if (selectedReportType === 'financial') {
      headers = 'کد,نام دانشجو,دوره,شهریه کل,پرداخت شده,باقی مانده,وضعیت\n';
      rows = tuitions.map(t => `${t.id},${t.studentName},${t.courseTitle},${t.finalAmount},${t.paidAmount},${t.remainingAmount},${t.status}`).join('\n');
    } else if (selectedReportType === 'students') {
      headers = 'کد,نام,تلفن,نقش,تاریخ ورود\n';
      rows = users.map(u => `${u.id},${u.name},${u.phone},${u.role},${u.joinDate}`).join('\n');
    } else if (selectedReportType === 'crm') {
      headers = 'کد,نام متقاضی,تلفن,دوره,کانال آشنایی,وضعیت\n';
      rows = customerLeads.map(l => `${l.id},${l.fullName},${l.phone},${l.interestedCourseCategory},${l.referralSource},${l.status}`).join('\n');
    }

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `گزارش_${selectedReportType}_آموزشگاه_شکوه_دانش.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            مرکز گزارش‌های مدیریتی و خروجی‌های رسمی
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            استخراج فایل اکسل (CSV) و فایل قابل چاپ (Print/PDF) از تمام بخش‌های آماری آموزشگاه
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            دانلود فایل اکسل (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            چاپ گزارش
          </button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedReportType('financial')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'financial' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          گزارش جامع مالی و شهریه‌ها
        </button>

        <button
          onClick={() => setSelectedReportType('students')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'students' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          گزارش کاربران و ثبت‌نامی‌ها
        </button>

        <button
          onClick={() => setSelectedReportType('crm')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'crm' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          گزارش جذب و لیدهای CRM
        </button>
      </div>

      {/* Report Data Table Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white">
          پیش‌نمایش جدول خروجی ({selectedReportType})
        </h3>

        <div className="overflow-x-auto">
          {selectedReportType === 'financial' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام دانشجو</th>
                  <th className="p-3">دوره آموزشی</th>
                  <th className="p-3">شهریه مصوب</th>
                  <th className="p-3">مبلغ دریافتی</th>
                  <th className="p-3">باقی مانده</th>
                  <th className="p-3">وضعیت تسویه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tuitions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{t.studentName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{t.courseTitle}</td>
                    <td className="p-3 font-mono">{t.finalAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{t.paidAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-mono text-rose-600 font-bold">{t.remainingAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-bold">{t.status === 'paid' ? 'تسویه شده' : 'بدهکار'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'students' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام کاربر</th>
                  <th className="p-3">شماره تماس</th>
                  <th className="p-3">نقش سیستم</th>
                  <th className="p-3">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{u.phone}</td>
                    <td className="p-3 font-bold text-blue-600">
                      {u.role === 'admin' ? 'مدیر کل' : u.role === 'teacher' ? 'مدرس' : u.role === 'intern' ? 'کارآموز' : 'دانشجو'}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{u.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'crm' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام متقاضی</th>
                  <th className="p-3">شماره همراه</th>
                  <th className="p-3">دوره مورد نظر</th>
                  <th className="p-3">کانال ورودی</th>
                  <th className="p-3">وضعیت پیگیری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{l.fullName}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{l.phone}</td>
                    <td className="p-3 text-blue-600">{l.interestedCourseCategory}</td>
                    <td className="p-3">{l.referralSource}</td>
                    <td className="p-3 font-bold">
                      {l.status === 'new_lead'
                        ? 'متقاضی جدید'
                        : l.status === 'in_consultation'
                        ? 'در حال مشاوره'
                        : l.status === 'registered'
                        ? 'ثبت‌نام قطعی'
                        : 'انصرافی / عدم تمایل'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

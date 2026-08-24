import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { FormattedCurrencyInput } from '../common/FormattedCurrencyInput';
import { EditableSelect } from '../common/EditableSelect';
import { getTodayPersianDate } from '../../utils/dateUtils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Receipt,
  ShieldCheck,
  User,
  X
} from 'lucide-react';

export const FinancialModule: React.FC = () => {
  const {
    currentUser,
    tuitions,
    payments,
    installments,
    expenses,
    teacherSalaries,
    addTuition,
    addPayment,
    toggleInstallmentPaid,
    addExpense,
    addTeacherSalary,
    users,
    courses
  } = useApp();

  const isTeacher = currentUser?.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'tuitions' | 'debtors' | 'expenses' | 'salaries' | 'summary' | 'teacher_my_finances'>(
    isTeacher ? 'teacher_my_finances' : 'tuitions'
  );
  const [dateFilter, setDateFilter] = useState<'7days' | '30days' | 'thisMonth' | 'all'>('7days');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddTuitionModalOpen, setIsAddTuitionModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Form states for Payment
  const [paymentStudentKey, setPaymentStudentKey] = useState('');
  const [paymentCourseTitle, setPaymentCourseTitle] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState<string>(getTodayPersianDate());
  const [payMethod, setPayMethod] = useState<string>('card');
  const [payDesc, setPayDesc] = useState('');

  // Add Tuition/Debtor form state
  const [newDebtorStudentId, setNewDebtorStudentId] = useState('');
  const [newDebtorStudentName, setNewDebtorStudentName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [newDebtorCourseId, setNewDebtorCourseId] = useState('');
  const [newDebtorCourseTitle, setNewDebtorCourseTitle] = useState('');
  const [newDebtorTotalAmount, setNewDebtorTotalAmount] = useState<number>(5000000);
  const [newDebtorDiscount, setNewDebtorDiscount] = useState<number>(0);
  const [newDebtorDate, setNewDebtorDate] = useState<string>(getTodayPersianDate());

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<string>('utilities');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseRecipient, setExpenseRecipient] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>(getTodayPersianDate());

  // Salary form state
  const [salaryTeacherId, setSalaryTeacherId] = useState('');
  const [salaryCourseTitle, setSalaryCourseTitle] = useState('');
  const [salaryAmount, setSalaryAmount] = useState<number>(0);
  const [salaryHours, setSalaryHours] = useState<number>(30);
  const [salaryDate, setSalaryDate] = useState<string>(getTodayPersianDate());

  const normalizeTeacherName = (name?: string) => {
    if (!name) return '';
    return name
      .replace(/^(استاد|مهندس|خانم|آقای|دکتر|سرکار خانم|جناب آقای)\s+/gi, '')
      .trim()
      .toLowerCase();
  };

  // Teacher specific calculations
  const myCourses = courses.filter(c => {
    const matchId = c.teacherId === currentUser.id || c.teacherId === currentUser.username;
    const cClean = normalizeTeacherName(c.teacherName);
    const uClean = normalizeTeacherName(currentUser.name);
    const matchName = Boolean(cClean && uClean && cClean === uClean);
    return matchId || matchName;
  });

  const mySalaries = teacherSalaries.filter(s => {
    const matchId = s.teacherId === currentUser.id || s.teacherId === currentUser.username;
    const sClean = normalizeTeacherName(s.teacherName);
    const uClean = normalizeTeacherName(currentUser.name);
    const matchName = Boolean(sClean && uClean && sClean === uClean);
    return matchId || matchName;
  });
  const totalSalaryPaidToMe = mySalaries.reduce((acc, s) => acc + s.amount, 0);
  
  // Total wage determined by admin when courses were created
  const totalWageDueToMe = myCourses.reduce((acc, c) => acc + (c.teacherWage || (c.price * 0.4)), 0);
  const remainingTeacherBalance = Math.max(0, totalWageDueToMe - totalSalaryPaidToMe);

  // Global Financial Calculations (for Admin)
  const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSalaries = teacherSalaries.reduce((acc, s) => acc + s.amount, 0);
  const totalOutflow = totalExpenses + totalSalaries;
  const netProfit = totalIncome - totalOutflow;

  const totalDebts = tuitions.reduce((acc, t) => acc + t.remainingAmount, 0);
  const debtorsList = tuitions.filter(t => t.remainingAmount > 0);

  // Student options for Payment modal:
  // Merging existing tuitions + registered students in users + custom typing
  const paymentStudentOptions = (() => {
    const options: { value: string; label: string }[] = [];

    // 1. From active tuitions (with debt info)
    tuitions.forEach(t => {
      options.push({
        value: `tuition_${t.id}`,
        label: `🎓 ${t.studentName} - دوره: ${t.courseTitle} (مانده بدهی: ${t.remainingAmount.toLocaleString('fa-IR')} تومان)`
      });
    });

    // 2. From all registered students and interns
    const registeredStudents = users.filter(u => u.role === 'student' || u.role === 'intern');
    registeredStudents.forEach(u => {
      // Avoid duplicate if already has a tuition option
      const alreadyInTuitions = tuitions.some(t => t.studentId === u.id);
      if (!alreadyInTuitions) {
        options.push({
          value: `user_${u.id}`,
          label: `👤 ${u.name} (${u.role === 'student' ? 'دانشجو' : 'کارآموز'}) - تماس: ${u.phone}`
        });
      }
    });

    return options;
  })();

  // Handle Payment Modal open
  const handleOpenPaymentModal = (presetTuitionId?: string) => {
    setPayDate(getTodayPersianDate());
    if (presetTuitionId) {
      const t = tuitions.find(x => x.id === presetTuitionId);
      if (t) {
        setPaymentStudentKey(`tuition_${t.id}`);
        setPaymentCourseTitle(t.courseTitle);
        setPayAmount(t.remainingAmount > 0 ? t.remainingAmount : 1000000);
      }
    } else {
      setPaymentStudentKey(paymentStudentOptions[0]?.value || '');
      const firstT = tuitions[0];
      if (firstT) {
        setPaymentCourseTitle(firstT.courseTitle);
        setPayAmount(firstT.remainingAmount > 0 ? firstT.remainingAmount : 1000000);
      } else {
        setPaymentCourseTitle('');
        setPayAmount(0);
      }
    }
    setPayMethod('card');
    setPayDesc('');
    setIsPaymentModalOpen(true);
  };

  // Submit new Tuition / Debtor
  const handleSaveAddTuition = (e: React.FormEvent) => {
    e.preventDefault();
    const student = users.find(u => u.id === newDebtorStudentId || u.name === newDebtorStudentId);
    const course = courses.find(c => c.id === newDebtorCourseId || c.title === newDebtorCourseId);

    const studentName = student ? student.name : (newDebtorStudentName || newDebtorStudentId || 'کارآموز / دانشجو');
    const studentPhone = student ? student.phone : (newDebtorPhone || '09120000000');
    const courseTitle = course ? course.title : (newDebtorCourseTitle || newDebtorCourseId || 'دوره آموزشی');
    const studentId = student ? student.id : `u-${Date.now()}`;
    const courseId = course ? course.id : `c-${Date.now()}`;

    addTuition({
      studentId,
      studentName,
      studentPhone,
      courseId,
      courseTitle,
      totalAmount: newDebtorTotalAmount,
      discountAmount: newDebtorDiscount,
      createdAt: newDebtorDate || getTodayPersianDate()
    });

    setIsAddTuitionModalOpen(false);
    setNewDebtorStudentId('');
    setNewDebtorStudentName('');
    setNewDebtorPhone('');
    setNewDebtorCourseId('');
    setNewDebtorCourseTitle('');
    setNewDebtorTotalAmount(5000000);
    setNewDebtorDiscount(0);
    setNewDebtorDate(getTodayPersianDate());
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'کد,نام دانشجو,دوره,شهریه کل,پرداخت شده,باقی مانده,وضعیت\n';
    const rows = tuitions
      .map(t => `${t.id},${t.studentName},${t.courseTitle},${t.finalAmount},${t.paidAmount},${t.remainingAmount},${t.status}`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `گزارش_مالی_آموزشگاه_شکوه_دانش_${new Date().toLocaleDateString('fa-IR')}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Submit Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStudentKey || payAmount <= 0) return;

    let targetTuitionId = '';
    let targetStudentId = '';
    let targetStudentName = '';
    let targetCourse = paymentCourseTitle || 'دوره تخصصی آموزشگاه';

    if (paymentStudentKey.startsWith('tuition_')) {
      const tid = paymentStudentKey.replace('tuition_', '');
      const tui = tuitions.find(t => t.id === tid);
      if (tui) {
        targetTuitionId = tui.id;
        targetStudentId = tui.studentId;
        targetStudentName = tui.studentName;
        targetCourse = tui.courseTitle;
      }
    } else if (paymentStudentKey.startsWith('user_')) {
      const uid = paymentStudentKey.replace('user_', '');
      const usr = users.find(u => u.id === uid);
      if (usr) {
        targetStudentId = usr.id;
        targetStudentName = usr.name;
        // Create an automatic tuition record if none existed
        const newTId = `tui-${Date.now()}`;
        addTuition({
          studentId: usr.id,
          studentName: usr.name,
          studentPhone: usr.phone,
          courseId: 'c-custom',
          courseTitle: targetCourse,
          totalAmount: payAmount,
          discountAmount: 0
        });
        targetTuitionId = newTId;
      }
    } else {
      // Custom typed student name
      targetStudentId = `u-${Date.now()}`;
      targetStudentName = paymentStudentKey;
      const newTId = `tui-${Date.now()}`;
      addTuition({
        studentId: targetStudentId,
        studentName: targetStudentName,
        studentPhone: '09120000000',
        courseId: 'c-custom',
        courseTitle: targetCourse,
        totalAmount: payAmount,
        discountAmount: 0
      });
      targetTuitionId = newTId;
    }

    addPayment({
      tuitionId: targetTuitionId || `tui-${Date.now()}`,
      studentId: targetStudentId,
      studentName: targetStudentName,
      courseTitle: targetCourse,
      amount: payAmount,
      paymentDate: payDate || getTodayPersianDate(),
      paymentMethod: (payMethod as PaymentMethod) || 'card',
      trackingCode: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      description: payDesc || `پرداخت شهریه ${targetCourse}`
    });

    setIsPaymentModalOpen(false);
    setPaymentStudentKey('');
    setPayAmount(0);
    setPayDesc('');
  };

  // Submit Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || expenseAmount <= 0) return;

    addExpense({
      title: expenseTitle,
      category: expenseCategory as any,
      amount: expenseAmount,
      date: expenseDate || getTodayPersianDate(),
      recipientName: expenseRecipient,
      description: 'ثبت شده توسط مدیریت آموزشگاه'
    });

    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseRecipient('');
    setExpenseDate(getTodayPersianDate());
  };

  // Submit Teacher Salary
  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryTeacherId || salaryAmount <= 0) return;

    const teacher = users.find(u => u.id === salaryTeacherId || u.name === salaryTeacherId);
    const tName = teacher ? teacher.name : salaryTeacherId;
    const tId = teacher ? teacher.id : `t-${Date.now()}`;

    addTeacherSalary({
      teacherId: tId,
      teacherName: tName,
      courseTitle: salaryCourseTitle || 'حق‌التدریس دوره آموزشی',
      amount: salaryAmount,
      paymentDate: salaryDate || getTodayPersianDate(),
      hoursCount: salaryHours,
      status: 'paid',
      trackingCode: `SAL-${Math.floor(10000 + Math.random() * 90000)}`
    });

    setIsSalaryModalOpen(false);
    setSalaryTeacherId('');
    setSalaryAmount(0);
    setSalaryDate(getTodayPersianDate());
  };

  // ==========================================
  // RENDER TEACHER RESTRICTED FINANCIAL VIEW
  // ==========================================
  if (isTeacher) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Teacher Financial Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Receipt className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  امور مالی و کارکرد اختصاصی استاد: {currentUser.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  مشاهده مبالغ دریافت شده، حق‌التدریس تعیین‌شده توسط مدیر برای هر دوره، و مانده بستانکاری شما
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              چاپ صورت‌حساب استاد
            </button>
          </div>
        </div>

        {/* Teacher Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Due Determined by Admin */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">کل حق‌التدریس دوره‌ها (تعیین‌شده توسط مدیر)</span>
              <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalWageDueToMe.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              مجموع مبالغ تعیین‌شده روی {myCourses.length} دوره آموزشی شما
            </p>
          </div>

          {/* Total Paid Received */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">کل مبلغ دریافت شده (تسویه‌شده)</span>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {totalSalaryPaidToMe.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              تراکنش‌های واریزشده به حساب شما ({mySalaries.length} واریزی)
            </p>
          </div>

          {/* Remaining Balance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">مانده طلب / بستانکاری شما</span>
              <span className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {remainingTeacherBalance.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              {remainingTeacherBalance > 0 ? 'در انتظار تسویه توسط حسابداری آموزشگاه' : 'تمامی دوره‌ها تسویه شده‌اند'}
            </p>
          </div>
        </div>

        {/* Section 1: Assigned Courses & Agreed Teacher Wages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              دوره‌های اختصاصی شما و دستمزد تعیین‌شده مدیریت برای هر دوره
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              تعداد دوره‌ها: {myCourses.length}
            </span>
          </div>

          {myCourses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">دوره‌ای به نام شما در سیستم ثبت نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">عنوان دوره آموزشی</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">تعداد دانشجو</th>
                    <th className="p-3">ساعت / روزهای برگزاری</th>
                    <th className="p-3 font-mono">حق‌التدریس تعیین‌شده استاد</th>
                    <th className="p-3">وضعیت دوره</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myCourses.map(c => {
                    const wage = c.teacherWage || (c.price * 0.4);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{c.title}</td>
                        <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">{c.category}</td>
                        <td className="p-3 font-mono">{c.enrolledCount} نفر</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">
                          {c.scheduleDays || (c as any).schedule?.days?.join?.('، ') || 'روزهای زوج'} ({c.scheduleTime || (c as any).schedule?.time || '16:00 - 18:00'})
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {wage.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            c.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {c.status === 'active' ? 'در حال برگزاری' : c.status === 'upcoming' ? 'به زودی' : 'تکمیل شده'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Teacher Payment Receipts History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              ریز دریافتی‌ها و فیش‌های واریز حق‌التدریس به شما
            </h3>
            <span className="text-xs text-emerald-600 font-bold font-mono">
              مجموع دریافتی: {totalSalaryPaidToMe.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {mySalaries.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <Clock className="w-8 h-8 mx-auto text-slate-300 opacity-60 mb-2" />
              <p className="text-xs font-semibold">هنوز فیش واریز حق‌التدریسی برای شما ثبت نشده است.</p>
              <p className="text-[11px]">به محض واریز توسط مدیریت، تراکنش و شماره رهگیری در اینجا درج خواهد شد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">بابت دوره</th>
                    <th className="p-3">تعداد ساعت تدریس</th>
                    <th className="p-3 font-mono">مبلغ واریزی</th>
                    <th className="p-3">شماره رهگیری / فیش</th>
                    <th className="p-3">تاریخ واریز</th>
                    <th className="p-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mySalaries.map(sal => (
                    <tr key={sal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{sal.courseTitle}</td>
                      <td className="p-3 font-mono">{sal.hoursCount} ساعت</td>
                      <td className="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {sal.amount.toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="p-3 font-mono text-slate-500">{sal.trackingCode}</td>
                      <td className="p-3 font-mono text-slate-500">{sal.paymentDate}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          واریز و تسویه شده
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER ADMIN / MANAGEMENT FINANCIAL VIEW
  // ==========================================
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            مدیریت مالی و حسابداری آموزشگاه شکوه دانش
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ثبت و پیگیری شهریه‌ها، اقساط، بدهکاران، هزینه‌های جاری و حقوق مدرسان (نمایش ۷ روز گذشته)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === '7days'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ۷ روز اخیر
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === '30days'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ۳۰ روز اخیر
            </button>
            <button
              onClick={() => setDateFilter('thisMonth')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'thisMonth'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              این ماه
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              کل تاریخچه
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            خروجی اکسل
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            چاپ
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>کل دریافتی (ورودی)</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {totalIncome.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            تراکنش‌های موفق شهریه ثبت‌شده
          </p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>کل هزینه‌ها و حقوق (خروجی)</span>
            <span className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {totalOutflow.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            اجاره، قبوض، تبلیغات و حقوق مدرسین
          </p>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>سود خالص آموزشگاه</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-xl font-black font-mono tracking-tight ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
            {netProfit.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
          </div>
          <p className="text-[11px] text-slate-500">
            تراز مالی دوره انتخابی
          </p>
        </div>

        {/* Total Debts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>کل مطالبات و بدهی دانشجویان</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            {totalDebts.toLocaleString('fa-IR')} <span className="text-xs text-slate-400 font-sans font-normal">تومان</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {debtorsList.length} پرونده دارای مانده بدهی
          </p>
        </div>
      </div>

      {/* Tabs & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tuitions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'tuitions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            شهریه‌ها و پرداخت‌ها
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'debtors'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            لیست بدهکاران
            {debtorsList.length > 0 && (
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                {debtorsList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            هزینه‌های جاری آموزشگاه
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'salaries'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            حقوق و دستمزد اساتید
          </button>
        </div>

        {/* Quick Modal Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenPaymentModal()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            ثبت پرداخت جدید
          </button>
          <button
            onClick={() => setIsAddTuitionModalOpen(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            افزودن بدهکار / شهریه
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            ثبت هزینه جاری
          </button>
          <button
            onClick={() => setIsSalaryModalOpen(true)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            ثبت حقوق مدرس
          </button>
        </div>
      </div>

      {/* Tab 1: Tuitions & Transactions */}
      {activeTab === 'tuitions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">پرونده‌های شهریه دانشجویان</h3>
              <span className="text-xs text-slate-400 font-mono">تعداد: {tuitions.length} پرونده</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">نام دانشجو</th>
                    <th className="p-3">دوره آموزشی</th>
                    <th className="p-3">مبلغ کل شهریه</th>
                    <th className="p-3">پرداخت شده</th>
                    <th className="p-3">مانده بدهی</th>
                    <th className="p-3">وضعیت تسویه</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tuitions.map(tui => (
                    <tr key={tui.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{tui.studentName}</td>
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">{tui.courseTitle}</td>
                      <td className="p-3 font-mono">{tui.finalAmount.toLocaleString('fa-IR')} تومان</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{tui.paidAmount.toLocaleString('fa-IR')} تومان</td>
                      <td className="p-3 font-mono text-amber-600 font-bold">{tui.remainingAmount.toLocaleString('fa-IR')} تومان</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tui.status === 'fully_paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tui.status === 'partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tui.status === 'fully_paid' ? 'تسویه کامل ✔' : tui.status === 'partial' ? 'پرداخت اقساطی' : 'پرداخت‌نشده'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {tui.remainingAmount > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(tui.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition-all"
                          >
                            ثبت واریزی
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Transaction Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">تراکنش‌های اخیر واریز شهریه</h3>
              <span className="text-xs text-slate-400 font-mono">تعداد: {payments.length} تراکنش</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">نام پرداخت‌کننده</th>
                    <th className="p-3">دوره</th>
                    <th className="p-3">مبلغ پرداختی</th>
                    <th className="p-3">روش پرداخت</th>
                    <th className="p-3">شماره پیگیری</th>
                    <th className="p-3">تاریخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{pay.studentName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{pay.courseTitle}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{pay.amount.toLocaleString('fa-IR')} تومان</td>
                      <td className="p-3 text-slate-500">
                        {pay.paymentMethod === 'card' ? 'کارت‌خوان / کارت به کارت' :
                         pay.paymentMethod === 'online' ? 'درگاه آنلاین' :
                         pay.paymentMethod === 'cheque' ? 'چک صیادی' : 'نقدی'}
                      </td>
                      <td className="p-3 font-mono text-slate-400">{pay.trackingCode}</td>
                      <td className="p-3 font-mono text-slate-400">{pay.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Debtors List */}
      {activeTab === 'debtors' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                لیست پرونده‌های دارای مانده بدهی شهریه
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">دانشجویان و کارآموزانی که تمام یا بخشی از شهریه آنها تسویه نشده است</p>
            </div>
            <button
              onClick={() => setIsAddTuitionModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              افزودن بدهکار جدید
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام بدهکار</th>
                  <th className="p-3">شماره تماس</th>
                  <th className="p-3">دوره آموزشی</th>
                  <th className="p-3">شهریه کل</th>
                  <th className="p-3">پرداختی تا کنون</th>
                  <th className="p-3">مانده بدهی</th>
                  <th className="p-3 text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {debtorsList.map(tui => (
                  <tr key={tui.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{tui.studentName}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{tui.studentPhone}</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">{tui.courseTitle}</td>
                    <td className="p-3 font-mono">{tui.finalAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{tui.paidAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-mono text-amber-600 font-black text-sm">{tui.remainingAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenPaymentModal(tui.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                      >
                        ثبت وصولی
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Institute Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">جدول هزینه‌های جاری آموزشگاه</h3>
              <p className="text-xs text-slate-400 mt-0.5">قبوض، اجاره، تجهیزات، تبلیغات و ملزومات مصرفی</p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              ثبت هزینه جدید
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">عنوان هزینه</th>
                  <th className="p-3">دسته‌بندی</th>
                  <th className="p-3">مبلغ هزینه</th>
                  <th className="p-3">دریافت‌کننده</th>
                  <th className="p-3">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                        {exp.category === 'rent' ? 'اجاره‌بها' :
                         exp.category === 'utilities' ? 'قبوض و اینترنت' :
                         exp.category === 'marketing' ? 'تبلیغات' :
                         exp.category === 'equipment' ? 'تجهیزات' :
                         exp.category === 'salaries' ? 'حقوق' : 'متفرقه'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-600">{exp.amount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{exp.recipientName || '---'}</td>
                    <td className="p-3 font-mono text-slate-400">{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Teacher Salaries */}
      {activeTab === 'salaries' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">حقوق و حق‌التدریس پرداخت شده به اساتید</h3>
              <p className="text-xs text-slate-400 mt-0.5">تسویه‌حساب‌های حق‌التدریس دوره‌های برگزار شده</p>
            </div>
            <button
              onClick={() => setIsSalaryModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              ثبت حقوق جدید
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">نام استاد</th>
                  <th className="p-3">دوره آموزشی</th>
                  <th className="p-3">ساعت تدریس</th>
                  <th className="p-3">مبلغ پرداختی</th>
                  <th className="p-3">کد رهگیری</th>
                  <th className="p-3">تاریخ پرداخت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teacherSalaries.map(sal => (
                  <tr key={sal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{sal.teacherName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{sal.courseTitle}</td>
                    <td className="p-3 font-mono">{sal.hoursCount} ساعت</td>
                    <td className="p-3 font-mono font-bold text-purple-600">{sal.amount.toLocaleString('fa-IR')} تومان</td>
                    <td className="p-3 font-mono text-slate-400">{sal.trackingCode}</td>
                    <td className="p-3 font-mono text-slate-400">{sal.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Payment Record */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                ثبت پرداخت شهریه دانشجو
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  انتخاب دانشجو / پرونده شهریه (یا تایپ دستی نام) *
                </label>
                <EditableSelect
                  value={paymentStudentKey}
                  onChange={val => {
                    setPaymentStudentKey(val);
                    if (val.startsWith('tuition_')) {
                      const tid = val.replace('tuition_', '');
                      const t = tuitions.find(x => x.id === tid);
                      if (t) {
                        setPaymentCourseTitle(t.courseTitle);
                        setPayAmount(t.remainingAmount > 0 ? t.remainingAmount : 1000000);
                      }
                    }
                  }}
                  options={paymentStudentOptions}
                  placeholder="انتخاب از لیست یا نوشتن نام دانشجو..."
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">عنوان دوره آموزشی</label>
                <EditableSelect
                  value={paymentCourseTitle}
                  onChange={val => setPaymentCourseTitle(val)}
                  options={courses.map(c => ({
                    value: c.title,
                    label: `${c.title} (${c.price.toLocaleString('fa-IR')} تومان)`
                  }))}
                  placeholder="انتخاب یا نوشتن عنوان دوره..."
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  مبلغ پرداختی (تومان با جداسازی ۳ رقمی) *
                </label>
                <FormattedCurrencyInput
                  value={payAmount}
                  onChange={setPayAmount}
                  required
                  placeholder="مثلاً 2,500,000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">روش پرداخت</label>
                  <EditableSelect
                    value={payMethod}
                    onChange={val => setPayMethod(val)}
                    options={[
                      { value: 'card', label: '💳 کارت‌خوان / کارت به کارت' },
                      { value: 'online', label: '🌐 درگاه آنلاین بانکی' },
                      { value: 'cash', label: '💵 نقدی' },
                      { value: 'cheque', label: '📄 چک صیادی' }
                    ]}
                    placeholder="انتخاب روش پرداخت..."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    تاریخ ثبت تراکنش (شمسی) *
                  </label>
                  <input
                    type="text"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    required
                    placeholder="۱۴۰۳/۰۵/۲۷"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1">توضیحات / بابت</label>
                <input
                  type="text"
                  placeholder="مثلاً قسط اول شهریه پایتون"
                  value={payDesc}
                  onChange={e => setPayDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  ثبت قطعی تراکنش
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Expense Record */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                ثبت هزینه جاری جدید
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">عنوان هزینه</label>
                <input
                  type="text"
                  placeholder="مثلاً خرید کابل شبکه و تجهیزات سایت ۲"
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">دسته‌بندی هزینه</label>
                <EditableSelect
                  value={expenseCategory}
                  onChange={val => setExpenseCategory(val)}
                  options={[
                    { value: 'rent', label: '🏢 اجاره‌بها و شارژ' },
                    { value: 'utilities', label: '💡 قبوض آب، برق، گاز و اینترنت' },
                    { value: 'marketing', label: '📢 تبلیغات و بازاریابی' },
                    { value: 'equipment', label: '💻 تجهیزات و ملزومات سخت‌افزاری' },
                    { value: 'salaries', label: '👥 حقوق و دستمزد پرسنل' },
                    { value: 'other', label: '✨ سایر متفرقه' }
                  ]}
                  placeholder="انتخاب یا تایپ دسته‌بندی..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    مبلغ هزینه (تومان با جداسازی ۳ رقمی) *
                  </label>
                  <FormattedCurrencyInput
                    value={expenseAmount}
                    onChange={setExpenseAmount}
                    required
                    placeholder="مثلاً 1,500,000"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    تاریخ ثبت هزینه (شمسی) *
                  </label>
                  <input
                    type="text"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    required
                    placeholder="۱۴۰۳/۰۵/۲۷"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">نام دریافت‌کننده / فروشگاه</label>
                <EditableSelect
                  value={expenseRecipient}
                  onChange={val => setExpenseRecipient(val)}
                  options={[
                    { value: 'مخابرات / شرکت اینترنت', label: 'مخابرات / شرکت اینترنت' },
                    { value: 'مالک ساختمان آموزشگاه', label: 'مالک ساختمان آموزشگاه' },
                    { value: 'فروشگاه قطعات و سخت‌افزار', label: 'فروشگاه قطعات و سخت‌افزار' },
                    { value: 'کانون تبلیغات و چاپ بنر', label: 'کانون تبلیغات و چاپ بنر' }
                  ]}
                  placeholder="انتخاب یا نوشتن نام دریافت‌کننده..."
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow"
                >
                  ثبت هزینه
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Teacher Salary */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-500" />
                ثبت حقوق و حق‌التدریس مدرس
              </h3>
              <button
                type="button"
                onClick={() => setIsSalaryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">انتخاب یا تایپ نام مدرس *</label>
                <EditableSelect
                  value={salaryTeacherId}
                  onChange={val => {
                    setSalaryTeacherId(val);
                    const teacherCourses = courses.filter(c => c.teacherId === val || c.teacherName === val);
                    if (teacherCourses[0]) {
                      setSalaryCourseTitle(teacherCourses[0].title);
                      setSalaryAmount(teacherCourses[0].teacherWage || 3000000);
                    }
                  }}
                  options={users.filter(u => u.role === 'teacher').map(t => ({
                    value: t.id,
                    label: `👨‍🏫 ${t.name} (تلفن: ${t.phone})`
                  }))}
                  placeholder="انتخاب یا نوشتن نام مدرس..."
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">دوره آموزشی مربوطه</label>
                <EditableSelect
                  value={salaryCourseTitle}
                  onChange={val => setSalaryCourseTitle(val)}
                  options={courses.map(c => ({
                    value: c.title,
                    label: `${c.title} (مدرس: ${c.teacherName})`
                  }))}
                  placeholder="انتخاب یا تایپ عنوان دوره..."
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  مبلغ پرداختی به مدرس (تومان با جداسازی ۳ رقمی) *
                </label>
                <FormattedCurrencyInput
                  value={salaryAmount}
                  onChange={setSalaryAmount}
                  required
                  placeholder="مثلاً 4,000,000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">تعداد ساعت تدریس</label>
                  <input
                    type="number"
                    value={salaryHours}
                    onChange={e => setSalaryHours(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono outline-none text-slate-800 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    تاریخ پرداخت حقوق (شمسی) *
                  </label>
                  <input
                    type="text"
                    value={salaryDate}
                    onChange={e => setSalaryDate(e.target.value)}
                    required
                    placeholder="۱۴۰۳/۰۵/۲۷"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow"
                >
                  ثبت پرداخت به مدرس
                </button>
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add New Debtor / Tuition Record */}
      {isAddTuitionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                افزودن بدهکار جدید / ثبت بدهی شهریه
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTuitionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddTuition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  انتخاب دانشجو / کارآموز (یا تایپ دستی نام) *
                </label>
                <EditableSelect
                  value={newDebtorStudentId}
                  onChange={val => {
                    setNewDebtorStudentId(val);
                    const st = users.find(u => u.id === val || u.name === val);
                    if (st) {
                      setNewDebtorStudentName(st.name);
                      setNewDebtorPhone(st.phone);
                    } else {
                      setNewDebtorStudentName(val);
                    }
                  }}
                  options={users.map(u => ({
                    value: u.id,
                    label: `👤 ${u.name} (${u.role === 'student' ? 'دانشجو' : u.role === 'intern' ? 'کارآموز' : u.role}) - ${u.phone}`
                  }))}
                  placeholder="انتخاب از کاربران یا تایپ نام بدهکار..."
                />
              </div>

              {!users.some(u => u.id === newDebtorStudentId) && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">نام و نام خانوادگی بدهکار</label>
                    <input
                      type="text"
                      placeholder="علی حسینی"
                      value={newDebtorStudentName}
                      onChange={e => setNewDebtorStudentName(e.target.value)}
                      required={!newDebtorStudentId}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 mb-1">شماره همراه بدهکار</label>
                    <input
                      type="text"
                      placeholder="09121112233"
                      value={newDebtorPhone}
                      onChange={e => setNewDebtorPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono outline-none text-slate-800 dark:text-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  انتخاب یا تایپ دوره آموزشی مربوطه *
                </label>
                <EditableSelect
                  value={newDebtorCourseId}
                  onChange={val => {
                    setNewDebtorCourseId(val);
                    const crs = courses.find(c => c.id === val || c.title === val);
                    if (crs) {
                      setNewDebtorCourseTitle(crs.title);
                      setNewDebtorTotalAmount(crs.price);
                    } else {
                      setNewDebtorCourseTitle(val);
                    }
                  }}
                  options={courses.map(c => ({
                    value: c.id,
                    label: `${c.title} (${c.price.toLocaleString('fa-IR')} تومان)`
                  }))}
                  placeholder="انتخاب یا نوشتن نام دوره..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    مبلغ کل شهریه (تومان) *
                  </label>
                  <FormattedCurrencyInput
                    value={newDebtorTotalAmount}
                    onChange={setNewDebtorTotalAmount}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    تخفیف (تومان)
                  </label>
                  <FormattedCurrencyInput
                    value={newDebtorDiscount}
                    onChange={setNewDebtorDiscount}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-bold">
                    تاریخ ثبت بدهی (شمسی) *
                  </label>
                  <input
                    type="text"
                    value={newDebtorDate}
                    onChange={e => setNewDebtorDate(e.target.value)}
                    required
                    placeholder="۱۴۰۳/۰۵/۲۷"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  ثبت پرونده بدهکار جدید
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddTuitionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

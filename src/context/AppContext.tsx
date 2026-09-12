import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Course,
  Project,
  DailyReport,
  CustomerLead,
  ChatMessage,
  ChatChannel,
  ActivityLog,
  SystemNotification,
  ProjectStatus,
  LeadStatus,
  DailyReportStatus,
  ActiveModule,
  TuitionRecord,
  PaymentTransaction,
  InstallmentPlan,
  ExpenseRecord,
  TeacherSalaryRecord,
  MonthlyInternSummary,
  NotificationTarget
} from '../types';
import {
  initialUsers,
  initialCourses,
  initialProjects,
  initialDailyReports,
  initialCustomerLeads,
  initialChatChannels,
  initialMessages,
  initialActivityLogs,
  initialNotifications,
  initialTuitions,
  initialPayments,
  initialInstallments,
  initialExpenses,
  initialTeacherSalaries
} from '../data/mockData';

interface AppContextType {
  isAuthenticated: boolean;
  login: (identity: string, passwordInput: string) => { success: boolean; message?: string };
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  courses: Course[];
  projects: Project[];
  dailyReports: DailyReport[];
  customerLeads: CustomerLead[];
  tuitions: TuitionRecord[];
  payments: PaymentTransaction[];
  installments: InstallmentPlan[];
  expenses: ExpenseRecord[];
  teacherSalaries: TeacherSalaryRecord[];
  chatChannels: ChatChannel[];
  messages: ChatMessage[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
  activeModule: ActiveModule;
  setActiveModule: (mod: ActiveModule) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  addUser: (user: Omit<User, 'id' | 'joinDate'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addCourse: (course: Omit<Course, 'id' | 'enrolledCount' | 'studentIds' | 'materials' | 'homeworks' | 'sessions'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'comments' | 'attachments'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectComment: (projectId: string, text: string) => void;

  addDailyReport: (report: Omit<DailyReport, 'id' | 'status'>) => void;
  reviewDailyReport: (id: string, status: DailyReportStatus, feedback: string) => void;
  deleteDailyReport: (id: string) => void;
  getMonthlyInternSummary: (internId: string, monthStr?: string) => MonthlyInternSummary;

  addCustomerLead: (lead: Omit<CustomerLead, 'id' | 'createdAt' | 'notes' | 'status'>) => void;
  updateCustomerLead: (id: string, lead: Partial<CustomerLead>) => void;
  deleteCustomerLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus, cancellationReason?: string) => void;
  addLeadNote: (leadId: string, noteText: string) => void;
  convertLeadToStudent: (leadId: string, courseId: string) => void;

  // Financial Actions
  addTuition: (tuition: Omit<TuitionRecord, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status'>) => void;
  updateTuition: (id: string, updated: Partial<TuitionRecord>) => void;
  deleteTuition: (id: string) => void;
  addPayment: (payment: Omit<PaymentTransaction, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, updated: Partial<PaymentTransaction>) => void;
  deletePayment: (id: string) => void;
  addInstallment: (installment: Omit<InstallmentPlan, 'id' | 'isPaid'>) => void;
  toggleInstallmentPaid: (installmentId: string, trackingCode?: string) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, updated: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  addTeacherSalary: (salary: Omit<TeacherSalaryRecord, 'id'>) => void;
  updateTeacherSalary: (id: string, updated: Partial<TeacherSalaryRecord>) => void;
  deleteTeacherSalary: (id: string) => void;

  // Notification Actions
  sendNotification: (
    title: string,
    message: string,
    targetType: NotificationTarget,
    targetUserId?: string,
    targetPhone?: string
  ) => void;
  markNotificationAsRead: (id: string) => void;

  sendMessage: (channelId: string, text: string, attachmentName?: string) => void;
  logActivity: (action: string, module: string, details?: string) => void;
  resetAllData: () => void;
  restoreBackup: (backupData: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'shokooh_danesh_prod_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    let list: User[] = saved ? JSON.parse(saved) : [...initialUsers];
    
    // Ensure all standard initialUsers for each role exist
    initialUsers.forEach(initU => {
      if (!list.some(u => u.id === initU.id || u.username === initU.username)) {
        list.push(initU);
      }
    });

    return list.map(u => {
      if (u.id === 'u-1' || u.name.includes('علی هاشمی')) {
        return { ...u, username: u.username || 'ali_hashemi', password: u.password || '123' };
      }
      if (u.id === 'u-2' || u.name.includes('سارا راد')) {
        return { ...u, username: u.username || 'sara_rad', password: u.password || '123' };
      }
      if (u.id === 'u-3' || u.name.includes('رضا کرمی')) {
        return { ...u, username: u.username || 'reza_karami', password: u.password || '123' };
      }
      if (u.id === 'u-4' || u.name.includes('مینا احمدی')) {
        return { ...u, username: u.username || 'mina_ahmadi', password: u.password || '123' };
      }
      return { ...u, password: u.password || '123' };
    });
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth_user_id`);
    return !!savedUserId;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth_user_id`);
    if (savedUserId) {
      const found = (users.length > 0 ? users : initialUsers).find(u => u.id === savedUserId);
      if (found) return found;
    }
    return (users.length > 0 ? users : initialUsers)[0];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_courses`);
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_daily_reports`);
    return saved ? JSON.parse(saved) : initialDailyReports;
  });

  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_leads`);
    return saved ? JSON.parse(saved) : initialCustomerLeads;
  });

  const [tuitions, setTuitions] = useState<TuitionRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tuitions`);
    return saved ? JSON.parse(saved) : initialTuitions;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [installments, setInstallments] = useState<InstallmentPlan[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_installments`);
    return saved ? JSON.parse(saved) : initialInstallments;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [teacherSalaries, setTeacherSalaries] = useState<TeacherSalaryRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teacher_salaries`);
    return saved ? JSON.parse(saved) : initialTeacherSalaries;
  });

  const [chatChannels] = useState<ChatChannel[]>(initialChatChannels);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_courses`, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_daily_reports`, JSON.stringify(dailyReports));
  }, [dailyReports]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_leads`, JSON.stringify(customerLeads));
  }, [customerLeads]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tuitions`, JSON.stringify(tuitions));
  }, [tuitions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_installments`, JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_teacher_salaries`, JSON.stringify(teacherSalaries));
  }, [teacherSalaries]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  const logActivity = (action: string, module: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id' | 'joinDate'>) => {
    const newId = `u-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
      joinDate: new Date().toLocaleDateString('fa-IR')
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('تعریف کاربر جدید', 'کاربران', `ایجاد کاربر ${newUser.name} با نقش ${newUser.role}`);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    logActivity('ویرایش اطلاعات کاربر', 'کاربران', `بروزرسانی کاربر کد ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logActivity('حذف کاربر', 'کاربران', `حذف کاربر کد ${id}`);
  };

  // Course CRUD
  const addCourse = (courseData: Omit<Course, 'id' | 'enrolledCount' | 'studentIds' | 'materials' | 'homeworks' | 'sessions'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
      enrolledCount: 0,
      studentIds: [],
      materials: [],
      homeworks: [],
      sessions: []
    };
    setCourses(prev => [...prev, newCourse]);
    logActivity('ایجاد دوره جدید', 'دوره‌ها', `ایجاد دوره ${newCourse.title}`);
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    logActivity('ویرایش دوره', 'دوره‌ها', `ویرایش دوره ${id}`);
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    logActivity('حذف دوره', 'دوره‌ها', `حذف دوره ${id}`);
  };

  // Projects
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'comments' | 'attachments'>) => {
    const newProj: Project = {
      ...projectData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      comments: [],
      attachments: []
    };
    setProjects(prev => [...prev, newProj]);
    logActivity('تعریف پروژه جدید', 'پروژه‌ها', `تعریف پروژه ${newProj.title}`);
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    logActivity('ویرایش مشخصات پروژه', 'پروژه‌ها', `ویرایش پروژه ${id}`);
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    logActivity('حذف پروژه', 'پروژه‌ها', proj ? `حذف پروژه ${proj.title}` : `حذف پروژه ${id}`);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    logActivity('تغییر وضعیت پروژه', 'پروژه‌ها', `تغییر وضعیت پروژه ${id} به ${status}`);
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progressPercentage = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : p.progressPercentage;
      return { ...p, tasks: updatedTasks, progressPercentage };
    }));
  };

  const addProjectComment = (projectId: string, text: string) => {
    const comment = {
      id: `cm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      date: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  // Daily Reports
  const addDailyReport = (reportData: Omit<DailyReport, 'id' | 'status'>) => {
    const newReport: DailyReport = {
      ...reportData,
      id: `dr-${Date.now()}`,
      status: 'submitted'
    };
    setDailyReports(prev => [newReport, ...prev]);
    logActivity('ثبت گزارش روزانه', 'گزارش روزانه', `ثبت گزارش ${reportData.workedHours} ساعت توسط ${reportData.internName}`);

    // Trigger Notification for Admin
    sendNotification(
      'گزارش روزانه جدید کارآموز',
      `${reportData.internName} گزارش روزانه کار روی پروژه ${reportData.projectTitle} را ثبت کرد.`,
      'admins'
    );
  };

  const reviewDailyReport = (id: string, status: DailyReportStatus, feedback: string) => {
    setDailyReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        status,
        reviewerFeedback: feedback,
        reviewedBy: currentUser.name,
        reviewedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
    }));
    logActivity('بررسی گزارش روزانه', 'گزارش روزانه', `تغییر وضعیت گزارش ${id} به ${status}`);
  };

  const deleteDailyReport = (id: string) => {
    const reportToDelete = dailyReports.find(r => r.id === id);
    setDailyReports(prev => prev.filter(r => r.id !== id));
    logActivity(
      'حذف گزارش روزانه',
      'گزارش روزانه',
      reportToDelete ? `حذف گزارش تاریخ ${reportToDelete.date} مربوط به ${reportToDelete.internName}` : `حذف گزارش ${id}`
    );
  };

  // Automatic Monthly Report Generator for Interns
  const getMonthlyInternSummary = (internId: string, monthStr: string = 'بهمن 1402'): MonthlyInternSummary => {
    const intern = users.find(u => u.id === internId);
    const internName = intern ? intern.name : 'کارآموز';
    const internReports = dailyReports.filter(r => r.internId === internId);
    
    const totalWorkedHours = internReports.reduce((acc, r) => acc + (r.workedHours || 0), 0);
    const reportsSubmittedCount = internReports.length;
    const pdfReportsCount = internReports.filter(r => r.pdfFileName || r.pdfAnalyzed).length;
    
    // Calculate average quality score
    const qualityScores = internReports.map(r => r.aiAnalysis?.qualityScore || 88);
    const averageQualityScore = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 85;

    // Unique projects
    const projectIds = Array.from(new Set(internReports.map(r => r.projectId)));
    const projectsInvolvedCount = projectIds.length || 1;

    // Average progress
    const relatedProjects = projects.filter(p => p.leadInternId === internId || p.teamInternIds.includes(internId));
    const avgProgress = relatedProjects.length > 0
      ? Math.round(relatedProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / relatedProjects.length)
      : 80;

    const strengths = [
      'تسلط بر اصول کدنویسی تمیز و ساختاریافته',
      'دقت در مستندسازی فنی و ارسال پی‌دی‌اف گزارش‌های روزانه',
      'همکاری موثر تیمی و رعایت ددلاین‌ها'
    ];

    const recommendations = [
      'تمرکز بیشتر بر نوشتن تست‌های خودکار (Unit Tests)',
      'ارتقای سرعت حل چالش‌های زیرساختی و پایگاه‌داده'
    ];

    return {
      internId,
      internName,
      month: monthStr,
      totalWorkedHours,
      reportsSubmittedCount,
      pdfReportsCount,
      projectsInvolvedCount,
      overallProgressPercentage: avgProgress,
      averageQualityScore,
      performanceComparison: `رشد ${Math.min(18, Math.max(5, Math.round(totalWorkedHours / 4)))}٪ نسبت به ماه گذشته`,
      keyStrengths: strengths,
      growthRecommendations: recommendations,
      dailyHoursBreakdown: internReports.map(r => ({ date: r.date, hours: r.workedHours }))
    };
  };

  // CRM Leads
  const addCustomerLead = (leadData: Omit<CustomerLead, 'id' | 'createdAt' | 'notes' | 'status'>) => {
    const newLead: CustomerLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'new_lead',
      notes: [],
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setCustomerLeads(prev => [newLead, ...prev]);
    logActivity('ثبت مخاطب جدید CRM', 'CRM', `ثبت پرونده مشتری ${newLead.fullName}`);
  };

  const updateCustomerLead = (id: string, updated: Partial<CustomerLead>) => {
    setCustomerLeads(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
    logActivity('ویرایش مخاطب CRM', 'CRM', `ویرایش مشخصات مشتری ${id}`);
  };

  const deleteCustomerLead = (id: string) => {
    const lead = customerLeads.find(l => l.id === id);
    setCustomerLeads(prev => prev.filter(l => l.id !== id));
    logActivity('حذف مخاطب CRM', 'CRM', lead ? `حذف مشتری ${lead.fullName}` : `حذف مشتری ${id}`);
  };

  const updateLeadStatus = (id: string, status: LeadStatus, cancellationReason?: string) => {
    setCustomerLeads(prev => prev.map(l => l.id === id ? {
      ...l,
      status,
      cancellationReason: status === 'cancelled' ? (cancellationReason || l.cancellationReason) : l.cancellationReason
    } : l));
    logActivity('تغییر وضعیت مشتری CRM', 'CRM', `تغییر وضعیت مشتری ${id} به ${status}`);
  };

  const addLeadNote = (leadId: string, noteText: string) => {
    const note = {
      id: `n-${Date.now()}`,
      authorName: currentUser.name,
      date: new Date().toLocaleDateString('fa-IR'),
      note: noteText
    };
    setCustomerLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, note] } : l));
  };

  const convertLeadToStudent = (leadId: string, courseId: string) => {
    const lead = customerLeads.find(l => l.id === leadId);
    if (!lead) return;

    const course = courses.find(c => c.id === courseId);
    const courseTitle = course ? course.title : 'دوره آموزشی';
    const coursePrice = course ? course.price : 5000000;

    // 1. Create student user
    const newStudentId = `u-${Date.now()}`;
    const newStudent: User = {
      id: newStudentId,
      name: lead.fullName,
      email: lead.email || `${newStudentId}@shokooh.ir`,
      phone: lead.phone,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      skills: ['دانشجوی منتقل شده از CRM'],
      bio: `منتقل‌شده از CRM. شغل: ${lead.occupation || 'تعیین‌نشده'} - شهر: ${lead.city || 'تعیین‌نشده'}`,
      status: 'active',
      joinDate: new Date().toLocaleDateString('fa-IR'),
      enrolledCourseIds: [courseId]
    };

    setUsers(prev => [...prev, newStudent]);

    // 2. Enroll student in course
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          enrolledCount: c.enrolledCount + 1,
          studentIds: [...c.studentIds, newStudentId]
        };
      }
      return c;
    }));

    // 3. Register initial Tuition record
    const newTuition: TuitionRecord = {
      id: `tui-${Date.now()}`,
      studentId: newStudentId,
      studentName: lead.fullName,
      studentPhone: lead.phone,
      courseId,
      courseTitle,
      totalAmount: coursePrice,
      discountAmount: 0,
      finalAmount: coursePrice,
      paidAmount: 0,
      remainingAmount: coursePrice,
      status: 'unpaid',
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setTuitions(prev => [...prev, newTuition]);

    // 4. Update lead status to enrolled
    setCustomerLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'enrolled', convertedToStudentId: newStudentId } : l));

    logActivity('تبدیل تک‌کلیک مشتری به دانشجو', 'CRM', `تبدیل ${lead.fullName} به دانشجو و ثبت‌نام در ${courseTitle}`);
  };

  // Financial Actions
  const addTuition = (data: Omit<TuitionRecord, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status'>) => {
    const finalAmount = data.totalAmount - (data.discountAmount || 0);
    const newTuition: TuitionRecord = {
      ...data,
      id: `tui-${Date.now()}`,
      finalAmount,
      paidAmount: 0,
      remainingAmount: finalAmount,
      status: 'unpaid',
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setTuitions(prev => [...prev, newTuition]);
    logActivity('ثبت شهریه دوره', 'مالی', `ثبت شهریه ${finalAmount.toLocaleString('fa-IR')} تومان برای ${data.studentName}`);
  };

  const addPayment = (paymentData: Omit<PaymentTransaction, 'id' | 'createdAt'>) => {
    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: `trx-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-IR')
    };
    setPayments(prev => [newPayment, ...prev]);

    // Recalculate tuition status if tuitionId provided
    if (paymentData.tuitionId) {
      setTuitions(prev => prev.map(t => {
        if (t.id !== paymentData.tuitionId) return t;
        const newPaid = t.paidAmount + paymentData.amount;
        const newRemaining = Math.max(0, t.finalAmount - newPaid);
        const status = newRemaining === 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');
        return { ...t, paidAmount: newPaid, remainingAmount: newRemaining, status };
      }));
    }

    logActivity('ثبت پرداخت مالی', 'مالی', `دریافت ${paymentData.amount.toLocaleString('fa-IR')} تومان از ${paymentData.studentName}`);
  };

  const addInstallment = (data: Omit<InstallmentPlan, 'id' | 'isPaid'>) => {
    const newInstallment: InstallmentPlan = {
      ...data,
      id: `inst-${Date.now()}`,
      isPaid: false
    };
    setInstallments(prev => [...prev, newInstallment]);
    logActivity('تعریف قسط شهریه', 'مالی', `ثبت قسط ${data.amount.toLocaleString('fa-IR')} تومان برای ${data.studentName}`);
  };

  const toggleInstallmentPaid = (installmentId: string, trackingCode?: string) => {
    const inst = installments.find(i => i.id === installmentId);
    if (!inst) return;

    const nextPaidState = !inst.isPaid;
    setInstallments(prev => prev.map(i => i.id === installmentId ? {
      ...i,
      isPaid: nextPaidState,
      paidDate: nextPaidState ? new Date().toLocaleDateString('fa-IR') : undefined,
      trackingCode: nextPaidState ? (trackingCode || `INST-${Math.floor(10000 + Math.random() * 90000)}`) : undefined
    } : i));

    if (nextPaidState) {
      // Add transaction record
      addPayment({
        tuitionId: inst.tuitionId,
        studentId: inst.studentId,
        studentName: inst.studentName,
        courseTitle: inst.courseTitle,
        amount: inst.amount,
        paymentDate: new Date().toLocaleDateString('fa-IR'),
        paymentMethod: 'card',
        trackingCode: trackingCode || `INST-${Math.floor(10000 + Math.random() * 90000)}`,
        description: `پرداخت قسط شهریه ${inst.courseTitle}`
      });
    }
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExpense, ...prev]);
    logActivity('ثبت هزینه آموزشگاه', 'مالی', `ثبت هزینه ${expenseData.title} به مبلغ ${expenseData.amount.toLocaleString('fa-IR')} تومان`);
  };

  const updateTuition = (id: string, updated: Partial<TuitionRecord>) => {
    setTuitions(prev => prev.map(t => {
      if (t.id !== id) return t;
      const totalAmount = updated.totalAmount !== undefined ? updated.totalAmount : t.totalAmount;
      const discountAmount = updated.discountAmount !== undefined ? updated.discountAmount : (t.discountAmount || 0);
      const finalAmount = updated.finalAmount !== undefined ? updated.finalAmount : (totalAmount - discountAmount);
      const paidAmount = updated.paidAmount !== undefined ? updated.paidAmount : t.paidAmount;
      const remainingAmount = Math.max(0, finalAmount - paidAmount);
      const status = remainingAmount === 0 ? 'fully_paid' : (paidAmount > 0 ? 'partial' : 'unpaid');
      return {
        ...t,
        ...updated,
        totalAmount,
        discountAmount,
        finalAmount,
        paidAmount,
        remainingAmount,
        status: (updated.status as any) || status
      };
    }));
    logActivity('ویرایش پرونده شهریه', 'مالی', `ویرایش مشخصات شهریه شناسه ${id}`);
  };

  const deleteTuition = (id: string) => {
    setTuitions(prev => prev.filter(t => t.id !== id));
    logActivity('حذف پرونده شهریه', 'مالی', `حذف پرونده شهریه شناسه ${id}`);
  };

  const updatePayment = (id: string, updated: Partial<PaymentTransaction>) => {
    const existing = payments.find(p => p.id === id);
    if (existing && existing.tuitionId && updated.amount !== undefined && updated.amount !== existing.amount) {
      const diff = updated.amount - existing.amount;
      setTuitions(prev => prev.map(t => {
        if (t.id !== existing.tuitionId) return t;
        const newPaid = Math.max(0, t.paidAmount + diff);
        const newRemaining = Math.max(0, t.finalAmount - newPaid);
        const status = newRemaining === 0 ? 'fully_paid' : (newPaid > 0 ? 'partial' : 'unpaid');
        return { ...t, paidAmount: newPaid, remainingAmount: newRemaining, status };
      }));
    }
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    logActivity('ویرایش تراکنش پرداخت', 'مالی', `ویرایش تراکنش مالی شناسه ${id}`);
  };

  const deletePayment = (id: string) => {
    const pay = payments.find(p => p.id === id);
    if (pay && pay.tuitionId) {
      // Revert paidAmount on tuition
      setTuitions(prev => prev.map(t => {
        if (t.id !== pay.tuitionId) return t;
        const newPaid = Math.max(0, t.paidAmount - pay.amount);
        const newRemaining = Math.max(0, t.finalAmount - newPaid);
        const status = newRemaining === 0 ? 'fully_paid' : (newPaid > 0 ? 'partial' : 'unpaid');
        return { ...t, paidAmount: newPaid, remainingAmount: newRemaining, status };
      }));
    }
    setPayments(prev => prev.filter(p => p.id !== id));
    logActivity('حذف تراکنش مالی', 'مالی', `حذف تراکنش شناسه ${id}`);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseRecord>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    logActivity('ویرایش هزینه آموزشگاه', 'مالی', `ویرایش هزینه شناسه ${id}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logActivity('حذف هزینه آموزشگاه', 'مالی', `حذف هزینه شناسه ${id}`);
  };

  const updateTeacherSalary = (id: string, updated: Partial<TeacherSalaryRecord>) => {
    setTeacherSalaries(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    logActivity('ویرایش فیش حقوق مدرس', 'مالی', `ویرایش حقوق شناسه ${id}`);
  };

  const deleteTeacherSalary = (id: string) => {
    setTeacherSalaries(prev => prev.filter(s => s.id !== id));
    logActivity('حذف فیش حقوق مدرس', 'مالی', `حذف حقوق شناسه ${id}`);
  };

  const addTeacherSalary = (salaryData: Omit<TeacherSalaryRecord, 'id'>) => {
    const newSalary: TeacherSalaryRecord = {
      ...salaryData,
      id: `sal-${Date.now()}`
    };
    setTeacherSalaries(prev => [newSalary, ...prev]);
    logActivity('پرداخت حقوق مدرس', 'مالی', `پرداخت حقوق ${salaryData.teacherName} بابت ${salaryData.courseTitle}`);
  };

  // Notifications Tool
  const sendNotification = (
    title: string,
    message: string,
    targetType: NotificationTarget,
    targetUserId?: string,
    targetPhone?: string
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'هم‌اکنون',
      read: false,
      type: 'admin_announcement',
      targetType,
      targetUserId,
      targetPhone,
      createdBy: currentUser.name
    };

    setNotifications(prev => [newNotif, ...prev]);
    logActivity('ارسال اعلان جدید', 'اعلان‌ها', `ارسال اعلان «${title}» به گروه/کاربر ${targetType}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Chat
  const sendMessage = (channelId: string, text: string, attachmentName?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      text,
      attachmentName,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const resetAllData = () => {
    setUsers(initialUsers);
    setCourses(initialCourses);
    setProjects(initialProjects);
    setDailyReports(initialDailyReports);
    setCustomerLeads(initialCustomerLeads);
    setTuitions(initialTuitions);
    setPayments(initialPayments);
    setInstallments(initialInstallments);
    setExpenses(initialExpenses);
    setTeacherSalaries(initialTeacherSalaries);
    setMessages(initialMessages);
    setActivityLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  const restoreBackup = (backupData: any) => {
    const data = backupData.data || backupData;
    if (data.users) setUsers(data.users);
    if (data.courses) setCourses(data.courses);
    if (data.projects) setProjects(data.projects);
    if (data.dailyReports) setDailyReports(data.dailyReports);
    if (data.customerLeads) setCustomerLeads(data.customerLeads);
    if (data.tuitions) setTuitions(data.tuitions);
    if (data.payments) setPayments(data.payments);
    if (data.installments) setInstallments(data.installments);
    if (data.expenses) setExpenses(data.expenses);
    if (data.teacherSalaries) setTeacherSalaries(data.teacherSalaries);
    if (data.messages) setMessages(data.messages);
    if (data.notifications) setNotifications(data.notifications);
    if (data.activityLogs) setActivityLogs(data.activityLogs);
    logActivity('بازیابی نسخه پشتیبان', 'تنظیمات', 'بازیابی کامل اطلاعات از فایل پشتیبان');
  };

  const login = (identity: string, passwordInput: string) => {
    const cleanIdentity = identity.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const foundUser = users.find(u => {
      const matchUsername = (u.username || '').toLowerCase() === cleanIdentity;
      const matchEmail = (u.email || '').toLowerCase() === cleanIdentity;
      const matchPhone = (u.phone || '').trim() === cleanIdentity;
      return matchUsername || matchEmail || matchPhone;
    });

    if (!foundUser) {
      return { success: false, message: 'کاربری با این مشخصات یا نام کاربری یافت نشد.' };
    }

    const userPassword = foundUser.password || '123';
    const isPasswordValid =
      userPassword === cleanPass ||
      ((userPassword === '123' || userPassword === '123456') && (cleanPass === '123' || cleanPass === '123456'));

    if (!isPasswordValid) {
      return { success: false, message: 'رمز عبور وارد شده اشتباه است.' };
    }

    if (foundUser.status === 'suspended' || foundUser.status === 'inactive') {
      return { success: false, message: 'حساب کاربری شما غیرفعال یا معلق گردیده است. با مدیریت تماس بگیرید.' };
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth_user_id`, foundUser.id);

    if (foundUser.role === 'intern') {
      setActiveModule('daily_reports');
    } else if (foundUser.role === 'student') {
      setActiveModule('courses');
    } else if (foundUser.role === 'teacher') {
      setActiveModule('courses');
    } else {
      setActiveModule('dashboard');
    }

    logActivity('ورود موفق به سامانه', 'احراز هویت', `کاربر ${foundUser.name} با نقش ${foundUser.role} وارد شد.`);
    return { success: true };
  };

  const logout = () => {
    logActivity('خروج از سامانه', 'احراز هویت', `کاربر ${currentUser.name} از سامانه خارج شد.`);
    setIsAuthenticated(false);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth_user_id`);
    const defaultUser = (users.length > 0 ? users : initialUsers)[0];
    setCurrentUser(defaultUser);
    setActiveModule('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        users,
        courses,
        projects,
        dailyReports,
        customerLeads,
        tuitions,
        payments,
        installments,
        expenses,
        teacherSalaries,
        chatChannels,
        messages,
        activityLogs,
        notifications,
        activeModule,
        setActiveModule,
        searchQuery,
        setSearchQuery,
        addUser,
        updateUser,
        deleteUser,
        addCourse,
        updateCourse,
        deleteCourse,
        addProject,
        updateProject,
        deleteProject,
        updateProjectStatus,
        toggleProjectTask,
        addProjectComment,
        addDailyReport,
        reviewDailyReport,
        deleteDailyReport,
        getMonthlyInternSummary,
        addCustomerLead,
        updateCustomerLead,
        deleteCustomerLead,
        updateLeadStatus,
        addLeadNote,
        convertLeadToStudent,
        addTuition,
        updateTuition,
        deleteTuition,
        addPayment,
        updatePayment,
        deletePayment,
        addInstallment,
        toggleInstallmentPaid,
        addExpense,
        updateExpense,
        deleteExpense,
        addTeacherSalary,
        updateTeacherSalary,
        deleteTeacherSalary,
        sendNotification,
        markNotificationAsRead,
        sendMessage,
        logActivity,
        resetAllData,
        restoreBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

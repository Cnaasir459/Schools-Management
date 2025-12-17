import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, DollarSign, Menu, X, GraduationCap, Settings as SettingsIcon, BookOpen, Bell, Search, Lock, Briefcase, UserCheck, LogOut } from 'lucide-react';
import { DataService } from './services/dataService';
import { Student, AttendanceRecord, FeeRecord, ExpenseRecord, ViewState, ExamResult, ActivityLog, Notification, SchoolSettings, Teacher } from './types';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Teachers } from './components/Teachers';
import { Attendance } from './components/Attendance';
import { Fees } from './components/Fees';
import { Grades } from './components/Grades';
import { Settings } from './components/Settings';
import { ParentPortal } from './components/ParentPortal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Authentication State
  const [isLocked, setIsLocked] = useState(true); // Default to locked
  const [lockPin, setLockPin] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'parent' | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // App State
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [grades, setGrades] = useState<ExamResult[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [announcement, setAnnouncement] = useState<string>('');
  const [settings, setSettings] = useState<SchoolSettings>(DataService.getSettings());

  // Load Initial Data
  useEffect(() => {
    setStudents(DataService.getStudents());
    setTeachers(DataService.getTeachers());
    setAttendance(DataService.getAttendance());
    setFees(DataService.getFees());
    setExpenses(DataService.getExpenses());
    setGrades(DataService.getGrades());
    setActivities(DataService.getActivities());
    setAnnouncement(DataService.getAnnouncement());
    setSettings(DataService.getSettings());
  }, []);

  // Theme Logic
  const getThemeGradient = () => {
      switch(settings.theme) {
          case 'Forest': return 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)';
          case 'Sunset': return 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)';
          case 'Midnight': return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
          default: return 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)'; // Ocean
      }
  }

  // Notification Handler
  const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Lock Screen / Login Handler
  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 1. Check Admin PIN
      if(lockPin === '1234' || lockPin === '0000') {
          setIsLocked(false);
          setUserRole('admin');
          setLockPin('');
          notify('Welcome back, Admin', 'success');
          return;
      }

      // 2. Check Parent Access Code
      const studentMatch = students.find(s => s.parentAccessCode === lockPin.trim() || s.parentAccessCode === lockPin.trim().toUpperCase());
      if (studentMatch) {
          setIsLocked(false);
          setUserRole('parent');
          setCurrentUser(studentMatch);
          setLockPin('');
          notify(`Welcome, Parent of ${studentMatch.fullName}`, 'success');
          return;
      }

      // 3. Fail
      notify('Invalid PIN or Access Code', 'error');
      setLockPin('');
  }

  const handleLogout = () => {
      setIsLocked(true);
      setUserRole(null);
      setCurrentUser(null);
      setCurrentView('dashboard');
  }

  // State Updates Handlers (Admin Only)
  const handleAddStudent = (student: Student) => {
    const updated = [...students, student];
    setStudents(updated);
    DataService.saveStudents(updated);
    setActivities(DataService.logActivity('Student Added', `Added ${student.fullName} to ${student.grade}`, 'success'));
    notify(`Successfully added ${student.fullName}`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updated);
    DataService.saveStudents(updated);
    setActivities(DataService.logActivity('Student Updated', `Updated details for ${updatedStudent.fullName}`, 'info'));
    notify('Student details updated successfully');
  };

  const handleDeleteStudent = (id: string) => {
    if(confirm('Are you sure you want to delete this student?')) {
      const studentName = students.find(s => s.id === id)?.fullName || 'Student';
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      DataService.saveStudents(updated);
      setActivities(DataService.logActivity('Student Deleted', `Removed ${studentName} from database`, 'warning'));
      notify('Student removed successfully', 'info');
    }
  };

  const handleAddTeacher = (teacher: Teacher) => {
      const updated = [...teachers, teacher];
      setTeachers(updated);
      DataService.saveTeachers(updated);
      notify('Teacher added successfully');
  }

  const handleUpdateTeacher = (teacher: Teacher) => {
      const updated = teachers.map(t => t.id === teacher.id ? teacher : t);
      setTeachers(updated);
      DataService.saveTeachers(updated);
      notify('Teacher updated successfully');
  }

  const handleDeleteTeacher = (id: string) => {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      DataService.saveTeachers(updated);
      notify('Teacher removed', 'warning');
  }

  const handleSaveAttendance = (newRecords: AttendanceRecord[]) => {
    const others = attendance.filter(
      old => !newRecords.some(nr => nr.studentId === old.studentId && nr.date === old.date)
    );
    const updated = [...others, ...newRecords];
    setAttendance(updated);
    DataService.saveAttendance(updated);
    setActivities(DataService.logActivity('Attendance Marked', `Updated attendance for ${newRecords.length} students`, 'success'));
    notify('Attendance records saved');
  };

  const handleAddFee = (fee: FeeRecord) => {
    const updated = [fee, ...fees]; // Newest first
    setFees(updated);
    DataService.saveFees(updated);
    notify(`Fee recorded: $${fee.amount}`);
  };
  
  const handleBulkAddFees = (newFees: FeeRecord[]) => {
      const updated = [...newFees, ...fees];
      setFees(updated);
      DataService.saveFees(updated);
      setActivities(DataService.logActivity('Bulk Invoicing', `Generated ${newFees.length} invoices`, 'success'));
      notify(`Generated ${newFees.length} fee records successfully`);
  }

  const handleUpdateFee = (updatedFee: FeeRecord) => {
    const updated = fees.map(f => f.id === updatedFee.id ? updatedFee : f);
    setFees(updated);
    DataService.saveFees(updated);
    notify('Fee record updated');
  };

  const handleDeleteFee = (id: string) => {
    const updated = fees.filter(f => f.id !== id);
    setFees(updated);
    DataService.saveFees(updated);
    notify('Fee record deleted', 'info');
  };

  const handleAddExpense = (expense: ExpenseRecord) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    DataService.saveExpenses(updated);
    setActivities(DataService.logActivity('Expense Recorded', `Spent $${expense.amount} for ${expense.category}`, 'warning'));
    notify('Expense recorded');
  };

  const handleSaveGrades = (newGrades: ExamResult[]) => {
    const others = grades.filter(
       old => !newGrades.some(ng => 
          ng.studentId === old.studentId && 
          ng.subject === old.subject && 
          ng.date === old.date &&
          ng.term === old.term
       )
    );
    const updated = [...others, ...newGrades];
    setGrades(updated);
    DataService.saveGrades(updated);
    setActivities(DataService.logActivity('Grades Updated', `Entered ${newGrades.length} exam scores`, 'success'));
    notify('Exam grades saved successfully');
  };

  const handleUpdateAnnouncement = (text: string) => {
    setAnnouncement(text);
    DataService.saveAnnouncement(text);
  }

  const handleFactoryReset = () => {
    DataService.clearAllData();
    window.location.reload();
  }

  // --- RENDER LOGIC ---

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-3.5 transition-all duration-200 
        ${currentView === view 
          ? 'bg-white/20 text-white border-r-4 border-emerald-400' 
          : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-lg">{label}</span>
    </button>
  );

  // View: Lock Screen
  if (isLocked) {
      return (
          <div className="flex h-screen w-full items-center justify-center text-white" style={{ background: getThemeGradient() }}>
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl text-center max-w-sm w-full animate-fade-in relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
                  
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
                      <Lock className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{settings.name}</h2>
                  <p className="text-white/60 mb-8 text-sm">Enter Admin PIN or Parent Access Code</p>
                  <form onSubmit={handleUnlock}>
                      <input 
                        type="password" 
                        placeholder="PIN / CODE"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-emerald-400 mb-6 placeholder-white/20 transition-all focus:bg-black/30"
                        value={lockPin}
                        onChange={e => setLockPin(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">
                          Access Portal
                      </button>
                      
                      {/* Notifications on Lock Screen */}
                        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
                            {notifications.map(n => (
                            <div key={n.id} className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 animate-slide-in ${
                                n.type === 'success' ? 'bg-emerald-500/90 text-white' : 
                                n.type === 'error' ? 'bg-red-500/90 text-white' : 
                                'bg-blue-500/90 text-white'
                            }`}>
                                <span className="font-medium text-sm">{n.message}</span>
                            </div>
                            ))}
                        </div>
                  </form>
              </div>
          </div>
      )
  }

  // View: Parent Portal
  if (userRole === 'parent' && currentUser) {
      return (
          <div style={{ background: getThemeGradient() }}>
              <ParentPortal 
                  student={currentUser} 
                  attendance={attendance}
                  fees={fees}
                  grades={grades}
                  settings={settings}
                  announcement={announcement}
                  onLogout={handleLogout}
              />
          </div>
      );
  }

  // View: Admin Dashboard
  return (
    <div 
      className="flex h-screen overflow-hidden text-white selection:bg-emerald-500 selection:text-white transition-all duration-700"
      style={{ background: getThemeGradient() }}
    >
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-black/20 backdrop-blur-xl border-r border-white/10 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-bold leading-none whitespace-nowrap overflow-hidden text-ellipsis w-32">{settings.name}</h1>
                <span className="text-xs text-emerald-300 tracking-widest uppercase">Admin Portal</span>
             </div>
          </div>
        </div>
        
        <nav className="mt-8 flex flex-col gap-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="students" icon={Users} label="Students" />
          <NavItem view="teachers" icon={Briefcase} label="Teachers" />
          <NavItem view="attendance" icon={Calendar} label="Attendance" />
          <NavItem view="grades" icon={BookOpen} label="Grades" />
          <NavItem view="fees" icon={DollarSign} label="Finance" />
          <NavItem view="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="absolute bottom-0 w-full p-6">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-sm transition-all mb-4 text-red-200 hover:text-red-100"
           >
               <Lock className="w-4 h-4" /> Lock System
           </button>
           <div className="text-center text-xs text-emerald-200/50">
             &copy; {new Date().getFullYear()} {settings.name}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - Mobile Menu Button */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border-b border-white/10">
           <div className="font-bold text-lg">{settings.name}</div>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
             {isSidebarOpen ? <X /> : <Menu />}
           </button>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 capitalize">{currentView}</h2>
                <p className="text-emerald-100/70">Manage your school efficiently.</p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                 {/* Global Search Concept */}
                 <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-64 focus-within:bg-white/20 transition-all">
                    <Search className="w-4 h-4 text-white/50" />
                    <input type="text" placeholder="Global Search..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/30" />
                 </div>

                 {/* New Logout Button for Desktop Header */}
                 <button 
                   onClick={handleLogout}
                   className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-red-200 border border-white/10 hover:border-red-500/30 rounded-xl transition-all text-sm font-bold"
                   title="Log Out"
                 >
                    <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Log Out</span>
                 </button>
              </div>
            </header>

            {currentView === 'dashboard' && (
              <Dashboard 
                students={students} 
                fees={fees} 
                attendance={attendance} 
                grades={grades}
                activities={activities}
                announcement={announcement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
              />
            )}
            {currentView === 'students' && (
              <Students 
                students={students} 
                attendance={attendance}
                fees={fees}
                grades={grades}
                settings={settings}
                onAddStudent={handleAddStudent} 
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent} 
              />
            )}
            {currentView === 'teachers' && (
                <Teachers 
                    teachers={teachers} 
                    settings={settings}
                    onAddTeacher={handleAddTeacher}
                    onUpdateTeacher={handleUpdateTeacher}
                    onDeleteTeacher={handleDeleteTeacher}
                />
            )}
            {currentView === 'attendance' && <Attendance students={students} attendanceRecords={attendance} onSaveAttendance={handleSaveAttendance} />}
            {currentView === 'grades' && (
              <Grades 
                students={students} 
                grades={grades} 
                onSaveGrades={handleSaveGrades}
                settings={settings}
              />
            )}
            {currentView === 'fees' && (
              <Fees 
                students={students} 
                fees={fees} 
                expenses={expenses} 
                settings={settings}
                onAddFee={handleAddFee} 
                onBulkAddFees={handleBulkAddFees}
                onUpdateFee={handleUpdateFee}
                onDeleteFee={handleDeleteFee}
                onAddExpense={handleAddExpense} 
              />
            )}
            {currentView === 'settings' && <Settings onFactoryReset={handleFactoryReset} />}
          </div>
        </main>
      </div>

      {/* Notifications (Toast) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
         {notifications.map(n => (
           <div key={n.id} className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 animate-slide-in ${
             n.type === 'success' ? 'bg-emerald-500/90 text-white' : 
             n.type === 'error' ? 'bg-red-500/90 text-white' : 
             n.type === 'warning' ? 'bg-orange-500/90 text-white' :
             'bg-blue-500/90 text-white'
           }`}>
              {n.type === 'success' && <div className="p-1 bg-white/20 rounded-full"><Bell className="w-4 h-4" /></div>}
              <span className="font-medium text-sm">{n.message}</span>
           </div>
         ))}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
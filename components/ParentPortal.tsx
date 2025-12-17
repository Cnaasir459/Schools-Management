import React, { useMemo } from 'react';
import { LogOut, User, Calendar, BookOpen, DollarSign, Megaphone, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Student, AttendanceRecord, FeeRecord, ExamResult, PaymentStatus, SchoolSettings } from '../types';

interface ParentPortalProps {
  student: Student;
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  grades: ExamResult[];
  settings: SchoolSettings;
  announcement: string;
  onLogout: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ student, attendance, fees, grades, settings, announcement, onLogout }) => {
  
  const stats = useMemo(() => {
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const present = studentAttendance.filter(a => a.status === 'Present').length;
    const totalDays = studentAttendance.length;
    const rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    const studentFees = fees.filter(f => f.studentId === student.id);
    const pending = studentFees
        .filter(f => f.status === 'Pending' || f.status === 'Overdue')
        .reduce((sum, f) => sum + f.amount, 0);

    return { rate, pending, attendanceHistory: studentAttendance.slice(0, 5) };
  }, [student, attendance, fees]);

  const studentGrades = useMemo(() => {
      return grades.filter(g => g.studentId === student.id);
  }, [grades, student]);

  return (
    <div className="min-h-screen text-white p-4 md:p-8 animate-fade-in flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-400 overflow-hidden">
                {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-emerald-200" />}
            </div>
            <div>
                <h1 className="text-2xl font-bold">{student.fullName}</h1>
                <p className="text-emerald-200 text-sm">{student.grade} • {settings.name}</p>
            </div>
        </div>
        <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all flex items-center gap-2 text-sm font-bold">
            <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Log Out</span>
        </button>
      </header>

      {/* Announcement */}
      {announcement && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
              <Megaphone className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                  <h3 className="font-bold text-yellow-200">School Announcement</h3>
                  <p className="text-sm text-yellow-100/80 mt-1">{announcement}</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Card */}
          <GlassCard className="relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-emerald-300">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Attendance</h3>
              </div>
              <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-bold">{stats.rate}%</span>
                  <span className="text-sm opacity-60 mb-2">Presence Rate</span>
              </div>
              <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Recent Days</p>
                  {stats.attendanceHistory.map(a => (
                      <div key={a.id} className="flex justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                          <span className="opacity-80">{a.date}</span>
                          <span className={`${a.status === 'Present' ? 'text-emerald-400' : a.status === 'Late' ? 'text-yellow-400' : 'text-red-400'}`}>{a.status}</span>
                      </div>
                  ))}
              </div>
          </GlassCard>

          {/* Financial Card */}
          <GlassCard>
              <div className="flex items-center gap-2 mb-4 text-blue-300">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Fee Status</h3>
              </div>
              {stats.pending > 0 ? (
                  <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-center mb-4">
                      <p className="text-red-200 text-sm uppercase font-bold">Outstanding Balance</p>
                      <h2 className="text-4xl font-bold text-white mt-1">${stats.pending}</h2>
                      <p className="text-xs text-red-200/60 mt-2">Please clear dues promptly.</p>
                  </div>
              ) : (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 p-6 rounded-xl text-center mb-4">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                      <h3 className="text-xl font-bold text-emerald-100">All Fees Paid</h3>
                      <p className="text-sm text-emerald-200/60">Thank you!</p>
                  </div>
              )}
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {fees.filter(f => f.studentId === student.id).map(f => (
                      <div key={f.id} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg">
                          <div>
                              <p className="font-bold">{f.description}</p>
                              <p className="text-xs opacity-50">{f.date}</p>
                          </div>
                          <div className="text-right">
                              <p className="font-bold">${f.amount}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${f.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{f.status}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </GlassCard>

          {/* Academic Report */}
          <GlassCard className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6 text-purple-300">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Academic Performance</h3>
              </div>
              
              {studentGrades.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {studentGrades.map(grade => (
                          <div key={grade.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-purple-100">{grade.subject}</span>
                                  <span className="text-xs px-2 py-1 bg-white/10 rounded">{grade.term}</span>
                              </div>
                              <div className="flex items-end gap-2">
                                  <span className="text-3xl font-bold text-white">{grade.score}</span>
                                  <span className="text-xs opacity-50 mb-1">/ {grade.maxScore}</span>
                              </div>
                              <div className="w-full bg-black/30 h-1.5 rounded-full mt-3 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${grade.score >= 80 ? 'bg-emerald-400' : grade.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                                    style={{ width: `${(grade.score / grade.maxScore) * 100}%` }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12 opacity-50">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No grades recorded yet for this term.</p>
                  </div>
              )}
          </GlassCard>
      </div>
      
      <div className="text-center text-xs opacity-40 mt-8">
          &copy; {new Date().getFullYear()} {settings.name} Parent Portal
      </div>
    </div>
  );
};
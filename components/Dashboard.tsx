import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Users, DollarSign, CalendarCheck, TrendingUp, Megaphone, Activity, Star, Clock, Calendar } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Student, FeeRecord, AttendanceRecord, PaymentStatus, ActivityLog, ExamResult } from '../types';

interface DashboardProps {
  students: Student[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  grades: ExamResult[];
  activities: ActivityLog[];
  announcement: string;
  onUpdateAnnouncement: (text: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, fees, attendance, grades, activities, announcement, onUpdateAnnouncement }) => {
  
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalCollected = fees
      .filter(f => f.status === PaymentStatus.Paid)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calculate attendance percentage for today
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    const presentCount = todayRecords.filter(a => a.status === 'Present').length;
    const attendanceRate = todayRecords.length > 0 
      ? Math.round((presentCount / todayRecords.length) * 100) 
      : 0;

    return { totalStudents, totalCollected, attendanceRate };
  }, [students, fees, attendance]);

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const financialTrend = useMemo(() => {
      // Group fees by date
      const grouped: Record<string, number> = {};
      fees.filter(f => f.status === PaymentStatus.Paid).forEach(f => {
          grouped[f.date] = (grouped[f.date] || 0) + f.amount;
      });
      // Sort and take last 7 entries for chart
      return Object.entries(grouped)
        .sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .slice(-7)
        .map(([name, amount]) => ({ name, amount }));
  }, [fees]);

  const topStudents = useMemo(() => {
    const studentScores: Record<string, { total: number, count: number }> = {};
    grades.forEach(g => {
        if(!studentScores[g.studentId]) studentScores[g.studentId] = { total: 0, count: 0 };
        studentScores[g.studentId].total += g.score;
        studentScores[g.studentId].count++;
    });

    return Object.entries(studentScores)
        .map(([id, data]) => ({
            id,
            avg: Math.round(data.total / data.count),
            name: students.find(s => s.id === id)?.fullName || 'Unknown'
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3);
  }, [grades, students]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <Users className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Total Students</p>
            <h3 className="text-3xl font-bold">{stats.totalStudents}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <DollarSign className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Revenue (Collected)</p>
            <h3 className="text-3xl font-bold">${stats.totalCollected}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <CalendarCheck className="w-8 h-8 text-purple-300" />
          </div>
          <div>
            <p className="text-purple-100 text-sm">Attendance Today</p>
            <h3 className="text-3xl font-bold">{stats.attendanceRate}%</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <TrendingUp className="w-8 h-8 text-orange-300" />
          </div>
          <div>
            <p className="text-orange-100 text-sm">Active Term</p>
            <h3 className="text-3xl font-bold">Term 2</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Middle Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
             {/* Financial Trend */}
             <GlassCard className="h-72">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" /> Income Trend
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialTrend}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#fff" fontSize={10} tick={{fill: '#e2e8f0'}} />
                        <YAxis stroke="#fff" fontSize={10} tick={{fill: '#e2e8f0'}} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#34d399" fillOpacity={1} fill="url(#colorIncome)" />
                    </AreaChart>
                </ResponsiveContainer>
             </GlassCard>

             {/* Grade Distribution */}
             <GlassCard className="h-64">
                <h3 className="text-lg font-semibold mb-4">Students by Grade</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <XAxis dataKey="name" stroke="#fff" fontSize={12} tick={{fill: '#e2e8f0'}} />
                    <YAxis stroke="#fff" tick={{fill: '#e2e8f0'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    />
                    <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
        </div>

        {/* Right Column - Activity & Widgets */}
        <div className="space-y-6">
           <GlassCard className="bg-white/10 p-0 overflow-hidden">
               <div className="bg-emerald-500 p-4 text-center">
                   <h3 className="font-bold text-white uppercase tracking-widest text-sm">{new Date().toLocaleString('default', { month: 'long' })}</h3>
                   <h1 className="text-4xl font-bold text-white">{new Date().getDate()}</h1>
               </div>
               <div className="p-4 text-center">
                   <p className="text-sm opacity-60 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                   <div className="flex flex-col gap-2 text-xs text-left mt-2">
                        <div className="flex items-center gap-2 text-blue-300">
                             <div className="w-2 h-2 rounded-full bg-blue-400"></div> Mid-Term Exams
                        </div>
                        <div className="flex items-center gap-2 text-yellow-300">
                             <div className="w-2 h-2 rounded-full bg-yellow-400"></div> Teachers Meeting
                        </div>
                   </div>
               </div>
           </GlassCard>

           <GlassCard className="bg-yellow-500/10 border-yellow-500/30">
               <div className="flex items-center gap-3 mb-4">
                   <Megaphone className="w-6 h-6 text-yellow-300" />
                   <h3 className="text-lg font-bold text-yellow-100">Notice Board</h3>
               </div>
               <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 h-24 focus:outline-none focus:border-yellow-400/50 resize-none text-sm"
                  placeholder="Write a reminder..."
                  value={announcement}
                  onChange={(e) => onUpdateAnnouncement(e.target.value)}
               />
           </GlassCard>

           {/* Top Students */}
           <GlassCard>
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <Star className="w-5 h-5 text-yellow-400" /> Top Students
               </h3>
               <div className="space-y-3">
                   {topStudents.map((s, idx) => (
                       <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                           <div className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                               <span className="font-medium text-sm">{s.name}</span>
                           </div>
                           <span className="font-mono font-bold text-emerald-300">{s.avg}%</span>
                       </div>
                   ))}
               </div>
           </GlassCard>

           {/* Recent Activity */}
           <GlassCard className="flex-1 max-h-[400px] overflow-hidden flex flex-col">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <Clock className="w-5 h-5 text-blue-300" /> Recent Activity
               </h3>
               <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                   {activities.length > 0 ? (
                       activities.map(act => (
                           <div key={act.id} className="border-l-2 border-white/20 pl-3 py-1 relative">
                               <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full ${
                                   act.type === 'success' ? 'bg-emerald-500' : 
                                   act.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                               }`}></div>
                               <p className="text-sm font-semibold">{act.action}</p>
                               <p className="text-xs opacity-60 mb-1">{act.details}</p>
                               <p className="text-[10px] font-mono opacity-40">{new Date(act.date).toLocaleTimeString()} - {new Date(act.date).toLocaleDateString()}</p>
                           </div>
                       ))
                   ) : (
                       <p className="text-sm opacity-50 text-center">No recent activities.</p>
                   )}
               </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
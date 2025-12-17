import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Save, History, ListChecks, ChevronRight, Filter, Users, RefreshCw, Clock, ArrowLeft, CalendarDays } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Student, AttendanceRecord, GradeLevel, AttendanceStatus } from '../types';

interface AttendanceProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const Attendance: React.FC<AttendanceProps> = ({ students, attendanceRecords, onSaveAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempRecords, setTempRecords] = useState<Record<string, AttendanceStatus>>({});
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [filterGrade, setFilterGrade] = useState<string>('All');

  const filteredStudents = useMemo(() => {
    if (filterGrade === 'All') return students;
    return students.filter(s => s.grade === filterGrade);
  }, [students, filterGrade]);

  // Check if viewing a past date
  const isPastDate = selectedDate !== new Date().toISOString().split('T')[0];

  // Live Stats for current marking session
  const currentStats = useMemo(() => {
      const total = filteredStudents.length;
      let present = 0;
      let absent = 0;
      let late = 0;
      
      filteredStudents.forEach(s => {
          const status = tempRecords[s.id];
          if(status === AttendanceStatus.Present) present++;
          else if(status === AttendanceStatus.Late) late++;
          else absent++;
      });
      return { total, present, absent, late };
  }, [filteredStudents, tempRecords]);

  // Initialize temp state from existing records when date changes
  useEffect(() => {
    const existing = attendanceRecords.filter(r => r.date === selectedDate);
    const initialMap: Record<string, AttendanceStatus> = {};
    
    // Initialize for ALL students
    students.forEach(s => {
      const found = existing.find(r => r.studentId === s.id);
      initialMap[s.id] = found ? found.status : AttendanceStatus.Present; // Default to Present
    });
    
    setTempRecords(initialMap);
  }, [selectedDate, students, attendanceRecords]);

  // Calculate History Data
  const historyData = useMemo(() => {
    const groups: Record<string, { present: number; total: number; late: number }> = {};
    
    attendanceRecords.forEach(r => {
      const student = students.find(s => s.id === r.studentId);
      // Filter by Grade if selected
      if (filterGrade !== 'All' && student?.grade !== filterGrade) return;
      // Filter out orphaned records if student deleted
      if (!student) return;

      if (!groups[r.date]) {
        groups[r.date] = { present: 0, total: 0, late: 0 };
      }
      groups[r.date].total++;
      if (r.status === AttendanceStatus.Present) groups[r.date].present++;
      if (r.status === AttendanceStatus.Late) groups[r.date].late++;
    });

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, stats]) => ({
        date,
        present: stats.present,
        late: stats.late,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round(((stats.present + (stats.late * 0.5)) / stats.total) * 100) : 0
      }));
  }, [attendanceRecords, students, filterGrade]);

  const cycleStatus = (studentId: string) => {
    setTempRecords(prev => {
        const current = prev[studentId];
        let next = AttendanceStatus.Present;
        if(current === AttendanceStatus.Present) next = AttendanceStatus.Absent;
        else if(current === AttendanceStatus.Absent) next = AttendanceStatus.Late;
        else next = AttendanceStatus.Present;
        
        return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: AttendanceStatus) => {
      const newMap = { ...tempRecords };
      filteredStudents.forEach(s => {
          newMap[s.id] = status;
      });
      setTempRecords(newMap);
  }

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = filteredStudents.map(s => ({
      id: `${selectedDate}-${s.id}`,
      studentId: s.id,
      date: selectedDate,
      status: tempRecords[s.id]
    }));
    
    onSaveAttendance(newRecords);
  };

  const loadHistoryDate = (date: string) => {
    setSelectedDate(date);
    setViewMode('mark');
  };

  const resetToToday = () => {
      setSelectedDate(new Date().toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Toggle Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10 w-full lg:w-auto">
            <button 
                onClick={() => setViewMode('mark')}
                className={`flex-1 lg:flex-none flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'mark' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-white/5'}`}
            >
                <ListChecks className="w-4 h-4 mr-2" /> Daily Attendance
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`flex-1 lg:flex-none flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'history' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-white/5'}`}
            >
                <History className="w-4 h-4 mr-2" /> Attendance History
            </button>
        </div>

        <div className="flex flex-col md:flex-row w-full lg:w-auto gap-4">
            <GlassCard className="flex items-center p-3 flex-1 md:flex-none">
              <Filter className="w-5 h-5 text-gray-300 mr-2" />
              <select 
                className="bg-transparent border-none outline-none text-white w-full [&>option]:text-black cursor-pointer"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="All">All Grades</option>
                {Object.values(GradeLevel).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </GlassCard>

            {viewMode === 'mark' && (
              <>
                <GlassCard className="flex items-center p-3 flex-1 md:flex-none">
                  <Calendar className="w-5 h-5 text-gray-300 mr-2" />
                  <input 
                    type="date" 
                    className="bg-transparent border-none outline-none text-white placeholder-gray-300 w-full"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </GlassCard>
                
                <button 
                  onClick={handleSave}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm transition-all flex items-center justify-center whitespace-nowrap"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Changes
                </button>
              </>
            )}
        </div>
      </div>

      {viewMode === 'mark' ? (
        <>
          {/* Banner for Past Dates */}
          {isPastDate && (
              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-blue-300" />
                      <div>
                          <p className="text-blue-100 font-medium">Viewing Past Record</p>
                          <p className="text-xs text-blue-200/60">You are viewing/editing attendance for <span className="font-bold text-white">{selectedDate}</span></p>
                      </div>
                  </div>
                  <button 
                    onClick={resetToToday}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                      <RefreshCw className="w-3 h-3" /> Return to Today
                  </button>
              </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
             <div className="flex items-center gap-4 text-sm flex-wrap">
                <button onClick={() => markAll(AttendanceStatus.Present)} className="text-emerald-300 hover:text-white underline">All Present</button>
                <button onClick={() => markAll(AttendanceStatus.Absent)} className="text-red-300 hover:text-white underline">All Absent</button>
                <button onClick={() => markAll(AttendanceStatus.Late)} className="text-yellow-300 hover:text-white underline">All Late</button>
             </div>
             
             <div className="flex items-center gap-6 text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex-wrap">
               <div className="flex items-center gap-2">
                   <Users className="w-4 h-4 opacity-50" /> 
                   <span>Total: {currentStats.total}</span>
               </div>
               <div className="flex items-center gap-2 text-emerald-300">
                   <CheckCircle className="w-4 h-4" /> 
                   <span>{currentStats.present}</span>
               </div>
               <div className="flex items-center gap-2 text-yellow-300">
                   <Clock className="w-4 h-4" /> 
                   <span>{currentStats.late}</span>
               </div>
               <div className="flex items-center gap-2 text-red-300">
                   <XCircle className="w-4 h-4" /> 
                   <span>{currentStats.absent}</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const status = tempRecords[student.id];
                let borderColor = 'border-l-emerald-400';
                let icon = <CheckCircle className="w-6 h-6 text-emerald-400" />;
                let bgColor = 'bg-emerald-500/20';

                if(status === AttendanceStatus.Absent) {
                    borderColor = 'border-l-red-400';
                    icon = <XCircle className="w-6 h-6 text-red-400" />;
                    bgColor = 'bg-red-500/20';
                } else if (status === AttendanceStatus.Late) {
                    borderColor = 'border-l-yellow-400';
                    icon = <Clock className="w-6 h-6 text-yellow-400" />;
                    bgColor = 'bg-yellow-500/20';
                }

                return (
                  <GlassCard 
                    key={student.id} 
                    className={`cursor-pointer transition-all border-l-4 ${borderColor} hover:translate-y-[-2px]`}
                  >
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => cycleStatus(student.id)}
                    >
                      <div>
                        <h4 className="font-semibold text-lg">{student.fullName}</h4>
                        <p className="text-sm opacity-70">{student.grade}</p>
                      </div>
                      <div className={`p-2 rounded-full ${bgColor}`}>
                        {icon}
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
               <div className="col-span-full text-center py-10 opacity-50">No students found for this grade.</div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
             <div className="flex items-center gap-3 mb-4">
                 <CalendarDays className="w-6 h-6 text-emerald-300" />
                 <h3 className="text-xl font-semibold text-emerald-100">Attendance Log ({filterGrade === 'All' ? 'All Grades' : filterGrade})</h3>
             </div>
             
             {historyData.length > 0 ? (
               historyData.map(item => (
                   <div 
                      key={item.date} 
                      onClick={() => loadHistoryDate(item.date)}
                      className="group bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 shadow-lg rounded-xl p-5 text-white cursor-pointer transition-all duration-200"
                   >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/5 rounded-lg border border-white/10">
                                  <span className="text-xs uppercase opacity-60">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                                  <span className="text-xl font-bold">{new Date(item.date).getDate()}</span>
                              </div>
                              <div>
                                  <h4 className="text-lg font-bold">
                                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1 text-sm">
                                      <span className="flex items-center gap-1 text-emerald-300"><CheckCircle className="w-3 h-3" /> {item.present} Present</span>
                                      <span className="flex items-center gap-1 text-yellow-300"><Clock className="w-3 h-3" /> {item.late} Late</span>
                                      <span className="flex items-center gap-1 text-red-300"><XCircle className="w-3 h-3" /> {item.total - item.present - item.late} Absent</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                              <div className="text-right">
                                  <div className="text-2xl font-bold text-white">{item.percentage}%</div>
                                  <div className="text-[10px] uppercase tracking-wide opacity-40 font-semibold">Attendance Rate</div>
                              </div>
                              <div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                              </div>
                          </div>
                      </div>
                   </div>
               ))
             ) : (
               <GlassCard className="text-center py-12 border-dashed border-white/20">
                 <History className="w-12 h-12 text-white/20 mx-auto mb-4" />
                 <p className="text-white/50 text-lg">No history found for the selected filter.</p>
               </GlassCard>
             )}
        </div>
      )}
    </div>
  );
};
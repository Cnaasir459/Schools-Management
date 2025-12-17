
import React, { useState, useMemo } from 'react';
import { BookOpen, Calendar, Save, Filter, Award, Search, TrendingUp, Download } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Student, ExamResult, GradeLevel, Subject, Term, SchoolSettings } from '../types';

interface GradesProps {
  students: Student[];
  grades: ExamResult[];
  onSaveGrades: (newGrades: ExamResult[]) => void;
  settings: SchoolSettings;
}

export const Grades: React.FC<GradesProps> = ({ students, grades, onSaveGrades, settings }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(GradeLevel.Grade5);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(settings.subjects[0] || 'Mathematics');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTerm, setSelectedTerm] = useState<Term>('Term 1');
  const [searchStudent, setSearchStudent] = useState('');
  
  // Temporary state for inputs before saving
  const [inputScores, setInputScores] = useState<Record<string, string>>({});

  // Filter students by selected Grade Level
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && 
      s.fullName.toLowerCase().includes(searchStudent.toLowerCase())
    );
  }, [students, selectedGrade, searchStudent]);

  // Analytics for Current Selection
  const analytics = useMemo(() => {
      let total = 0;
      let count = 0;
      let max = 0;
      
      const relevantGrades = grades.filter(g => 
          g.date === selectedDate && g.subject === selectedSubject && g.term === selectedTerm &&
          students.find(s => s.id === g.studentId)?.grade === selectedGrade
      );
      
      if(relevantGrades.length > 0) {
          relevantGrades.forEach(g => {
              total += g.score;
              count++;
              if(g.score > max) max = g.score;
          });
          return { avg: Math.round(total / count), max, count };
      }
      return { avg: 0, max: 0, count: 0 };
  }, [grades, selectedDate, selectedSubject, selectedGrade, selectedTerm, students]);

  // When filters change, try to populate existing scores from history
  React.useEffect(() => {
    const existingScores: Record<string, string> = {};
    filteredStudents.forEach(s => {
      const record = grades.find(g => 
        g.studentId === s.id && 
        g.subject === selectedSubject && 
        g.date === selectedDate &&
        g.term === selectedTerm
      );
      if (record) {
        existingScores[s.id] = record.score.toString();
      }
    });
    setInputScores(existingScores);
  }, [selectedGrade, selectedSubject, selectedDate, selectedTerm, grades, filteredStudents]);

  const handleScoreChange = (studentId: string, val: string) => {
    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
        setInputScores(prev => ({ ...prev, [studentId]: val }));
    }
  };

  const handleSave = () => {
    const newEntries: ExamResult[] = [];
    Object.entries(inputScores).forEach(([studentId, scoreStr]) => {
      if (scoreStr !== '') {
        newEntries.push({
          id: `${selectedDate}-${studentId}-${selectedSubject}`,
          studentId,
          subject: selectedSubject,
          date: selectedDate,
          score: Number(scoreStr),
          maxScore: 100,
          term: selectedTerm
        });
      }
    });
    if (newEntries.length === 0) return;
    onSaveGrades(newEntries);
  };

  const exportGrades = () => {
      const csvContent = [
          ["Student Name", "ID", "Grade", "Subject", "Score", "Term", "Date"],
          ...filteredStudents.map(s => {
              const score = inputScores[s.id] || 'N/A';
              return [s.fullName, s.id, s.grade, selectedSubject, score, selectedTerm, selectedDate];
          })
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades_${selectedGrade}_${selectedSubject}_${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Header */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-300 uppercase font-bold tracking-wider">Class</label>
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-black"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {Object.values(GradeLevel).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-300 uppercase font-bold tracking-wider">Term</label>
             <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-yellow-400 [&>option]:text-black"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value as Term)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Summer">Summer</option>
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-300 uppercase font-bold tracking-wider">Subject</label>
             <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-blue-400 [&>option]:text-black"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                >
                  {settings.subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-300 uppercase font-bold tracking-wider">Exam Date</label>
             <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input 
                  type="date"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-400"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-300 uppercase font-bold tracking-wider">Search</label>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="ByName..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-white/30"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
             </div>
          </div>

        </div>
      </GlassCard>

      {/* Analytics Mini-Cards */}
      <div className="grid grid-cols-2 gap-4">
         <GlassCard className="bg-emerald-500/10 p-3 flex items-center justify-between">
            <div>
               <p className="text-xs uppercase font-bold opacity-60">Class Average</p>
               <h3 className="text-2xl font-bold">{analytics.avg > 0 ? analytics.avg : '-'}%</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400 opacity-50" />
         </GlassCard>
         <GlassCard className="bg-yellow-500/10 p-3 flex items-center justify-between">
            <div>
               <p className="text-xs uppercase font-bold opacity-60">Highest Score</p>
               <h3 className="text-2xl font-bold">{analytics.max > 0 ? analytics.max : '-'}%</h3>
            </div>
            <Award className="w-8 h-8 text-yellow-400 opacity-50" />
         </GlassCard>
      </div>

      {/* Grade Entry Table */}
      <GlassCard className="overflow-hidden p-0 min-h-[400px]">
         <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold flex items-center gap-2">
               <Award className="w-5 h-5 text-emerald-400" />
               Entering Scores: <span className="text-emerald-300">{selectedSubject}</span>
            </h3>
            <div className="flex gap-2">
                <button 
                  onClick={exportGrades}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button 
                onClick={handleSave}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
                >
                <Save className="w-4 h-4" /> Save Grades
                </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-white/5 text-white/60 uppercase text-xs">
                  <tr>
                     <th className="p-4 pl-6">Rank</th>
                     <th className="p-4 pl-6">Student Name</th>
                     <th className="p-4">ID</th>
                     <th className="p-4">Score (0-100)</th>
                     <th className="p-4">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredStudents.length > 0 ? (
                    filteredStudents
                    // Sort primarily by score descending for view (if score exists)
                    .sort((a,b) => (Number(inputScores[b.id]||0) - Number(inputScores[a.id]||0)))
                    .map((student, idx) => {
                      const score = inputScores[student.id] || '';
                      const numScore = Number(score);
                      let statusColor = 'text-gray-400';
                      let statusText = '-';
                      let inputBorder = 'border-white/10';

                      if (score !== '') {
                         if (numScore >= 90) { statusText = 'Excellent'; statusColor = 'text-emerald-400'; inputBorder = 'border-emerald-500'; }
                         else if (numScore >= 75) { statusText = 'Good'; statusColor = 'text-blue-400'; inputBorder = 'border-blue-500'; }
                         else if (numScore >= 50) { statusText = 'Pass'; statusColor = 'text-yellow-400'; inputBorder = 'border-yellow-500'; }
                         else { statusText = 'Fail'; statusColor = 'text-red-400'; inputBorder = 'border-red-500'; }
                      }

                      return (
                         <tr key={student.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 pl-6 font-mono opacity-50">#{score ? idx + 1 : '-'}</td>
                            <td className="p-4 pl-6 font-medium">{student.fullName}</td>
                            <td className="p-4 opacity-50 font-mono text-sm">{student.id}</td>
                            <td className="p-4">
                               <input 
                                 type="number" 
                                 min="0" max="100"
                                 placeholder="-"
                                 className={`w-24 bg-black/30 border ${inputBorder} rounded-lg p-2 text-center font-mono font-bold focus:outline-none transition-all ${score !== '' ? 'text-white' : 'text-gray-500'}`}
                                 value={score}
                                 onChange={(e) => handleScoreChange(student.id, e.target.value)}
                               />
                            </td>
                            <td className={`p-4 font-bold text-sm ${statusColor}`}>
                               {statusText}
                            </td>
                         </tr>
                      );
                    })
                  ) : (
                    <tr>
                       <td colSpan={5} className="p-12 text-center text-gray-400">
                          No students found in {selectedGrade}.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </GlassCard>
    </div>
  );
};

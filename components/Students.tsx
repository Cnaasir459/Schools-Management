import React, { useState, useMemo, useRef } from 'react';
import { Plus, Search, Trash2, ArrowLeft, Phone, User, Calendar, DollarSign, CheckCircle, XCircle, Filter, Camera, Edit2, Award, BookOpen, CreditCard, FileText, Printer, MapPin, Hash, AlertTriangle, Book, FilePlus, Key } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Student, GradeLevel, AttendanceRecord, FeeRecord, PaymentStatus, ExamResult, SchoolSettings, Note } from '../types';

interface StudentsProps {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  grades: ExamResult[];
  settings: SchoolSettings;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const Students: React.FC<StudentsProps> = ({ students, attendance, fees, grades, settings, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'notes'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Behavior' | 'Medical' | 'Academic' | 'Other'>('Behavior');

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    fullName: '',
    parentName: '',
    phone: '',
    grade: GradeLevel.Grade1,
    photo: '',
    gender: 'Male',
    dob: '',
    address: ''
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || s.grade === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const calculateAge = (dob: string) => {
    if(!dob) return 'N/A';
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Derived data for the selected student
  const studentDetails = useMemo(() => {
    if (!selectedStudent) return null;
    
    const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const studentFees = fees.filter(f => f.studentId === selectedStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const studentGrades = grades.filter(g => g.studentId === selectedStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPresent = studentAttendance.filter(a => a.status === 'Present').length;
    const totalLate = studentAttendance.filter(a => a.status === 'Late').length;
    
    const attendanceRate = studentAttendance.length > 0 
      ? Math.round(((totalPresent + (totalLate * 0.5)) / studentAttendance.length) * 100) 
      : 0;

    const totalFeesPaid = studentFees
      .filter(f => f.status === PaymentStatus.Paid)
      .reduce((sum, f) => sum + f.amount, 0);

    const totalFeesPending = studentFees
      .filter(f => f.status === PaymentStatus.Pending || f.status === PaymentStatus.Overdue)
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
    const avgScore = studentGrades.length > 0 ? Math.round(totalScore / studentGrades.length) : 0;

    return {
      attendance: studentAttendance,
      fees: studentFees,
      grades: studentGrades,
      stats: {
        attendanceRate,
        totalPresent,
        totalLate,
        totalDays: studentAttendance.length,
        totalFeesPaid,
        totalFeesPending,
        avgScore
      }
    };
  }, [selectedStudent, attendance, fees, grades]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedStudent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = reader.result as string;
        const updatedStudent = { ...selectedStudent, photo: newPhoto };
        onUpdateStudent(updatedStudent);
        setSelectedStudent(updatedStudent); // Update local state view
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = () => {
      if(!newNoteText.trim() || !selectedStudent) return;
      
      const note: Note = {
          id: Math.random().toString(36).substr(2,9),
          date: new Date().toISOString(),
          text: newNoteText,
          category: newNoteCategory
      };
      
      const updatedStudent = {
          ...selectedStudent,
          notes: [...(selectedStudent.notes || []), note]
      };
      
      onUpdateStudent(updatedStudent);
      setSelectedStudent(updatedStudent);
      setNewNoteText('');
  }

  const handleToggleLibrary = () => {
      if(selectedStudent) {
          const updated = { ...selectedStudent, libraryClearance: !selectedStudent.libraryClearance };
          onUpdateStudent(updated);
          setSelectedStudent(updated);
      }
  }

  const handleEditStudent = () => {
      if(selectedStudent) {
          setNewStudent(selectedStudent);
          setIsModalOpen(true);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.fullName && newStudent.parentName && newStudent.phone) {
      if(newStudent.id) {
          // Update mode
          onUpdateStudent(newStudent as Student);
          setSelectedStudent(newStudent as Student);
      } else {
          // Create mode
          onAddStudent({
            id: Math.random().toString(36).substr(2, 9),
            enrollmentDate: new Date().toISOString().split('T')[0],
            fullName: newStudent.fullName || '',
            parentName: newStudent.parentName || '',
            phone: newStudent.phone || '',
            grade: newStudent.grade as GradeLevel,
            photo: newStudent.photo,
            gender: newStudent.gender as 'Male' | 'Female',
            dob: newStudent.dob || '2015-01-01',
            address: newStudent.address || '',
            parentAccessCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
            libraryClearance: true
          });
      }
      setIsModalOpen(false);
      setNewStudent({ fullName: '', parentName: '', phone: '', grade: GradeLevel.Grade1, photo: '', gender: 'Male', dob: '', address: '' });
    }
  };

  const openAddModal = () => {
      setNewStudent({ fullName: '', parentName: '', phone: '', grade: GradeLevel.Grade1, photo: '', gender: 'Male', dob: '', address: '' });
      setIsModalOpen(true);
  }

  const printIdCard = () => {
     const w = window.open('', '', 'width=600,height=400');
     if(w) {
         w.document.write(document.getElementById('id-card-preview')?.innerHTML || '');
         w.document.close();
         w.print();
     }
  }

  const printReportCard = () => {
    const w = window.open('', '', 'width=800,height=900');
    if(w) {
        w.document.write(document.getElementById('report-card-preview')?.innerHTML || '');
        w.document.close();
        w.print();
    }
  }

  const printClassList = () => {
     const w = window.open('', '', 'width=900,height=600');
     if(w) {
         w.document.write(`
            <html><head><title>Class List</title>
            <style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f0f0f0;}</style>
            </head><body>
            <h1>Class List: ${filterGrade}</h1>
            <p>Total Students: ${filteredStudents.length}</p>
            <table>
                <thead><tr><th>ID</th><th>Name</th><th>Parent</th><th>Phone</th><th>Gender</th></tr></thead>
                <tbody>
                    ${filteredStudents.map(s => `<tr><td>${s.id}</td><td>${s.fullName}</td><td>${s.parentName}</td><td>${s.phone}</td><td>${s.gender}</td></tr>`).join('')}
                </tbody>
            </table>
            <script>window.print();</script>
            </body></html>
         `);
         w.document.close();
     }
  }

  // If a student is selected, show detail view
  if (selectedStudent && studentDetails) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={() => setSelectedStudent(null)}
          className="flex items-center text-emerald-200 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="lg:col-span-1 space-y-6 h-fit relative">
            <div className="text-center pb-6 border-b border-white/10 relative">
              <div 
                className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-400/30 overflow-hidden relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} alt={selectedStudent.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-emerald-300">
                    {selectedStudent.fullName.charAt(0)}
                  </span>
                )}
                
                {/* Overlay for uploading new photo */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Hidden Input for Update */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpdatePhoto}
              />

              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                {selectedStudent.fullName}
              </h2>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                {selectedStudent.grade}
              </span>

              <button 
                onClick={handleEditStudent}
                className="absolute top-0 right-0 p-2 text-white/50 hover:text-white transition-colors"
                title="Edit Profile"
              >
                  <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-emerald-100/80">
                <User className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs opacity-60">Parent Name</p>
                  <p className="font-medium text-white">{selectedStudent.parentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-emerald-100/80">
                <Hash className="w-4 h-4 text-emerald-400" />
                 <div>
                  <p className="text-xs opacity-60">Age / Gender</p>
                  <p className="font-medium text-white">{calculateAge(selectedStudent.dob)} Years / {selectedStudent.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-emerald-100/80">
                <Phone className="w-4 h-4 text-emerald-400" />
                 <div>
                  <p className="text-xs opacity-60">Phone</p>
                  <p className="font-medium text-white">{selectedStudent.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-emerald-100/80">
                <Key className="w-4 h-4 text-emerald-400" />
                 <div>
                  <p className="text-xs opacity-60">Parent Access Code</p>
                  <p className="font-mono font-bold text-white tracking-widest">{selectedStudent.parentAccessCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
                 {/* Status Indicators */}
                 {studentDetails.stats.attendanceRate < 75 && (
                     <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                         <AlertTriangle className="w-5 h-5 text-red-400" />
                         <span className="text-xs font-bold text-red-200">Low Attendance Warning</span>
                     </div>
                 )}
                 <div onClick={handleToggleLibrary} className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${selectedStudent.libraryClearance ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                     <Book className={`w-5 h-5 ${selectedStudent.libraryClearance ? 'text-emerald-400' : 'text-yellow-400'}`} />
                     <span className="text-xs font-bold text-white">Library: {selectedStudent.libraryClearance ? 'Cleared' : 'Books Outstanding'}</span>
                 </div>
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                <button onClick={() => setIsIdCardOpen(true)} className="flex items-center justify-center gap-2 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg text-xs font-bold transition-colors">
                    <CreditCard className="w-4 h-4" /> ID Card
                </button>
                <button onClick={() => setIsReportCardOpen(true)} className="flex items-center justify-center gap-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg text-xs font-bold transition-colors">
                    <FileText className="w-4 h-4" /> Report Card
                </button>
            </div>
          </GlassCard>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>Overview</button>
                <button onClick={() => setActiveTab('grades')} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'grades' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>Academic Report</button>
                <button onClick={() => setActiveTab('notes')} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeTab === 'notes' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>Notes & Medical</button>
            </div>

            {activeTab === 'overview' && (
                <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
                    <h3 className="text-sm font-medium text-blue-200 mb-2">Attendance Rate</h3>
                    <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{studentDetails.stats.attendanceRate}%</span>
                    <span className="text-sm opacity-60">({studentDetails.stats.totalPresent}P / {studentDetails.stats.totalLate}L)</span>
                    </div>
                </GlassCard>
                <GlassCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4">
                    <h3 className="text-sm font-medium text-emerald-200 mb-2">Total Fees Paid</h3>
                    <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${studentDetails.stats.totalFeesPaid}</span>
                    {studentDetails.stats.totalFeesPending > 0 && (
                        <span className="text-sm text-red-300">(${studentDetails.stats.totalFeesPending} Due)</span>
                    )}
                    </div>
                </GlassCard>
                </div>

                {/* Attendance History */}
                <GlassCard>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Recent Attendance
                </h3>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {studentDetails.attendance.length > 0 ? (
                    studentDetails.attendance.slice(0, 10).map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="font-mono text-sm">{record.date}</span>
                        <div className={`flex items-center gap-2 text-sm ${
                            record.status === 'Present' ? 'text-emerald-300' : 
                            record.status === 'Late' ? 'text-yellow-300' : 'text-red-300'
                        }`}>
                            {record.status}
                        </div>
                        </div>
                    ))
                    ) : (
                    <p className="text-center opacity-50 py-4">No attendance records yet.</p>
                    )}
                </div>
                </GlassCard>
                </>
            )}

            {activeTab === 'grades' && (
                // Grades Tab
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                       <BookOpen className="w-5 h-5 text-emerald-400" /> Academic Performance
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 uppercase text-xs font-bold text-white/70">
                                <tr>
                                    <th className="p-3">Term</th>
                                    <th className="p-3">Subject</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {studentDetails.grades.length > 0 ? (
                                    studentDetails.grades.map(g => (
                                        <tr key={g.id} className="hover:bg-white/5">
                                            <td className="p-3 font-mono text-sm opacity-80">{g.term}</td>
                                            <td className="p-3 font-medium">{g.subject}</td>
                                            <td className="p-3 font-bold">{g.score}/100</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    g.score >= 90 ? 'bg-emerald-500/20 text-emerald-300' :
                                                    g.score >= 70 ? 'bg-blue-500/20 text-blue-300' :
                                                    g.score >= 50 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {g.score >= 90 ? 'Excellent' : g.score >= 70 ? 'Good' : g.score >= 50 ? 'Pass' : 'Fail'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center opacity-50">No grades recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            {activeTab === 'notes' && (
                <div className="space-y-6">
                    <GlassCard>
                         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FilePlus className="w-5 h-5 text-emerald-400" /> Add Note
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <select 
                                    className="bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={newNoteCategory}
                                    onChange={e => setNewNoteCategory(e.target.value as any)}
                                >
                                    <option value="Behavior">Behavior</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <textarea 
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white h-24 focus:border-emerald-400 outline-none"
                                placeholder="Write details..."
                                value={newNoteText}
                                onChange={e => setNewNoteText(e.target.value)}
                            />
                            <button onClick={handleAddNote} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg self-end font-bold">Save Note</button>
                        </div>
                    </GlassCard>

                    <GlassCard>
                         <h3 className="text-lg font-semibold mb-4">Note History</h3>
                         <div className="space-y-3">
                             {selectedStudent.notes && selectedStudent.notes.length > 0 ? (
                                 [...selectedStudent.notes].reverse().map(note => (
                                     <div key={note.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                         <div className="flex justify-between items-start mb-2">
                                             <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                 note.category === 'Behavior' ? 'bg-red-500/20 text-red-300' :
                                                 note.category === 'Medical' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                                             }`}>{note.category}</span>
                                             <span className="text-xs opacity-50">{new Date(note.date).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-sm opacity-90">{note.text}</p>
                                     </div>
                                 ))
                             ) : (
                                 <p className="text-center opacity-50 py-4">No notes recorded.</p>
                             )}
                         </div>
                    </GlassCard>
                </div>
            )}

          </div>
        </div>

        {/* ID Card Modal */}
        {isIdCardOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsIdCardOpen(false)}>
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                    <div id="id-card-preview" className="p-0">
                        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', background: 'white' }}>
                            <div style={{ background: '#10b981', padding: '20px', textAlign: 'center', color: 'white' }}>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{settings.name}</h2>
                                <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}>STUDENT ID CARD</p>
                            </div>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <img 
                                    src={selectedStudent.photo || 'https://via.placeholder.com/150'} 
                                    alt="Student" 
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981', margin: '0 auto 15px' }} 
                                />
                                <h3 style={{ margin: '0 0 5px', color: '#333', fontSize: '20px' }}>{selectedStudent.fullName}</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ID: {selectedStudent.id}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left', marginTop: '20px', fontSize: '13px', color: '#444' }}>
                                    <div><strong>Grade:</strong> {selectedStudent.grade}</div>
                                    <div><strong>DOB:</strong> {selectedStudent.dob}</div>
                                    <div><strong>Phone:</strong> {selectedStudent.phone}</div>
                                    <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                                </div>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '10px', textAlign: 'center', borderTop: '1px solid #eee', fontSize: '10px', color: '#888' }}>
                                {settings.address} | {settings.phone}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
                        <button onClick={() => setIsIdCardOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Close</button>
                        <button onClick={printIdCard} className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2"><Printer className="w-4 h-4"/> Print</button>
                    </div>
                </div>
            </div>
        )}

        {/* Report Card Modal */}
        {isReportCardOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsReportCardOpen(false)}>
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex-1 overflow-y-auto p-8" id="report-card-preview">
                        <div style={{ fontFamily: 'Times New Roman, serif', color: 'black' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px double #333', paddingBottom: '20px' }}>
                                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{settings.name}</h1>
                                <p style={{ fontSize: '14px', margin: '5px 0' }}>{settings.address}</p>
                                <h2 style={{ fontSize: '18px', marginTop: '15px', textDecoration: 'underline' }}>STUDENT REPORT CARD</h2>
                            </div>
                            
                            <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '5px' }}><strong>Student Name:</strong> {selectedStudent.fullName}</td>
                                        <td style={{ padding: '5px' }}><strong>Grade:</strong> {selectedStudent.grade}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '5px' }}><strong>Student ID:</strong> {selectedStudent.id}</td>
                                        <td style={{ padding: '5px' }}><strong>Term:</strong> Term 1 (Example)</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0' }}>
                                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>Subject</th>
                                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>Score</th>
                                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>Grade</th>
                                        <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentDetails.grades.map(g => (
                                        <tr key={g.id}>
                                            <td style={{ border: '1px solid #333', padding: '8px' }}>{g.subject}</td>
                                            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>{g.score}</td>
                                            <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                                                {g.score >= 90 ? 'A' : g.score >= 80 ? 'B' : g.score >= 70 ? 'C' : g.score >= 60 ? 'D' : 'F'}
                                            </td>
                                            <td style={{ border: '1px solid #333', padding: '8px' }}>
                                                {g.score >= 90 ? 'Excellent' : g.score >= 70 ? 'Good' : 'Needs Improvement'}
                                            </td>
                                        </tr>
                                    ))}
                                    {studentDetails.grades.length === 0 && <tr><td colSpan={4} style={{ border: '1px solid #333', padding: '10px', textAlign: 'center' }}>No Grades Recorded</td></tr>}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #333', paddingTop: '5px' }}>Class Teacher</div>
                                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #333', paddingTop: '5px' }}>Principal</div>
                            </div>
                        </div>
                    </div>
                     <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
                        <button onClick={() => setIsReportCardOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Close</button>
                        <button onClick={printReportCard} className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2"><Printer className="w-4 h-4"/> Print Report</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Default List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full md:w-auto flex-1">
          <GlassCard className="flex-1 flex items-center p-3">
            <Search className="w-5 h-5 text-gray-300 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-white placeholder-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </GlassCard>
          
          <GlassCard className="flex items-center p-3 w-48 hidden md:flex">
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
        </div>

        <div className="flex gap-2">
            <button 
            onClick={printClassList}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-4 rounded-xl font-semibold backdrop-blur-sm transition-all"
            title="Print Class List"
            >
            <Printer className="w-5 h-5" />
            </button>
            <button 
            onClick={openAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg backdrop-blur-sm transition-all flex items-center whitespace-nowrap"
            >
            <Plus className="w-5 h-5 mr-2" /> Add Student
            </button>
        </div>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/10 text-emerald-100 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4 w-16">Photo</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Parent Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono text-sm opacity-80">{student.id}</td>
                    <td className="p-4">
                       <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/20">
                          {student.photo ? (
                            <img src={student.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white/50" />
                          )}
                       </div>
                    </td>
                    <td className="p-4 font-medium group-hover:text-emerald-300 transition-colors">{student.fullName}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                        {student.grade}
                      </span>
                    </td>
                    <td className="p-4">{student.parentName}</td>
                    <td className="p-4 opacity-80">{student.phone}</td>
                    <td className="p-4 flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setNewStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          onDeleteStudent(student.id);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-300">
                    {students.length === 0 ? "No students yet." : "No students found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl bg-[#1a4a4a]/90 border-white/30">
            <h2 className="text-2xl font-bold mb-6">{newStudent.id ? 'Edit Student' : 'Register New Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Upload - Left Column */}
                  <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer mb-4" onClick={() => document.getElementById('photo-upload')?.click()}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center group-hover:border-emerald-500 transition-colors relative">
                            {newStudent.photo ? (
                            <img src={newStudent.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                            <Camera className="w-10 h-10 text-white/50" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full shadow-lg">
                            <Plus className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                  </div>

                  {/* Form Fields - Right 2 Columns */}
                  <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                            value={newStudent.fullName}
                            onChange={e => setNewStudent({...newStudent, fullName: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-gray-300 mb-1">Gender</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-black"
                                value={newStudent.gender}
                                onChange={e => setNewStudent({...newStudent, gender: e.target.value as 'Male'|'Female'})}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm text-gray-300 mb-1">Date of Birth</label>
                            <input 
                                required
                                type="date" 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                                value={newStudent.dob}
                                onChange={e => setNewStudent({...newStudent, dob: e.target.value})}
                            />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm text-gray-300 mb-1">Grade</label>
                        <select 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-black"
                            value={newStudent.grade}
                            onChange={e => setNewStudent({...newStudent, grade: e.target.value as GradeLevel})}
                        >
                            {Object.values(GradeLevel).map(g => (
                            <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm text-gray-300 mb-1">Parent Phone</label>
                        <input 
                            required
                            type="tel" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                            value={newStudent.phone}
                            onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Parent Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                            value={newStudent.parentName}
                            onChange={e => setNewStudent({...newStudent, parentName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Address</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                            value={newStudent.address}
                            onChange={e => setNewStudent({...newStudent, address: e.target.value})}
                        />
                    </div>
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold shadow-lg"
                >
                  Save Student
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
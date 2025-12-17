import React, { useState } from 'react';
import { Plus, Search, Trash2, Phone, Briefcase, BookOpen, Edit2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Teacher, SchoolSettings } from '../types';

interface TeachersProps {
  teachers: Teacher[];
  settings: SchoolSettings;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export const Teachers: React.FC<TeachersProps> = ({ teachers, settings, onAddTeacher, onUpdateTeacher, onDeleteTeacher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    fullName: '',
    phone: '',
    subjects: [],
    joinDate: new Date().toISOString().split('T')[0]
  });

  const filteredTeachers = teachers.filter(t => t.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubjectToggle = (subject: string) => {
      const current = newTeacher.subjects || [];
      if(current.includes(subject)) {
          setNewTeacher({ ...newTeacher, subjects: current.filter(s => s !== subject) });
      } else {
          setNewTeacher({ ...newTeacher, subjects: [...current, subject] });
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(newTeacher.fullName && newTeacher.phone) {
          if(newTeacher.id) {
              onUpdateTeacher(newTeacher as Teacher);
          } else {
              onAddTeacher({
                  id: Math.random().toString(36).substr(2,9),
                  fullName: newTeacher.fullName,
                  phone: newTeacher.phone,
                  subjects: newTeacher.subjects || [],
                  joinDate: newTeacher.joinDate || new Date().toISOString().split('T')[0]
              });
          }
          setIsModalOpen(false);
          setNewTeacher({ fullName: '', phone: '', subjects: [], joinDate: '' });
      }
  }

  const openEdit = (t: Teacher) => {
      setNewTeacher(t);
      setIsModalOpen(true);
  }

  const openAdd = () => {
      setNewTeacher({ fullName: '', phone: '', subjects: [], joinDate: new Date().toISOString().split('T')[0] });
      setIsModalOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
                <GlassCard className="flex items-center p-3">
                    <Search className="w-5 h-5 text-gray-300 mr-2" />
                    <input 
                    type="text" 
                    placeholder="Search Teachers..." 
                    className="bg-transparent border-none outline-none text-white placeholder-gray-300 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </GlassCard>
            </div>
            <button 
                onClick={openAdd}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg backdrop-blur-sm transition-all flex items-center whitespace-nowrap"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Teacher
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(t => (
                <GlassCard key={t.id} className="relative group">
                     <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                 <Briefcase className="w-6 h-6 text-blue-300" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">{t.fullName}</h3>
                                 <p className="text-sm opacity-60 flex items-center gap-1"><Phone className="w-3 h-3"/> {t.phone}</p>
                             </div>
                         </div>
                     </div>
                     <div className="space-y-3">
                         <div>
                             <p className="text-xs uppercase text-gray-400 mb-2 font-bold">Subjects</p>
                             <div className="flex flex-wrap gap-2">
                                 {t.subjects.length > 0 ? t.subjects.map(s => (
                                     <span key={s} className="px-2 py-1 rounded bg-white/10 text-xs">{s}</span>
                                 )) : <span className="text-xs opacity-50">No subjects assigned</span>}
                             </div>
                         </div>
                         <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                             <span className="text-xs opacity-50">Joined: {t.joinDate}</span>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openEdit(t)} className="p-2 hover:bg-blue-500/20 rounded text-blue-300"><Edit2 className="w-4 h-4"/></button>
                                 <button onClick={() => onDeleteTeacher(t.id)} className="p-2 hover:bg-red-500/20 rounded text-red-300"><Trash2 className="w-4 h-4"/></button>
                             </div>
                         </div>
                     </div>
                </GlassCard>
            ))}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <GlassCard className="w-full max-w-lg bg-[#1a4a4a]/90 border-white/30">
                    <h2 className="text-2xl font-bold mb-6">{newTeacher.id ? 'Edit Teacher' : 'Add Teacher'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                            <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-400 outline-none" 
                                value={newTeacher.fullName} onChange={e => setNewTeacher({...newTeacher, fullName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Phone</label>
                            <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-400 outline-none" 
                                value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Subjects Taught</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 rounded-lg">
                                {settings.subjects.map(sub => (
                                    <label key={sub} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                                        <input type="checkbox" 
                                            checked={newTeacher.subjects?.includes(sub)}
                                            onChange={() => handleSubjectToggle(sub)}
                                            className="accent-emerald-400"
                                        />
                                        <span className="text-sm">{sub}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold">Save Teacher</button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        )}
    </div>
  );
}
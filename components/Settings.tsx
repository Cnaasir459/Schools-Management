import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, AlertTriangle, Database, ShieldCheck, FileSpreadsheet, Trash2, Building, Palette, List, Users, Save, ChevronRight, HardDrive } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { DataService } from '../services/dataService';
import { SchoolSettings, GradeLevel } from '../types';

interface SettingsProps {
    onFactoryReset?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onFactoryReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<SchoolSettings>(DataService.getSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'academic'>('general');
  const [storageUsed, setStorageUsed] = useState<string>('0 KB');

  // Promotion State
  const [promoteFrom, setPromoteFrom] = useState<GradeLevel>(GradeLevel.Grade1);
  const [promoteTo, setPromoteTo] = useState<GradeLevel>(GradeLevel.Grade2);

  useEffect(() => {
     document.body.className = `theme-${settings.theme.toLowerCase()}`;
     calculateStorage();
  }, [settings.theme]);

  const calculateStorage = () => {
      let total = 0;
      for(let key in localStorage) {
          if(localStorage.hasOwnProperty(key)) {
              total += ((localStorage[key].length + key.length) * 2);
          }
      }
      setStorageUsed((total / 1024).toFixed(2) + ' KB');
  }

  const handleSaveSettings = () => {
      DataService.saveSettings(settings);
      alert('Settings saved successfully!');
      window.location.reload(); 
  }

  const handlePromote = () => {
      if(confirm(`Are you sure you want to promote ALL students from ${promoteFrom} to ${promoteTo}? This affects all students in that grade.`)) {
          const updated = DataService.promoteStudents(promoteFrom, promoteTo);
          alert('Promotion complete. Reloading...');
          window.location.reload();
      }
  }

  const handleDownload = () => {
    const data = DataService.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabdullahi_sms_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const csv = event.target?.result as string;
          const newStudents = DataService.parseStudentCSV(csv);
          if (newStudents.length > 0) {
              const current = DataService.getStudents();
              DataService.saveStudents([...current, ...newStudents]);
              alert(`Successfully imported ${newStudents.length} students.`);
              window.location.reload();
          } else {
              alert('No valid student records found in CSV.');
          }
      };
      reader.readAsText(file);
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('WARNING: This will overwrite all current data with the backup file. Are you sure?')) {
          const success = DataService.restoreData(json);
          if (success) {
            alert('Data restored successfully! The page will now reload.');
            window.location.reload();
          } else {
            alert('Failed to restore data. Invalid file format.');
          }
        }
      } catch (err) {
        alert('Error reading file. Please upload a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
      if(confirm('DANGER: This will permanently delete ALL data. Are you absolutely sure?')) {
          if(onFactoryReset) onFactoryReset();
      }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-4 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${activeTab==='general' ? 'bg-white/10' : 'opacity-50'}`}>General Settings</button>
          <button onClick={() => setActiveTab('academic')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${activeTab==='academic' ? 'bg-white/10' : 'opacity-50'}`}>Academic & Fees</button>
          <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${activeTab==='data' ? 'bg-white/10' : 'opacity-50'}`}>Data & Backup</button>
      </div>

      {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                      <Building className="w-5 h-5 text-emerald-400"/>
                      <h3 className="text-lg font-bold">School Profile</h3>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs uppercase text-gray-400 mb-1">School Name</label>
                          <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" 
                              value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-gray-400 mb-1">Address</label>
                          <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" 
                              value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-gray-400 mb-1">Contact Phone</label>
                          <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" 
                              value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                      </div>
                  </div>
              </GlassCard>

              <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-purple-400"/>
                      <h3 className="text-lg font-bold">Visual Theme</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      {['Ocean', 'Forest', 'Sunset', 'Midnight'].map(theme => (
                          <button 
                            key={theme}
                            onClick={() => setSettings({...settings, theme: theme as any})}
                            className={`p-4 rounded-xl border ${settings.theme === theme ? 'border-emerald-400 bg-white/10' : 'border-white/10 bg-black/20'} transition-all`}
                          >
                              {theme}
                          </button>
                      ))}
                  </div>
              </GlassCard>

              <div className="md:col-span-2 flex justify-end">
                  <button onClick={handleSaveSettings} className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                  </button>
              </div>
          </div>
      )}

      {activeTab === 'academic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                      <List className="w-5 h-5 text-blue-400"/>
                      <h3 className="text-lg font-bold">Subjects Configuration</h3>
                  </div>
                  <textarea 
                      className="w-full h-40 bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm"
                      value={settings.subjects.join('\n')}
                      onChange={e => setSettings({...settings, subjects: e.target.value.split('\n')})}
                      placeholder="Math&#10;Science&#10;English"
                  />
                  <p className="text-xs text-gray-400 mt-2">One subject per line.</p>
              </GlassCard>

              <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                      <List className="w-5 h-5 text-yellow-400"/>
                      <h3 className="text-lg font-bold">Fee Types</h3>
                  </div>
                  <textarea 
                      className="w-full h-40 bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm"
                      value={settings.feeTypes.join('\n')}
                      onChange={e => setSettings({...settings, feeTypes: e.target.value.split('\n')})}
                      placeholder="Tuition Fee&#10;Exam Fee&#10;Bus Fee"
                  />
                  <p className="text-xs text-gray-400 mt-2">One fee type per line.</p>
              </GlassCard>

              <GlassCard className="md:col-span-2 border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-emerald-400"/>
                      <h3 className="text-lg font-bold">Class Promotion Tool</h3>
                  </div>
                  <div className="flex flex-col md:flex-row items-end gap-4 bg-white/5 p-4 rounded-xl">
                      <div className="flex-1 w-full">
                          <label className="text-xs text-gray-400 mb-1 block">Promote From</label>
                          <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 [&>option]:text-black" value={promoteFrom} onChange={e => setPromoteFrom(e.target.value as GradeLevel)}>
                              {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                      </div>
                      <div className="pb-3 text-emerald-400">
                          <ChevronRight />
                      </div>
                      <div className="flex-1 w-full">
                          <label className="text-xs text-gray-400 mb-1 block">Promote To</label>
                          <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 [&>option]:text-black" value={promoteTo} onChange={e => setPromoteTo(e.target.value as GradeLevel)}>
                              {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                      </div>
                      <button onClick={handlePromote} className="w-full md:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold">Promote Students</button>
                  </div>
                  <p className="text-xs text-emerald-200/50 mt-2">Warning: This will move all students from the source grade to the destination grade instantly.</p>
              </GlassCard>

              <div className="md:col-span-2 flex justify-end">
                  <button onClick={handleSaveSettings} className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Configuration
                  </button>
              </div>
          </div>
      )}

      {activeTab === 'data' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassCard>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                    <Database className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold">Backup Data</h3>
                    <p className="text-sm opacity-70">Download JSON.</p>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" /> Download
                </button>
                </GlassCard>

                <GlassCard>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Upload className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold">Restore</h3>
                    <p className="text-sm opacity-70">Upload Backup JSON.</p>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept=".json"
                    className="hidden"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <Upload className="w-4 h-4" /> Upload File
                </button>
                </GlassCard>

                <GlassCard>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Users className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold">Bulk Import</h3>
                    <p className="text-sm opacity-70">Students from CSV.</p>
                    </div>
                </div>
                 <input 
                    type="file" 
                    ref={csvInputRef}
                    onChange={handleImportCSV}
                    accept=".csv"
                    className="hidden"
                />
                <button 
                    onClick={() => csvInputRef.current?.click()}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Import CSV
                </button>
                </GlassCard>
            </div>

            <GlassCard className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <HardDrive className="w-8 h-8 text-gray-400" />
                    <div>
                        <h3 className="text-lg font-bold">Storage Usage</h3>
                        <p className="text-sm opacity-60">Estimated LocalStorage usage</p>
                    </div>
                </div>
                <div className="text-2xl font-mono text-emerald-400">{storageUsed}</div>
            </GlassCard>
            
            {/* Danger Zone */}
            <div className="mt-8">
                <h3 className="text-red-300 font-bold mb-4 uppercase text-sm tracking-wider">Danger Zone</h3>
                <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <div>
                            <h4 className="text-xl font-bold text-red-100">Factory Reset</h4>
                            <p className="text-sm text-red-200/60 mt-1">
                                Permanently remove all students, fees, attendance records, and settings. 
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Reset Application
                    </button>
                </div>
            </div>
        </>
      )}

      <GlassCard className="border-emerald-500/30 bg-emerald-900/10 mt-6">
         <div className="flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
               <h4 className="text-lg font-bold text-emerald-300">Data Privacy Note</h4>
               <p className="text-sm text-emerald-100/70 mt-1">
                 All data in "Cabdullahi ibnu Mubarak SMS" is stored 100% locally on this device. 
               </p>
            </div>
         </div>
      </GlassCard>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { DollarSign, Filter, Plus, History, List, Calendar, TrendingUp, ChevronRight, Printer, TrendingDown, Wallet, Pencil, Trash2, AlertCircle, Layers, PieChart as PieChartIcon, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { GlassCard } from './GlassCard';
import { Student, FeeRecord, PaymentStatus, GradeLevel, ExpenseRecord, ExpenseCategory, SchoolSettings } from '../types';

interface FeesProps {
  students: Student[];
  fees: FeeRecord[];
  expenses: ExpenseRecord[];
  settings: SchoolSettings;
  onAddFee: (fee: FeeRecord) => void;
  onBulkAddFees: (fees: FeeRecord[]) => void;
  onUpdateFee: (fee: FeeRecord) => void;
  onDeleteFee: (id: string) => void;
  onAddExpense: (expense: ExpenseRecord) => void;
}

export const Fees: React.FC<FeesProps> = ({ students, fees, expenses, settings, onAddFee, onBulkAddFees, onUpdateFee, onDeleteFee, onAddExpense }) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [viewMode, setViewMode] = useState<'transactions' | 'summary' | 'analytics'>('transactions');
  
  // New Record States
  const [newFee, setNewFee] = useState<Partial<FeeRecord>>({
    studentId: students[0]?.id || '',
    amount: 0,
    status: PaymentStatus.Paid,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [bulkFeeData, setBulkFeeData] = useState({
      grade: GradeLevel.Grade1,
      amount: 50,
      description: 'Tuition Fee',
      date: new Date().toISOString().split('T')[0]
  });

  const [newExpense, setNewExpense] = useState<Partial<ExpenseRecord>>({
    category: ExpenseCategory.Other,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Helpers
  const getStudentName = (id: string) => students.find(s => s.id === id)?.fullName || 'Unknown Student';
  const getStudentGrade = (id: string) => students.find(s => s.id === id)?.grade;

  // Pie Chart Data
  const expenseChartData = useMemo(() => {
      const data: Record<string, number> = {};
      expenses.forEach(e => {
          data[e.category] = (data[e.category] || 0) + e.amount;
      });
      return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Overdue Logic
  const overdueStudents = useMemo(() => {
      const overdueFees = fees.filter(f => f.status === PaymentStatus.Overdue);
      return overdueFees.map(f => ({
          ...f,
          studentName: getStudentName(f.studentId)
      }));
  }, [fees, students]);

  // Filtered Data
  const filteredFees = fees.filter(f => {
    const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
    const student = students.find(s => s.id === f.studentId);
    const matchesGrade = filterGrade === 'All' || student?.grade === filterGrade;
    const matchesDate = (!filterDateStart || f.date >= filterDateStart) && (!filterDateEnd || f.date <= filterDateEnd);
    return matchesStatus && matchesGrade && matchesDate;
  });

  const filteredExpenses = expenses;

  // Financial Summary Calculation
  const financialSummary = useMemo(() => {
    const totalIncome = fees
      .filter(f => f.status === PaymentStatus.Paid)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses
    };
  }, [fees, expenses]);

  const openAddModal = () => {
    if (activeTab === 'income') {
      setNewFee({
        id: undefined, 
        studentId: students[0]?.id || '',
        amount: 0,
        status: PaymentStatus.Paid,
        description: settings.feeTypes[0] || '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      setNewExpense({
        id: undefined,
        category: ExpenseCategory.Other,
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const openEditFeeModal = (fee: FeeRecord) => {
    setNewFee({ ...fee });
    setIsModalOpen(true);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const targetStudents = students.filter(s => s.grade === bulkFeeData.grade);
      if(targetStudents.length === 0) {
          alert('No students found in selected grade.');
          return;
      }
      
      const newFees: FeeRecord[] = targetStudents.map(s => ({
          id: Math.random().toString(36).substr(2,9),
          studentId: s.id,
          amount: Number(bulkFeeData.amount),
          date: bulkFeeData.date,
          status: PaymentStatus.Pending,
          description: bulkFeeData.description
      }));
      
      onBulkAddFees(newFees);
      setIsBulkModalOpen(false);
  }

  const handleDeleteFee = (id: string) => {
    if (window.confirm("Are you sure you want to delete this fee record?")) {
      onDeleteFee(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'income') {
      if (newFee.studentId && newFee.amount) {
        if (newFee.id) {
          onUpdateFee(newFee as FeeRecord);
        } else {
          onAddFee({
            id: Math.random().toString(36).substr(2, 9),
            studentId: newFee.studentId,
            amount: Number(newFee.amount),
            status: newFee.status as PaymentStatus,
            description: newFee.description || 'Tuition Fee',
            date: newFee.date || new Date().toISOString().split('T')[0]
          });
        }
        setIsModalOpen(false);
      }
    } else {
      if (newExpense.amount && newExpense.description) {
        onAddExpense({
          id: 'exp_' + Math.random().toString(36).substr(2, 9),
          category: newExpense.category as ExpenseCategory,
          amount: Number(newExpense.amount),
          description: newExpense.description,
          date: newExpense.date || new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(false);
      }
    }
  };

  const exportFinancials = () => {
      const csv = activeTab === 'income' 
        ? ["ID,Date,Student,Description,Amount,Status\n" + filteredFees.map(f => `${f.id},${f.date},${getStudentName(f.studentId)},${f.description},${f.amount},${f.status}`).join('\n')]
        : ["ID,Date,Category,Description,Amount\n" + filteredExpenses.map(e => `${e.id},${e.date},${e.category},${e.description},${e.amount}`).join('\n')];
      
      const blob = new Blob(csv, { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${activeTab}.csv`;
      document.body.click(); // Fix for react not appending
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  const statusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case PaymentStatus.Pending: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case PaymentStatus.Overdue: return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Main Finance Toggle */}
       <div className="flex flex-col md:flex-row gap-4">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-fit">
            <button 
                onClick={() => setActiveTab('income')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <DollarSign className="w-5 h-5" /> Student Fees
            </button>
            <button 
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'expenses' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <TrendingDown className="w-5 h-5" /> School Expenses
            </button>
        </div>
        
        {/* Date Filter */}
        <div className="flex-1 flex gap-2 items-center bg-white/5 p-2 rounded-2xl border border-white/10">
            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
            <input 
                type="date" 
                className="bg-transparent text-white/80 text-sm outline-none"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
            />
            <span className="text-white/30">-</span>
            <input 
                type="date" 
                className="bg-transparent text-white/80 text-sm outline-none"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
            />
        </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       
       <div className="lg:col-span-3 space-y-6">
            {/* Financial Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center justify-between">
                    <div><p className="text-emerald-200/60 text-xs uppercase tracking-wider font-bold">Total Collected</p><h3 className="text-2xl font-bold text-emerald-300">+${financialSummary.income}</h3></div>
                    <div className="p-2 bg-emerald-500/20 rounded-lg"><TrendingUp className="w-6 h-6 text-emerald-400" /></div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center justify-between">
                    <div><p className="text-red-200/60 text-xs uppercase tracking-wider font-bold">Total Expenses</p><h3 className="text-2xl font-bold text-red-300">-${financialSummary.expenses}</h3></div>
                    <div className="p-2 bg-red-500/20 rounded-lg"><TrendingDown className="w-6 h-6 text-red-400" /></div>
                </GlassCard>
                <GlassCard className={`p-4 flex items-center justify-between border ${financialSummary.net >= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                    <div><p className="text-white/60 text-xs uppercase tracking-wider font-bold">Net Balance</p><h3 className="text-2xl font-bold text-white">${financialSummary.net}</h3></div>
                    <div className="p-2 bg-white/10 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
                </GlassCard>
            </div>

            {/* View Switcher & Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10 w-full lg:w-auto">
                    <button onClick={() => setViewMode('transactions')} className={`flex-1 lg:flex-none flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'transactions' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:bg-white/5'}`}><List className="w-4 h-4 mr-2" /> Transactions</button>
                    <button onClick={() => setViewMode('analytics')} className={`flex-1 lg:flex-none flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'analytics' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:bg-white/5'}`}><PieChartIcon className="w-4 h-4 mr-2" /> Analytics</button>
                </div>

                {viewMode === 'transactions' && (
                <div className="flex flex-col md:flex-row w-full lg:w-auto gap-4">
                    {activeTab === 'income' && (
                        <>
                        <GlassCard className="flex items-center p-3 flex-1 md:flex-none py-2">
                            <Filter className="w-4 h-4 text-gray-300 mr-2" />
                            <select className="bg-transparent border-none outline-none text-white w-full [&>option]:text-black text-sm cursor-pointer" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                            <option value="All">All Grades</option>
                            {Object.values(GradeLevel).map(g => (<option key={g} value={g}>{g}</option>))}
                            </select>
                        </GlassCard>
                         <button onClick={() => setIsBulkModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center whitespace-nowrap"><Layers className="w-5 h-5" /></button>
                        </>
                    )}
                     <button onClick={exportFinancials} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center whitespace-nowrap"><Download className="w-5 h-5" /></button>
                    <button onClick={openAddModal} className={`${activeTab === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white px-6 py-2 rounded-xl font-bold shadow-lg backdrop-blur-sm transition-all flex items-center justify-center whitespace-nowrap`}>
                    <Plus className="w-5 h-5 mr-2" /> {activeTab === 'income' ? 'Record Fee' : 'Add Expense'}
                    </button>
                </div>
                )}
            </div>

            {viewMode === 'transactions' ? (
                <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-white/10 text-white/70 uppercase text-xs font-bold tracking-wider">
                        <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">{activeTab === 'income' ? 'Student' : 'Category'}</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Amount</th>
                        {activeTab === 'income' && <th className="p-4">Status</th>}
                        {activeTab === 'income' && <th className="p-4">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {activeTab === 'income' ? (
                        filteredFees.length > 0 ? (
                            filteredFees.map((fee) => (
                            <tr key={fee.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 opacity-80 text-sm">{fee.date}</td>
                                <td className="p-4 font-medium">
                                {getStudentName(fee.studentId)}
                                <div className="text-xs opacity-50">{getStudentGrade(fee.studentId)}</div>
                                </td>
                                <td className="p-4 opacity-90">{fee.description}</td>
                                <td className="p-4 font-mono font-bold text-emerald-300">+${fee.amount.toFixed(2)}</td>
                                <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${statusColor(fee.status)}`}>
                                    {fee.status}
                                </span>
                                </td>
                                <td className="p-4 flex items-center gap-2">
                                <button onClick={() => openEditFeeModal(fee)} className="p-2 hover:bg-blue-500/20 text-blue-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteFee(fee.id)} className="p-2 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                            ))
                        ) : <tr><td colSpan={6} className="p-8 text-center text-gray-400">No fees found.</td></tr>
                        ) : (
                        // Expenses List
                        filteredExpenses.length > 0 ? (
                            filteredExpenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 opacity-80 text-sm">{exp.date}</td>
                                <td className="p-4">
                                <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-xs font-bold border border-red-500/20">{exp.category}</span>
                                </td>
                                <td className="p-4 opacity-90">{exp.description}</td>
                                <td className="p-4 font-mono font-bold text-red-300">-${exp.amount.toFixed(2)}</td>
                            </tr>
                            ))
                        ) : <tr><td colSpan={4} className="p-8 text-center text-gray-400">No expenses recorded.</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </GlassCard>
            ) : (
                // Analytics View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="h-80">
                         <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                     {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                 </Pie>
                                 <ReTooltip contentStyle={{background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(4px)', color: '#fff'}} />
                             </PieChart>
                         </ResponsiveContainer>
                         <div className="flex flex-wrap justify-center gap-2 mt-4">
                             {expenseChartData.map((e, i) => (
                                 <div key={e.name} className="flex items-center gap-1 text-xs">
                                     <div className="w-2 h-2 rounded-full" style={{background: COLORS[i % COLORS.length]}}></div>
                                     <span>{e.name}</span>
                                 </div>
                             ))}
                         </div>
                    </GlassCard>
                </div>
            )}
       </div>

       {/* Right Sidebar - Overdue */}
       <div className="space-y-4">
            <GlassCard className="bg-red-500/10 border-red-500/30">
                <h3 className="text-lg font-bold text-red-200 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Overdue Payments
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {overdueStudents.length > 0 ? (
                        overdueStudents.map(o => (
                            <div key={o.id} className="p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm text-white/90">{o.studentName}</span>
                                    <span className="font-mono text-red-300 font-bold">${o.amount}</span>
                                </div>
                                <div className="text-xs text-white/50 mt-1">{o.description} - {o.date}</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm opacity-50">No overdue payments.</p>
                    )}
                </div>
            </GlassCard>
       </div>

       </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md bg-[#0f3030]/95 border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              {activeTab === 'income' ? <DollarSign className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
              {activeTab === 'income' ? (newFee.id ? 'Edit Fee Record' : 'Record Fee Payment') : 'Record New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'income' ? (
                <>
                   <div>
                    <label className="block text-sm text-gray-300 mb-1">Student</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-black" value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})}>
                      {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Amount</label><input required type="number" min="0" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={newFee.amount} onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Date</label><input required type="date" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={newFee.date} onChange={e => setNewFee({...newFee, date: e.target.value})} /></div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Fee Type</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white [&>option]:text-black" value={newFee.description} onChange={e => setNewFee({...newFee, description: e.target.value})}>
                        {settings.feeTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Status</label>
                    <div className="flex gap-4 mt-2">
                      {Object.values(PaymentStatus).map(status => <label key={status} className="flex items-center cursor-pointer"><input type="radio" name="status" value={status} checked={newFee.status === status} onChange={() => setNewFee({...newFee, status})} className="mr-2 accent-emerald-400" /><span className="text-sm">{status}</span></label>)}
                    </div>
                  </div>
                </>
              ) : (
                // Expense Form
                <>
                   <div>
                    <label className="block text-sm text-gray-300 mb-1">Category</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-400 [&>option]:text-black" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}>
                      {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Amount</label><input required type="number" min="0" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Date</label><input required type="date" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-sm text-gray-300 mb-1">Description</label><input required type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="e.g. Teacher Salary" /></div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className={`px-6 py-2 rounded-lg text-white font-bold shadow-lg ${activeTab === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>Save</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Bulk Modal */}
      {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md bg-[#0f3030]/95 border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Layers className="text-emerald-400" /> Bulk Invoice</h2>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm text-gray-300 mb-1">Target Grade</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white [&>option]:text-black" value={bulkFeeData.grade} onChange={e => setBulkFeeData({...bulkFeeData, grade: e.target.value as GradeLevel})}>
                        {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm text-gray-300 mb-1">Fee Type</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white [&>option]:text-black" value={bulkFeeData.description} onChange={e => setBulkFeeData({...bulkFeeData, description: e.target.value})}>
                        {settings.feeTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Amount</label><input required type="number" min="0" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={bulkFeeData.amount} onChange={e => setBulkFeeData({...bulkFeeData, amount: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Date</label><input required type="date" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" value={bulkFeeData.date} onChange={e => setBulkFeeData({...bulkFeeData, date: e.target.value})} /></div>
                </div>
                <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
                    <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 rounded-lg text-white font-bold shadow-lg bg-emerald-500 hover:bg-emerald-600">Generate Invoices</button>
                </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
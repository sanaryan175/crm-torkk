'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, CheckCircle, TrendingDown } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useExpenses } from '@/lib/hooks';
import type { Expense } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const METHODS = ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other'];
const STATUSES = ['pending', 'approved', 'rejected', 'reimbursed'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'approved' || s === 'reimbursed') return 'success';
  if (s === 'rejected') return 'error';
  return 'warning';
};

function ExpenseModal({ isOpen, onClose, expense, onSave }: {
  isOpen: boolean; onClose: () => void; expense: Expense | null;
  onSave: (d: Partial<Expense>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', category: '', amount: '', expenseDate: '', method: 'cash', vendorName: '', status: 'pending', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (expense) setForm({ title: expense.title, category: expense.category ?? '', amount: String(expense.amount), expenseDate: String(expense.expenseDate).slice(0, 10), method: expense.method ?? 'cash', vendorName: expense.vendorName ?? '', status: expense.status, notes: expense.notes ?? '' });
    else setForm({ title: '', category: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10), method: 'cash', vendorName: '', status: 'pending', notes: '' });
  }, [expense, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) { addToast({ type: 'error', message: 'Title and amount are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, category: form.category || undefined, amount: parseFloat(form.amount), expenseDate: form.expenseDate, method: form.method, vendorName: form.vendorName || undefined, status: form.status, notes: form.notes || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'New Expense'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Office supplies" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Operations" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="250.00" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
            <input type="date" className={inp} value={form.expenseDate} onChange={e => set('expenseDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</label>
            <select className={inp} value={form.method} onChange={e => set('method', e.target.value)}>{METHODS.map(m => <option key={m} value={m}>{label(m)}</option>)}</select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</label>
            <input className={inp} value={form.vendorName} onChange={e => set('vendorName', e.target.value)} placeholder="Vendor name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : expense ? 'Save Changes' : 'Create Expense'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ExpensesPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { expenses, isLoading, error, createExpense, updateExpense, approveExpense, deleteExpense } = useExpenses();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load expenses.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return expenses;
    const q = search.toLowerCase();
    return expenses.filter(e => e.title.toLowerCase().includes(q) || (e.category ?? '').toLowerCase().includes(q) || (e.vendorName ?? '').toLowerCase().includes(q));
  }, [expenses, search]);

  const totalAmount = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);

  const handleSave = async (d: Partial<Expense>) => {
    if (editExpense) { await updateExpense(editExpense.id, d); addToast({ type: 'success', message: 'Expense updated.' }); }
    else { await createExpense(d); addToast({ type: 'success', message: 'Expense created.' }); }
  };

  const handleApprove = async (id: string) => {
    try { await approveExpense(id); addToast({ type: 'success', message: 'Expense approved.' }); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteExpense(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage business expenses</p>
        </div>
        <button onClick={() => { setEditExpense(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Expense
        </button>
      </div>

      {/* Summary card */}
      <Card className="flex items-center gap-4">
        <div className="w-11 h-11 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0"><TrendingDown className="w-5 h-5 text-red-500" /></div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total (filtered)</p>
          <p className="text-2xl font-bold text-foreground">{formatMoney(totalAmount)}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No expenses found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Method</th>
                <th className="text-left px-4 py-3 font-semibold">Vendor</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-28 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{e.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.category || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-500">{formatMoney(e.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(e.expenseDate, { includeTime: false })}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{label(e.method ?? 'cash')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.vendorName || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(e.status)} size="sm">{label(e.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {e.status === 'pending' && <button onClick={() => handleApprove(e.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>}
                      <button onClick={() => { setEditExpense(e); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditExpense(null); }} expense={editExpense} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this expense permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

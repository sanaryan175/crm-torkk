'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useIncomes } from '@/lib/hooks';
import type { Income } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const METHODS = ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function IncomeModal({ isOpen, onClose, income, onSave }: {
  isOpen: boolean; onClose: () => void; income: Income | null;
  onSave: (d: Partial<Income>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', category: '', amount: '', incomeDate: '', method: 'bank_transfer', source: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (income) setForm({ title: income.title, category: income.category ?? '', amount: String(income.amount), incomeDate: String(income.incomeDate).slice(0, 10), method: income.method ?? 'bank_transfer', source: income.source ?? '', notes: income.notes ?? '' });
    else setForm({ title: '', category: '', amount: '', incomeDate: new Date().toISOString().slice(0, 10), method: 'bank_transfer', source: '', notes: '' });
  }, [income, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) { addToast({ type: 'error', message: 'Title and amount are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, category: form.category || undefined, amount: parseFloat(form.amount), incomeDate: form.incomeDate, method: form.method, source: form.source || undefined, notes: form.notes || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={income ? 'Edit Income' : 'New Income'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Product sales" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Sales" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="5000.00" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
            <input type="date" className={inp} value={form.incomeDate} onChange={e => set('incomeDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</label>
            <select className={inp} value={form.method} onChange={e => set('method', e.target.value)}>{METHODS.map(m => <option key={m} value={m}>{label(m)}</option>)}</select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</label>
          <input className={inp} value={form.source} onChange={e => set('source', e.target.value)} placeholder="Client name or source" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : income ? 'Save Changes' : 'Create Income'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function IncomePage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { incomes, isLoading, error, createIncome, updateIncome, deleteIncome } = useIncomes();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load income records.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return incomes;
    const q = search.toLowerCase();
    return incomes.filter(i => i.title.toLowerCase().includes(q) || (i.category ?? '').toLowerCase().includes(q) || (i.source ?? '').toLowerCase().includes(q));
  }, [incomes, search]);

  const totalAmount = useMemo(() => filtered.reduce((sum, i) => sum + i.amount, 0), [filtered]);

  const handleSave = async (d: Partial<Income>) => {
    if (editIncome) { await updateIncome(editIncome.id, d); addToast({ type: 'success', message: 'Income updated.' }); }
    else { await createIncome(d); addToast({ type: 'success', message: 'Income recorded.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteIncome(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income</h1>
          <p className="text-muted-foreground mt-1">Record and track business income</p>
        </div>
        <button onClick={() => { setEditIncome(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Income
        </button>
      </div>

      <Card className="flex items-center gap-4">
        <div className="w-11 h-11 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0"><TrendingUp className="w-5 h-5 text-green-600" /></div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total (filtered)</p>
          <p className="text-2xl font-bold text-foreground">{formatMoney(totalAmount)}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search income..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No income records found</p></Card>
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
                <th className="text-left px-4 py-3 font-semibold">Source</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((income, i) => (
                <motion.tr key={income.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{income.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{income.category || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{formatMoney(income.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(income.incomeDate, { includeTime: false })}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{label(income.method ?? 'bank_transfer')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{income.source || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditIncome(income); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(income.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <IncomeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditIncome(null); }} income={editIncome} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Income Record" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this income record permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

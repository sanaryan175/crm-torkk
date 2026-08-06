'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, PiggyBank } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useBudgets } from '@/lib/hooks';
import type { Budget } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'active', 'closed'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'info' => {
  if (s === 'active') return 'success';
  if (s === 'closed') return 'info';
  return 'default';
};

function BudgetModal({ isOpen, onClose, budget, onSave }: {
  isOpen: boolean; onClose: () => void; budget: Budget | null;
  onSave: (d: Partial<Budget>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', category: '', amount: '', periodStart: '', periodEnd: '', status: 'draft' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (budget) setForm({ name: budget.name, category: budget.category ?? '', amount: String(budget.amount), periodStart: budget.periodStart ? String(budget.periodStart).slice(0, 10) : '', periodEnd: budget.periodEnd ? String(budget.periodEnd).slice(0, 10) : '', status: budget.status });
    else setForm({ name: '', category: '', amount: '', periodStart: '', periodEnd: '', status: 'draft' });
  }, [budget, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) { addToast({ type: 'error', message: 'Name and amount are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, category: form.category || undefined, amount: parseFloat(form.amount), periodStart: form.periodStart || undefined, periodEnd: form.periodEnd || undefined, status: form.status });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={budget ? 'Edit Budget' : 'New Budget'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Q4 Marketing Budget" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Marketing" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="10000" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period Start</label>
            <input type="date" className={inp} value={form.periodStart} onChange={e => set('periodStart', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period End</label>
            <input type="date" className={inp} value={form.periodEnd} onChange={e => set('periodEnd', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : budget ? 'Save Changes' : 'Create Budget'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function BudgetPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { budgets, isLoading, error, createBudget, updateBudget, deleteBudget } = useBudgets();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load budgets.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return budgets;
    const q = search.toLowerCase();
    return budgets.filter(b => b.name.toLowerCase().includes(q) || (b.category ?? '').toLowerCase().includes(q));
  }, [budgets, search]);

  const handleSave = async (d: Partial<Budget>) => {
    if (editBudget) { await updateBudget(editBudget.id, d); addToast({ type: 'success', message: 'Budget updated.' }); }
    else { await createBudget(d); addToast({ type: 'success', message: 'Budget created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteBudget(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget</h1>
          <p className="text-muted-foreground mt-1">Plan and monitor budget allocations</p>
        </div>
        <button onClick={() => { setEditBudget(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search budgets..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No budgets found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Period Start</th>
                <th className="text-left px-4 py-3 font-semibold">Period End</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.category || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.periodStart ? formatDateTime(b.periodStart, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.periodEnd ? formatDateTime(b.periodEnd, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(b.status)} size="sm">{label(b.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditBudget(b); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BudgetModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditBudget(null); }} budget={editBudget} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Budget" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this budget permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

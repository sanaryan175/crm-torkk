'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Target, TrendingUp, ListChecks } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useSalesTargets, useTeamMembers } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { SalesTarget } from '@/lib/types';

function toDateInput(d: Date | string) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── New / Edit Target Modal ──────────────────────────────────────────────────
function TargetModal({
  isOpen,
  onClose,
  target,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  target?: SalesTarget | null;
  onSave: (data: Partial<SalesTarget>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { members } = useTeamMembers();
  const [form, setForm] = useState({
    userId: '', period: '', amount: '', startDate: '', endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (target) {
      setForm({
        userId: target.userId ?? '',
        period: target.period,
        amount: String(target.amount),
        startDate: target.startDate ? toDateInput(target.startDate) : '',
        endDate: target.endDate ? toDateInput(target.endDate) : '',
      });
    } else {
      setForm({ userId: '', period: '', amount: '', startDate: '', endDate: '' });
    }
  }, [target, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.period.trim() || !form.amount) {
      addToast({ type: 'error', message: 'Period and amount are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        userId: form.userId || undefined,
        period: form.period.trim(),
        amount: parseFloat(form.amount),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save target.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={target ? 'Edit Target' : 'New Target'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
            <select className={inp} value={form.userId} onChange={e => set('userId', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period *</label>
            <input className={inp} value={form.period} onChange={e => set('period', e.target.value)} placeholder="2026-08" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
            <input type="number" step="any" min="0" className={inp} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="50000" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
              <input type="date" className={inp} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
              <input type="date" className={inp} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (target ? 'Save Changes' : 'Create Target')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Sales Targets Page ───────────────────────────────────────────────────────
export default function SalesTargetsPage() {
  const { addToast } = useUI();
  const { formatMoney } = useRegion();
  const { targets, isLoading, error, createTarget, updateTarget, deleteTarget } = useSalesTargets();
  const { members } = useTeamMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SalesTarget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [members]);

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return targets;
    const q = searchQuery.toLowerCase();
    return targets.filter((t) =>
      t.period.toLowerCase().includes(q) ||
      (t.userId || '').toLowerCase().includes(q) ||
      (memberNames[t.userId || ''] || '').toLowerCase().includes(q)
    );
  }, [targets, searchQuery, memberNames]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load targets. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const totalAmount = useMemo(() => targets.reduce((sum, t) => sum + (t.amount || 0), 0), [targets]);
  const totalAchieved = useMemo(() => targets.reduce((sum, t) => sum + (t.achieved || 0), 0), [targets]);

  const handleCreate = async (data: Partial<SalesTarget>) => {
    await createTarget(data);
    addToast({ type: 'success', message: 'Target created successfully.' });
  };

  const handleUpdate = async (data: Partial<SalesTarget>) => {
    if (!editTarget) return;
    await updateTarget(editTarget.id, data);
    addToast({ type: 'success', message: 'Target updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTarget(deleteId);
      addToast({ type: 'success', message: 'Target deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete target.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const pct = (t: SalesTarget) => {
    if (!t.amount || t.amount <= 0) return 0;
    return Math.min(100, Math.round(((t.achieved || 0) / t.amount) * 100));
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Targets</h1>
          <p className="text-muted-foreground mt-1">Set and track sales targets for your team</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Target
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Target Amount</p>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(totalAmount)}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Achieved</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(totalAchieved)}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Targets</p>
            <ListChecks className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{targets.length}</p>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load targets. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredTargets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No targets found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new target</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Assignee</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Amount</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Achieved</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Progress</th>
                <th className="w-10 px-4 py-3" />
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredTargets.map((t, i) => {
                const progress = pct(t);
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{t.period}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.userId ? (memberNames[t.userId] || <span className="font-mono text-xs">{t.userId}</span>) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(t.amount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(t.achieved || 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-10">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setEditTarget(t); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit target"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TargetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        target={editTarget}
        onSave={editTarget ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Target" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this target? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

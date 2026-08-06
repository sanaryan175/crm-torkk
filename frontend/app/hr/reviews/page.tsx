'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Star, Send } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { usePerformanceReviews, useEmployees, useTeamMembers } from '@/lib/hooks';
import type { PerformanceReview } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'in_progress', 'submitted', 'completed'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (s: string): 'default' | 'success' | 'warning' | 'info' => {
  if (s === 'completed') return 'success';
  if (s === 'submitted') return 'info';
  if (s === 'in_progress') return 'warning';
  return 'default';
};

function ReviewModal({ isOpen, onClose, review, onSave }: {
  isOpen: boolean; onClose: () => void; review: PerformanceReview | null;
  onSave: (d: Partial<PerformanceReview>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { employees } = useEmployees();
  const { members } = useTeamMembers();
  const [form, setForm] = useState({
    employeeId: '', reviewerId: '', periodStart: '', periodEnd: '',
    overallRating: '', strengths: '', improvements: '', goals: '', status: 'draft',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (review) {
      setForm({
        employeeId: review.employeeId,
        reviewerId: typeof review.reviewer === 'object' ? (review.reviewer?.id ?? '') : '',
        periodStart: review.periodStart ? String(review.periodStart).slice(0, 10) : '',
        periodEnd: review.periodEnd ? String(review.periodEnd).slice(0, 10) : '',
        overallRating: review.overallRating != null ? String(review.overallRating) : '',
        strengths: review.strengths ?? '',
        improvements: review.improvements ?? '',
        goals: review.goals ?? '',
        status: review.status,
      });
    } else {
      setForm({ employeeId: '', reviewerId: '', periodStart: '', periodEnd: '', overallRating: '', strengths: '', improvements: '', goals: '', status: 'draft' });
    }
  }, [review, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) { addToast({ type: 'error', message: 'Employee is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({
        employeeId: form.employeeId,
        reviewerId: form.reviewerId || undefined,
        periodStart: form.periodStart || undefined,
        periodEnd: form.periodEnd || undefined,
        overallRating: form.overallRating ? parseFloat(form.overallRating) : undefined,
        strengths: form.strengths || undefined,
        improvements: form.improvements || undefined,
        goals: form.goals || undefined,
        status: form.status,
      });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={review ? 'Edit Review' : 'New Review'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee *</label>
            <select className={inp} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reviewer</label>
            <select className={inp} value={form.reviewerId} onChange={e => set('reviewerId', e.target.value)}>
              <option value="">Select reviewer</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Rating (1-5)</label>
            <input type="number" min="1" max="5" step="0.1" className={inp} value={form.overallRating} onChange={e => set('overallRating', e.target.value)} placeholder="4.5" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Strengths</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.strengths} onChange={e => set('strengths', e.target.value)} placeholder="Key strengths..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Improvements</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.improvements} onChange={e => set('improvements', e.target.value)} placeholder="Areas for improvement..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goals</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.goals} onChange={e => set('goals', e.target.value)} placeholder="Goals for next period..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : review ? 'Save Changes' : 'Create Review'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ReviewsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { reviews, isLoading, error, createReview, updateReview, submitReview, deleteReview } = usePerformanceReviews();
  const { employees } = useEmployees();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editReview, setEditReview] = useState<PerformanceReview | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load reviews.' }); }, [error]);

  const empMap = useMemo(() => {
    const m: Record<string, string> = {};
    employees.forEach(e => { m[e.id] = `${e.firstName} ${e.lastName}`; });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(r => (empMap[r.employeeId] ?? '').toLowerCase().includes(q));
  }, [reviews, search, empMap]);

  const handleSave = async (d: Partial<PerformanceReview>) => {
    if (editReview) { await updateReview(editReview.id, d); addToast({ type: 'success', message: 'Review updated.' }); }
    else { await createReview(d); addToast({ type: 'success', message: 'Review created.' }); }
  };

  const handleSubmit = async (id: string) => {
    try { await submitReview(id); addToast({ type: 'success', message: 'Review submitted.' }); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed to submit.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteReview(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  const renderStars = (rating: number | null | undefined) => {
    if (rating == null) return '—';
    return `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))} (${rating})`;
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">Conduct and track employee performance reviews</p>
        </div>
        <button onClick={() => { setEditReview(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Review
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by employee..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No reviews found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Employee</th>
                <th className="text-left px-4 py-3 font-semibold">Reviewer</th>
                <th className="text-left px-4 py-3 font-semibold">Period</th>
                <th className="text-left px-4 py-3 font-semibold">Rating</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-28 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{empMap[r.employeeId] ?? r.employeeId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{typeof r.reviewer === 'object' ? r.reviewer?.name : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {r.periodStart ? formatDateTime(r.periodStart, { includeTime: false }) : '—'} → {r.periodEnd ? formatDateTime(r.periodEnd, { includeTime: false }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-yellow-500 text-xs">{renderStars(r.overallRating)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(r.status)} size="sm">{label(r.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {r.status === 'in_progress' && (
                        <button onClick={() => handleSubmit(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors" title="Submit"><Send className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => { setEditReview(r); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReviewModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditReview(null); }} review={editReview} onSave={handleSave} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Review" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this performance review permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

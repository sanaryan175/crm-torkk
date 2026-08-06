'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, GraduationCap, UserPlus } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useTraining, useEmployees } from '@/lib/hooks';
import type { Training } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const TYPES = ['online', 'classroom', 'on_the_job', 'workshop', 'seminar', 'other'];
const STATUSES = ['planned', 'ongoing', 'completed', 'cancelled'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (s: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  if (s === 'completed') return 'success';
  if (s === 'ongoing') return 'info';
  if (s === 'cancelled') return 'error';
  return 'warning';
};

function TrainingModal({ isOpen, onClose, training, onSave }: {
  isOpen: boolean; onClose: () => void; training: Training | null;
  onSave: (d: Partial<Training>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', description: '', type: 'online', startDate: '', endDate: '', status: 'planned' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (training) setForm({ title: training.title, description: training.description ?? '', type: training.type ?? 'online', startDate: training.startDate ? String(training.startDate).slice(0, 10) : '', endDate: training.endDate ? String(training.endDate).slice(0, 10) : '', status: training.status });
    else setForm({ title: '', description: '', type: 'online', startDate: '', endDate: '', status: 'planned' });
  }, [training, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, description: form.description || undefined, type: form.type, startDate: form.startDate || undefined, endDate: form.endDate || undefined, status: form.status });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={training ? 'Edit Training' : 'New Training'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="React Advanced Patterns" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
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
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Training description..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : training ? 'Save Changes' : 'Create Training'}</button>
        </div>
      </form>
    </Modal>
  );
}

function EnrollModal({ isOpen, onClose, trainingId, onEnroll }: {
  isOpen: boolean; onClose: () => void; trainingId: string;
  onEnroll: (employeeId: string) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { employees } = useEmployees();
  const [employeeId, setEmployeeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setEmployeeId(''); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) { addToast({ type: 'error', message: 'Select an employee.' }); return; }
    setSubmitting(true);
    try { await onEnroll(employeeId); onClose(); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enroll Employee" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee *</label>
          <select className={inp} value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
            <option value="">Select employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Enrolling...' : 'Enroll'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function TrainingPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { trainings, isLoading, error, createTraining, updateTraining, enrollEmployee, deleteTraining } = useTraining();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [enrollId, setEnrollId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load training programs.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return trainings;
    const q = search.toLowerCase();
    return trainings.filter(t => t.title.toLowerCase().includes(q) || (t.type ?? '').toLowerCase().includes(q));
  }, [trainings, search]);

  const handleSave = async (d: Partial<Training>) => {
    if (editTraining) { await updateTraining(editTraining.id, d); addToast({ type: 'success', message: 'Training updated.' }); }
    else { await createTraining(d); addToast({ type: 'success', message: 'Training created.' }); }
  };

  const handleEnroll = async (employeeId: string) => {
    if (!enrollId) return;
    await enrollEmployee(enrollId, employeeId);
    addToast({ type: 'success', message: 'Employee enrolled.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteTraining(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training</h1>
          <p className="text-muted-foreground mt-1">Manage training programs and employee enrollments</p>
        </div>
        <button onClick={() => { setEditTraining(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Training
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search training..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No training programs found</p></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><GraduationCap className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t.title}</h3>
                      <p className="text-sm text-muted-foreground">{label(t.type ?? 'other')}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={statusVariant(t.status)} size="sm">{label(t.status)}</Badge>
                        {t.startDate && <span className="text-xs text-muted-foreground">{formatDateTime(t.startDate, { includeTime: false })} → {t.endDate ? formatDateTime(t.endDate, { includeTime: false }) : 'Ongoing'}</span>}
                        <span className="text-xs text-muted-foreground">{t.enrollments?.length ?? 0} enrolled</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEnrollId(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors" title="Enroll employee"><UserPlus className="w-4 h-4" /></button>
                    <button onClick={() => { setEditTraining(t); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <TrainingModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTraining(null); }} training={editTraining} onSave={handleSave} />
      <EnrollModal isOpen={!!enrollId} onClose={() => setEnrollId(null)} trainingId={enrollId ?? ''} onEnroll={handleEnroll} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Training" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this training program permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

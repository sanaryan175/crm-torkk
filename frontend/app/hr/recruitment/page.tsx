'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Briefcase, Send, CheckCircle } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useJobPostings, useApplications } from '@/lib/hooks';
import type { JobPosting, JobApplication } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const JOB_TYPES = ['full_time', 'part_time', 'contract', 'intern', 'freelance'];
const JOB_STATUSES = ['draft', 'open', 'closed', 'on_hold'];
const APP_STATUSES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

const jobStatusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'open') return 'success';
  if (s === 'closed') return 'error';
  if (s === 'on_hold') return 'warning';
  return 'default';
};
const appStatusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'hired') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'offer') return 'info';
  if (s === 'interview') return 'primary' as any;
  return 'warning';
};

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ─── Job Posting Modal ────────────────────────────────────────────────────────
function JobModal({ isOpen, onClose, job, onSave }: {
  isOpen: boolean; onClose: () => void; job: JobPosting | null;
  onSave: (d: Partial<JobPosting>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'full_time', description: '', requirements: '', salaryRange: '', status: 'draft' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (job) setForm({ title: job.title, department: job.department ?? '', location: job.location ?? '', type: job.type ?? 'full_time', description: job.description ?? '', requirements: job.requirements ?? '', salaryRange: job.salaryRange ?? '', status: job.status });
    else setForm({ title: '', department: '', location: '', type: 'full_time', description: '', requirements: '', salaryRange: '', status: 'draft' });
  }, [job, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, department: form.department || undefined, location: form.location || undefined, type: form.type, description: form.description || undefined, requirements: form.requirements || undefined, salaryRange: form.salaryRange || undefined, status: form.status });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={job ? 'Edit Job Posting' : 'New Job Posting'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Senior Software Engineer" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
            <input className={inp} value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
            <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Remote / New York" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>{JOB_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary Range</label>
            <input className={inp} value={form.salaryRange} onChange={e => set('salaryRange', e.target.value)} placeholder="$80k–$120k" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{JOB_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Job description..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requirements</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Requirements..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : job ? 'Save Changes' : 'Create Posting'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Recruitment Page ─────────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { postings, isLoading, error, createPosting, updatePosting, publishPosting, deletePosting } = useJobPostings();
  const { applications, isLoading: appsLoading, updateApplicationStatus } = useApplications();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'jobs' | 'applications'>('jobs');
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobPosting | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load job postings.' }); }, [error]);

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return postings;
    const q = search.toLowerCase();
    return postings.filter(j => j.title.toLowerCase().includes(q) || (j.department ?? '').toLowerCase().includes(q));
  }, [postings, search]);

  const filteredApps = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter(a => a.candidateName.toLowerCase().includes(q) || a.candidateEmail.toLowerCase().includes(q));
  }, [applications, search]);

  const handleSave = async (d: Partial<JobPosting>) => {
    if (editJob) { await updatePosting(editJob.id, d); addToast({ type: 'success', message: 'Job posting updated.' }); }
    else { await createPosting(d); addToast({ type: 'success', message: 'Job posting created.' }); }
  };

  const handlePublish = async (id: string) => {
    try { await publishPosting(id); addToast({ type: 'success', message: 'Published.' }); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed to publish.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deletePosting(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruitment</h1>
          <p className="text-muted-foreground mt-1">Manage job postings and track applicants</p>
        </div>
        {tab === 'jobs' && (
          <button onClick={() => { setEditJob(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
            <Plus className="w-4 h-4" /> New Posting
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['jobs', 'applications'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {/* Job Postings Tab */}
      {tab === 'jobs' && (
        isLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        : filteredJobs.length === 0 ? <Card className="text-center py-12"><p className="text-muted-foreground">No job postings found</p></Card>
        : (
          <div className="space-y-3">
            {filteredJobs.map((j, i) => (
              <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground">{j.title}</h3>
                        <p className="text-sm text-muted-foreground">{j.department || 'No department'} · {j.location || 'No location'} · {label(j.type ?? 'full_time')}</p>
                        {j.salaryRange && <p className="text-xs text-muted-foreground mt-0.5">{j.salaryRange}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={jobStatusVariant(j.status)} size="sm">{label(j.status)}</Badge>
                          {j.postedAt && <span className="text-xs text-muted-foreground">Posted {formatDateTime(j.postedAt, { includeTime: false })}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {j.status === 'draft' && (
                        <button onClick={() => handlePublish(j.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors" title="Publish">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setEditJob(j); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(j.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        appsLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        : filteredApps.length === 0 ? <Card className="text-center py-12"><p className="text-muted-foreground">No applications found</p></Card>
        : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">Candidate</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Source</th>
                  <th className="text-left px-4 py-3 font-semibold">Applied</th>
                  <th className="text-left px-4 py-3 font-semibold">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{a.candidateName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.candidateEmail}</td>
                    <td className="px-4 py-3"><Badge variant={appStatusVariant(a.status)} size="sm">{label(a.status)}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{a.source || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(a.createdAt, { includeTime: false })}</td>
                    <td className="px-4 py-3">
                      <select className="bg-muted/40 border border-border/40 rounded-lg px-2 py-1 text-xs text-foreground outline-none"
                        value={a.status}
                        onChange={async e => { try { await updateApplicationStatus(a.id, e.target.value); } catch {} }}>
                        {APP_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <JobModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditJob(null); }} job={editJob} onSave={handleSave} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Job Posting" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this job posting permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, CheckCircle, ClipboardList } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { usePurchaseRequests } from '@/lib/hooks';
import type { PurchaseRequest } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'pending', 'approved', 'rejected', 'ordered'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'pending') return 'warning';
  if (s === 'ordered') return 'info';
  return 'default';
};

function PRModal({ isOpen, onClose, pr, onSave }: {
  isOpen: boolean; onClose: () => void; pr: PurchaseRequest | null;
  onSave: (d: Partial<PurchaseRequest>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', department: '', requestedDate: '', neededDate: '', status: 'draft' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (pr) {
      setForm({ title: pr.title, department: pr.department ?? '', requestedDate: pr.requestedDate ? String(pr.requestedDate).slice(0, 10) : '', neededDate: pr.neededDate ? String(pr.neededDate).slice(0, 10) : '', status: pr.status });
    } else {
      setForm({ title: '', department: '', requestedDate: new Date().toISOString().slice(0, 10), neededDate: '', status: 'draft' });
    }
  }, [pr, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, department: form.department || undefined, requestedDate: form.requestedDate || undefined, neededDate: form.neededDate || undefined, status: form.status });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pr ? 'Edit Purchase Request' : 'New Purchase Request'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Office supplies Q4" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
            <input className={inp} value={form.department} onChange={e => set('department', e.target.value)} placeholder="Operations" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requested Date</label>
            <input type="date" className={inp} value={form.requestedDate} onChange={e => set('requestedDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Needed By</label>
            <input type="date" className={inp} value={form.neededDate} onChange={e => set('neededDate', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Saving...' : pr ? 'Save Changes' : 'Create Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function PurchaseRequestsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { requests, isLoading, error, createRequest, updateRequest, approveRequest, deleteRequest } = usePurchaseRequests();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPR, setEditPR] = useState<PurchaseRequest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load purchase requests.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(r => r.title.toLowerCase().includes(q) || r.prNumber.toLowerCase().includes(q) || (r.department ?? '').toLowerCase().includes(q));
  }, [requests, search]);

  const handleSave = async (d: Partial<PurchaseRequest>) => {
    if (editPR) { await updateRequest(editPR.id, d); addToast({ type: 'success', message: 'Request updated.' }); }
    else { await createRequest(d); addToast({ type: 'success', message: 'Request created.' }); }
  };

  const handleApprove = async (id: string) => {
    try { await approveRequest(id); addToast({ type: 'success', message: 'Request approved.' }); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed to approve.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteRequest(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Requests</h1>
          <p className="text-muted-foreground mt-1">Raise and manage internal purchase requests</p>
        </div>
        <button onClick={() => { setEditPR(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No purchase requests found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">PR #</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Department</th>
                <th className="text-left px-4 py-3 font-semibold">Requested</th>
                <th className="text-left px-4 py-3 font-semibold">Needed By</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-28 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.prNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.department || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.requestedDate ? formatDateTime(r.requestedDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.neededDate ? formatDateTime(r.neededDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(r.status)} size="sm">{label(r.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {r.status === 'pending' && (
                        <button onClick={() => handleApprove(r.id)} title="Approve" className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => { setEditPR(r); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PRModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditPR(null); }} pr={editPR} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Purchase Request" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this purchase request permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

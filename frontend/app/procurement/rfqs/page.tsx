'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, FileQuestion } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useRfqs, useVendors } from '@/lib/hooks';
import type { Rfq } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'sent', 'received', 'accepted', 'rejected'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' => {
  if (s === 'accepted') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'sent') return 'info';
  if (s === 'received') return 'warning';
  return 'default';
};

function RfqModal({ isOpen, onClose, rfq, vendors, onSave }: {
  isOpen: boolean; onClose: () => void; rfq: Rfq | null;
  vendors: { id: string; name: string }[];
  onSave: (d: Partial<Rfq>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', vendorId: '', status: 'draft', issuedDate: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (rfq) {
      setForm({ title: rfq.title, vendorId: rfq.vendorId ?? '', status: rfq.status, issuedDate: rfq.issuedDate ? String(rfq.issuedDate).slice(0, 10) : '', dueDate: rfq.dueDate ? String(rfq.dueDate).slice(0, 10) : '' });
    } else {
      setForm({ title: '', vendorId: '', status: 'draft', issuedDate: new Date().toISOString().slice(0, 10), dueDate: '' });
    }
  }, [rfq, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, vendorId: form.vendorId || undefined, status: form.status, issuedDate: form.issuedDate || undefined, dueDate: form.dueDate || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={rfq ? 'Edit RFQ' : 'New RFQ'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Office equipment procurement" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</label>
            <select className={inp} value={form.vendorId} onChange={e => set('vendorId', e.target.value)}>
              <option value="">Select vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issued Date</label>
            <input type="date" className={inp} value={form.issuedDate} onChange={e => set('issuedDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</label>
            <input type="date" className={inp} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Saving...' : rfq ? 'Save Changes' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function RfqsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { rfqs, isLoading, error, createRfq, updateRfq, deleteRfq } = useRfqs();
  const { vendors } = useVendors();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRfq, setEditRfq] = useState<Rfq | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load RFQs.' }); }, [error]);

  const vendorMap = useMemo(() => { const m: Record<string, string> = {}; vendors.forEach(v => { m[v.id] = v.name; }); return m; }, [vendors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rfqs;
    const q = search.toLowerCase();
    return rfqs.filter(r => r.title.toLowerCase().includes(q) || r.rfqNumber.toLowerCase().includes(q));
  }, [rfqs, search]);

  const handleSave = async (d: Partial<Rfq>) => {
    if (editRfq) { await updateRfq(editRfq.id, d); addToast({ type: 'success', message: 'RFQ updated.' }); }
    else { await createRfq(d); addToast({ type: 'success', message: 'RFQ created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteRfq(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RFQs</h1>
          <p className="text-muted-foreground mt-1">Manage requests for quotation from vendors</p>
        </div>
        <button onClick={() => { setEditRfq(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New RFQ
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search RFQs..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No RFQs found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">RFQ #</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Vendor</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Issued</th>
                <th className="text-left px-4 py-3 font-semibold">Due</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.rfqNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileQuestion className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.vendorId ? (vendorMap[r.vendorId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(r.status) as any} size="sm">{label(r.status)}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.issuedDate ? formatDateTime(r.issuedDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.dueDate ? formatDateTime(r.dueDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditRfq(r); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RfqModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditRfq(null); }} rfq={editRfq} vendors={vendors} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete RFQ" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this RFQ permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, GitBranch, CheckCircle, XCircle } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useApprovalFlows, useApprovalRequests } from '@/lib/hooks';
import type { ApprovalFlow, ApprovalRequest } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const MODULES = ['deal', 'invoice', 'contract', 'expense', 'leave', 'purchase_request', 'other'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function FlowModal({ isOpen, onClose, flow, onSave }: {
  isOpen: boolean; onClose: () => void; flow: ApprovalFlow | null;
  onSave: (d: Partial<ApprovalFlow>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', description: '', module: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (flow) setForm({ name: flow.name, description: flow.description ?? '', module: flow.module ?? '', isActive: flow.isActive ?? true });
    else setForm({ name: '', description: '', module: '', isActive: true });
  }, [flow, isOpen]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, description: form.description || undefined, module: form.module || undefined, isActive: form.isActive });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={flow ? 'Edit Approval Flow' : 'New Approval Flow'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
          <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Invoice Approval" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module</label>
          <select className={inp} value={form.module} onChange={e => set('module', e.target.value)}>
            <option value="">Select module</option>
            {MODULES.map(m => <option key={m} value={m}>{label(m)}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground">Active</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : flow ? 'Save Changes' : 'Create Flow'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RequestModal({ isOpen, onClose, flows, onSave }: {
  isOpen: boolean; onClose: () => void;
  flows: ApprovalFlow[];
  onSave: (d: Partial<ApprovalRequest>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ flowId: '', title: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setForm({ flowId: '', title: '', reason: '' }); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ flowId: form.flowId || undefined, title: form.title, reason: form.reason || undefined } as any);
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Approval Request" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Approve Q4 budget" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approval Flow</label>
          <select className={inp} value={form.flowId} onChange={e => setForm(p => ({ ...p, flowId: e.target.value }))}>
            <option value="">No flow (ad-hoc)</option>
            {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for this request..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Request'}</button>
        </div>
      </form>
    </Modal>
  );
}

const requestStatusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'pending') return 'warning';
  return 'default';
};

export default function WorkflowsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { flows, isLoading, error, createFlow, updateFlow, deleteFlow } = useApprovalFlows();
  const { requests, isLoading: reqLoading, createRequest, decideRequest } = useApprovalRequests();
  const [tab, setTab] = useState<'flows' | 'requests'>('flows');
  const [search, setSearch] = useState('');
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<ApprovalFlow | null>(null);
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load workflows.' }); }, [error]);

  const filteredFlows = useMemo(() => {
    if (!search.trim()) return flows;
    const q = search.toLowerCase();
    return flows.filter(f => f.name.toLowerCase().includes(q));
  }, [flows, search]);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(r => r.title.toLowerCase().includes(q));
  }, [requests, search]);

  const handleSaveFlow = async (d: Partial<ApprovalFlow>) => {
    if (editFlow) { await updateFlow(editFlow.id, d); addToast({ type: 'success', message: 'Flow updated.' }); }
    else { await createFlow(d); addToast({ type: 'success', message: 'Flow created.' }); }
  };

  const handleDecide = async (id: string, decision: 'approved' | 'rejected') => {
    try { await decideRequest(id, decision); addToast({ type: 'success', message: `Request ${decision}.` }); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteFlow(deleteId); addToast({ type: 'success', message: 'Flow deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage approval flows and requests</p>
        </div>
        <div className="flex gap-2 self-start">
          {tab === 'flows' && (
            <button onClick={() => { setEditFlow(null); setFlowModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> New Flow
            </button>
          )}
          {tab === 'requests' && (
            <button onClick={() => setReqModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> New Request
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(['flows', 'requests'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {label(t)}
          </button>
        ))}
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {/* Flows tab */}
      {tab === 'flows' && (
        isLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        : filteredFlows.length === 0 ? <Card className="text-center py-12"><p className="text-muted-foreground">No approval flows found</p></Card>
        : (
          <div className="space-y-3">
            {filteredFlows.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><GitBranch className="w-5 h-5 text-primary" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{f.name}</h3>
                          {f.module && <Badge variant="info" size="sm">{label(f.module)}</Badge>}
                          <Badge variant={f.isActive ? 'success' : 'default'} size="sm">{f.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        {f.description && <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditFlow(f); setFlowModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(f.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Requests tab */}
      {tab === 'requests' && (
        reqLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        : filteredRequests.length === 0 ? <Card className="text-center py-12"><p className="text-muted-foreground">No approval requests found</p></Card>
        : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Module</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="w-28 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r: any, i: number) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.module ? label(r.module) : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={requestStatusVariant(r.status)} size="sm">{label(r.status)}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(r.createdAt, { includeTime: false })}</td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => handleDecide(r.id, 'approved')} title="Approve" className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleDecide(r.id, 'rejected')} title="Reject" className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><XCircle className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <FlowModal isOpen={flowModalOpen} onClose={() => { setFlowModalOpen(false); setEditFlow(null); }} flow={editFlow} onSave={handleSaveFlow} />
      <RequestModal isOpen={reqModalOpen} onClose={() => setReqModalOpen(false)} flows={flows} onSave={async d => { await createRequest(d); addToast({ type: 'success', message: 'Request submitted.' }); }} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Flow" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this approval flow permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

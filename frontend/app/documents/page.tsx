'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, FileStack, PenLine, CheckCircle } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useDocuments } from '@/lib/hooks';
import { apiFetch } from '@/lib/api';
import { triggerRefresh } from '@/lib/hooks';
import type { Document } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'active', 'archived', 'expired'];
const RELATED_MODELS = ['deal', 'contact', 'company', 'invoice', 'contract', 'other'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (s: string): 'default' | 'success' | 'error' | 'info' => {
  if (s === 'active') return 'success';
  if (s === 'expired') return 'error';
  if (s === 'archived') return 'info';
  return 'default';
};

function DocModal({ isOpen, onClose, doc, onSave }: {
  isOpen: boolean; onClose: () => void; doc: Document | null;
  onSave: (d: Partial<Document>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', category: '', status: 'draft', relatedModel: '', relatedId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (doc) {
      setForm({ name: doc.name, category: doc.category ?? '', status: doc.status, relatedModel: doc.relatedModel ?? '', relatedId: doc.relatedId ?? '' });
    } else {
      setForm({ name: '', category: '', status: 'draft', relatedModel: '', relatedId: '' });
    }
  }, [doc, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, category: form.category || undefined, status: form.status, relatedModel: form.relatedModel || undefined, relatedId: form.relatedId || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doc ? 'Edit Document' : 'New Document'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
          <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Service Agreement 2026" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Legal" />
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related To</label>
            <select className={inp} value={form.relatedModel} onChange={e => set('relatedModel', e.target.value)}>
              <option value="">None</option>
              {RELATED_MODELS.map(m => <option key={m} value={m}>{label(m)}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related ID</label>
            <input className={inp} value={form.relatedId} onChange={e => set('relatedId', e.target.value)} placeholder="UUID of related record" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : doc ? 'Save Changes' : 'Create Document'}</button>
        </div>
      </form>
    </Modal>
  );
}

function SignModal({ isOpen, onClose, docId, onSign }: {
  isOpen: boolean; onClose: () => void; docId: string;
  onSign: (name: string) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setName(''); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { addToast({ type: 'error', message: 'Signature name is required.' }); return; }
    setSubmitting(true);
    try { await onSign(name.trim()); onClose(); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed to sign.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Document" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name (Signature) *</label>
          <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" autoFocus required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Signing...' : 'Sign'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function DocumentsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { documents, isLoading, error, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [signDocId, setSignDocId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load documents.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(d => d.name.toLowerCase().includes(q) || (d.category ?? '').toLowerCase().includes(q));
  }, [documents, search]);

  const handleSave = async (d: Partial<Document>) => {
    if (editDoc) { await updateDocument(editDoc.id, d); addToast({ type: 'success', message: 'Document updated.' }); }
    else { await createDocument(d); addToast({ type: 'success', message: 'Document created.' }); }
  };

  const handleSign = async (signatureName: string) => {
    if (!signDocId) return;
    await apiFetch(`/documents/${signDocId}/sign`, { method: 'PUT', body: JSON.stringify({ signatureName }) });
    triggerRefresh('documents');
    addToast({ type: 'success', message: 'Document signed.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteDocument(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage documents and digital signatures</p>
        </div>
        <button onClick={() => { setEditDoc(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No documents found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Version</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Signed</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="w-28 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileStack className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.category || '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">v{d.version}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(d.status)} size="sm">{label(d.status)}</Badge></td>
                  <td className="px-4 py-3">
                    {d.signed
                      ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" />{d.signatureName}</span>
                      : <span className="text-muted-foreground text-xs">Not signed</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(d.createdAt, { includeTime: false })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {!d.signed && <button onClick={() => setSignDocId(d.id)} title="Sign" className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors"><PenLine className="w-4 h-4" /></button>}
                      <button onClick={() => { setEditDoc(d); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DocModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditDoc(null); }} doc={editDoc} onSave={handleSave} />
      <SignModal isOpen={!!signDocId} onClose={() => setSignDocId(null)} docId={signDocId ?? ''} onSign={handleSign} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Document" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this document permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

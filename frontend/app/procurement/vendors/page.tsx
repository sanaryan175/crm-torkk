'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Truck } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useVendors } from '@/lib/hooks';
import type { Vendor } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['active', 'inactive', 'blacklisted'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'success' | 'default' | 'error' => {
  if (s === 'active') return 'success';
  if (s === 'blacklisted') return 'error';
  return 'default';
};

function VendorModal({ isOpen, onClose, vendor, onSave }: {
  isOpen: boolean; onClose: () => void; vendor: Vendor | null;
  onSave: (d: Partial<Vendor>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', address: '', paymentTerms: '', notes: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (vendor) {
      setForm({ name: vendor.name, company: vendor.company ?? '', email: vendor.email ?? '', phone: vendor.phone ?? '', address: vendor.address ?? '', paymentTerms: vendor.paymentTerms ?? '', notes: vendor.notes ?? '', status: vendor.status ?? 'active' });
    } else {
      setForm({ name: '', company: '', email: '', phone: '', address: '', paymentTerms: '', notes: '', status: 'active' });
    }
  }, [vendor, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Vendor name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({
        name: form.name, company: form.company || undefined, email: form.email || undefined,
        phone: form.phone || undefined, address: form.address || undefined,
        paymentTerms: form.paymentTerms || undefined, notes: form.notes || undefined, status: form.status,
      });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed to save.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vendor ? 'Edit Vendor' : 'New Vendor'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
            <input className={inp} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Supplies Inc." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
            <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="vendor@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</label>
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Supplier Lane" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Terms</label>
            <input className={inp} value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} placeholder="Net 30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Saving...' : vendor ? 'Save Changes' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function VendorsPage() {
  const { addToast } = useUI();
  const { vendors, isLoading, error, createVendor, updateVendor, deleteVendor } = useVendors();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load vendors.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return vendors;
    const q = search.toLowerCase();
    return vendors.filter(v => v.name.toLowerCase().includes(q) || (v.company ?? '').toLowerCase().includes(q) || (v.email ?? '').toLowerCase().includes(q));
  }, [vendors, search]);

  const handleSave = async (d: Partial<Vendor>) => {
    if (editVendor) { await updateVendor(editVendor.id, d); addToast({ type: 'success', message: 'Vendor updated.' }); }
    else { await createVendor(d); addToast({ type: 'success', message: 'Vendor created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteVendor(deleteId); addToast({ type: 'success', message: 'Vendor deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage your supplier and vendor relationships</p>
        </div>
        <button onClick={() => { setEditVendor(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Vendor
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No vendors found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Company</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Payment Terms</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.company || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.phone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.paymentTerms || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(v.status ?? 'active')} size="sm">{label(v.status ?? 'active')}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditVendor(v); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VendorModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditVendor(null); }} vendor={editVendor} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Vendor" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this vendor permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

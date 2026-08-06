'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Cpu } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useAssets, useTeamMembers } from '@/lib/hooks';
import type { CompanyAsset } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['in_stock', 'in_use', 'under_maintenance', 'disposed'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  if (s === 'in_use') return 'success';
  if (s === 'in_stock') return 'info';
  if (s === 'under_maintenance') return 'warning';
  if (s === 'disposed') return 'error';
  return 'default';
};

function AssetModal({ isOpen, onClose, asset, onSave }: {
  isOpen: boolean; onClose: () => void; asset: CompanyAsset | null;
  onSave: (d: Partial<CompanyAsset>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { members } = useTeamMembers();
  const [form, setForm] = useState({ name: '', assetCode: '', category: '', serialNumber: '', purchaseDate: '', purchaseCost: '', currentValue: '', depreciationRate: '', vendorName: '', warrantyExpiry: '', status: 'in_stock', assignedToId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (asset) {
      setForm({ name: asset.name, assetCode: asset.assetCode ?? '', category: asset.category, serialNumber: asset.serialNumber ?? '', purchaseDate: asset.purchaseDate ? String(asset.purchaseDate).slice(0, 10) : '', purchaseCost: String(asset.purchaseCost), currentValue: String(asset.currentValue), depreciationRate: asset.depreciationRate != null ? String(asset.depreciationRate) : '', vendorName: asset.vendorName ?? '', warrantyExpiry: asset.warrantyExpiry ? String(asset.warrantyExpiry).slice(0, 10) : '', status: asset.status, assignedToId: asset.assignedToId ?? '', notes: asset.notes ?? '' });
    } else {
      setForm({ name: '', assetCode: '', category: '', serialNumber: '', purchaseDate: '', purchaseCost: '', currentValue: '', depreciationRate: '', vendorName: '', warrantyExpiry: '', status: 'in_stock', assignedToId: '', notes: '' });
    }
  }, [asset, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) { addToast({ type: 'error', message: 'Name and category are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, assetCode: form.assetCode || undefined, category: form.category, serialNumber: form.serialNumber || undefined, purchaseDate: form.purchaseDate || undefined, purchaseCost: parseFloat(form.purchaseCost) || 0, currentValue: parseFloat(form.currentValue) || 0, depreciationRate: form.depreciationRate ? parseFloat(form.depreciationRate) : undefined, vendorName: form.vendorName || undefined, warrantyExpiry: form.warrantyExpiry || undefined, status: form.status, assignedToId: form.assignedToId || undefined, notes: form.notes || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset ? 'Edit Asset' : 'New Asset'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="MacBook Pro 16" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset Code</label>
            <input className={inp} value={form.assetCode} onChange={e => set('assetCode', e.target.value)} placeholder="AST-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category *</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Electronics" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serial Number</label>
            <input className={inp} value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} placeholder="SN-XXXX" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase Cost</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.purchaseCost} onChange={e => set('purchaseCost', e.target.value)} placeholder="2500.00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Value</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.currentValue} onChange={e => set('currentValue', e.target.value)} placeholder="1800.00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Depreciation Rate %</label>
            <input type="number" min="0" max="100" step="0.01" className={inp} value={form.depreciationRate} onChange={e => set('depreciationRate', e.target.value)} placeholder="20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase Date</label>
            <input type="date" className={inp} value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warranty Expiry</label>
            <input type="date" className={inp} value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</label>
            <input className={inp} value={form.vendorName} onChange={e => set('vendorName', e.target.value)} placeholder="Apple Inc." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</label>
            <select className={inp} value={form.assignedToId} onChange={e => set('assignedToId', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : asset ? 'Save Changes' : 'Create Asset'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AssetsPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { assets, isLoading, error, createAsset, updateAsset, deleteAsset } = useAssets();
  const { members } = useTeamMembers();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<CompanyAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load assets.' }); }, [error]);

  const memberMap = useMemo(() => { const m: Record<string, string> = {}; members.forEach(u => { m[u.id] = u.name; }); return m; }, [members]);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.assetCode ?? '').toLowerCase().includes(q));
  }, [assets, search]);

  const handleSave = async (d: Partial<CompanyAsset>) => {
    if (editAsset) { await updateAsset(editAsset.id, d); addToast({ type: 'success', message: 'Asset updated.' }); }
    else { await createAsset(d); addToast({ type: 'success', message: 'Asset created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteAsset(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-1">Track company assets, depreciation and assignments</p>
        </div>
        <button onClick={() => { setEditAsset(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Asset
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No assets found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Purchase Cost</th>
                <th className="text-right px-4 py-3 font-semibold">Current Value</th>
                <th className="text-left px-4 py-3 font-semibold">Assigned To</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.assetCode || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(a.purchaseCost)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(a.currentValue)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.assignedToId ? (memberMap[a.assignedToId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(a.status)} size="sm">{label(a.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditAsset(a); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssetModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditAsset(null); }} asset={editAsset} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Asset" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this asset permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

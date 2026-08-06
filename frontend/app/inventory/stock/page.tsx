'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useStockMovements, useProducts, useWarehouses } from '@/lib/hooks';
import type { StockMovement } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const TYPES = ['in', 'out', 'adjustment', 'transfer'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const typeVariant = (t: string): 'success' | 'error' | 'warning' | 'info' => {
  if (t === 'in') return 'success';
  if (t === 'out') return 'error';
  if (t === 'adjustment') return 'warning';
  return 'info';
};

function MovementModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (d: Partial<StockMovement>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const [form, setForm] = useState({ productId: '', warehouseId: '', type: 'in', quantity: '', unitCost: '', reference: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setForm({ productId: '', warehouseId: '', type: 'in', quantity: '', unitCost: '', reference: '', note: '' }); }, [isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) { addToast({ type: 'error', message: 'Product and quantity are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ productId: form.productId, warehouseId: form.warehouseId || undefined, type: form.type, quantity: parseInt(form.quantity), unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined, reference: form.reference || undefined, note: form.note || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Stock Movement" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product *</label>
            <select className={inp} value={form.productId} onChange={e => set('productId', e.target.value)} required>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warehouse</label>
            <select className={inp} value={form.warehouseId} onChange={e => set('warehouseId', e.target.value)}>
              <option value="">No warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity *</label>
            <input type="number" min="1" className={inp} value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="10" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Cost</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.unitCost} onChange={e => set('unitCost', e.target.value)} placeholder="9.99" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</label>
            <input className={inp} value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="PO-001 or SO-001" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note</label>
            <input className={inp} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Optional note" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : 'Record Movement'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function StockPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { movements, isLoading, error, createMovement, deleteMovement } = useStockMovements();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load stock movements.' }); }, [error]);

  const productMap = useMemo(() => { const m: Record<string, string> = {}; products.forEach(p => { m[p.id] = p.name; }); return m; }, [products]);
  const warehouseMap = useMemo(() => { const m: Record<string, string> = {}; warehouses.forEach(w => { m[w.id] = w.name; }); return m; }, [warehouses]);

  const filtered = useMemo(() => {
    if (!search.trim()) return movements;
    const q = search.toLowerCase();
    return movements.filter(m => (productMap[m.productId] ?? '').toLowerCase().includes(q) || (m.reference ?? '').toLowerCase().includes(q));
  }, [movements, search, productMap]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteMovement(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Movements</h1>
          <p className="text-muted-foreground mt-1">Track stock in, out and adjustments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> Record Movement
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search movements..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No stock movements found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">Warehouse</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Qty</th>
                <th className="text-right px-4 py-3 font-semibold">Unit Cost</th>
                <th className="text-left px-4 py-3 font-semibold">Reference</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.type === 'in' ? <ArrowDownToLine className="w-3.5 h-3.5 text-green-500" /> : <ArrowUpFromLine className="w-3.5 h-3.5 text-red-500" />}
                      <span className="font-medium text-foreground">{productMap[m.productId] ?? m.productId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.warehouseId ? (warehouseMap[m.warehouseId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={typeVariant(m.type)} size="sm">{label(m.type)}</Badge></td>
                  <td className={`px-4 py-3 text-right font-semibold ${m.type === 'in' ? 'text-green-600' : m.type === 'out' ? 'text-red-500' : 'text-foreground'}`}>
                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.unitCost != null ? formatMoney(m.unitCost) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.reference || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(m.createdAt, { includeTime: false })}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MovementModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={async d => { await createMovement(d); addToast({ type: 'success', message: 'Movement recorded.' }); }} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Movement" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this stock movement permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

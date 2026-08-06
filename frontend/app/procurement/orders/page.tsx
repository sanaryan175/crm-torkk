'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Trash2, ShoppingBag, ChevronDown } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { usePurchaseOrders, useVendors } from '@/lib/hooks';
import type { PurchaseOrder } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'confirmed', 'shipped', 'received', 'cancelled'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'received') return 'success';
  if (s === 'cancelled') return 'error';
  if (s === 'shipped') return 'warning';
  if (s === 'confirmed') return 'info';
  return 'default';
};

function POModal({ isOpen, onClose, vendors, onSave }: {
  isOpen: boolean; onClose: () => void;
  vendors: { id: string; name: string }[];
  onSave: (d: any) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ vendorId: '', orderDate: new Date().toISOString().slice(0, 10), expectedDate: '', currency: 'USD', subtotal: '', tax: '', total: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isOpen) setForm({ vendorId: '', orderDate: new Date().toISOString().slice(0, 10), expectedDate: '', currency: 'USD', subtotal: '', tax: '', total: '' }); }, [isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorId) { addToast({ type: 'error', message: 'Vendor is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ vendorId: form.vendorId, orderDate: form.orderDate, expectedDate: form.expectedDate || undefined, currency: form.currency, subtotal: parseFloat(form.subtotal) || 0, tax: parseFloat(form.tax) || 0, total: parseFloat(form.total) || 0 });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Purchase Order" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor *</label>
          <select className={inp} value={form.vendorId} onChange={e => set('vendorId', e.target.value)} required>
            <option value="">Select vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Date</label>
            <input type="date" className={inp} value={form.orderDate} onChange={e => set('orderDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Delivery</label>
            <input type="date" className={inp} value={form.expectedDate} onChange={e => set('expectedDate', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
            <input className={inp} value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtotal</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.subtotal} onChange={e => set('subtotal', e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.tax} onChange={e => set('tax', e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.total} onChange={e => set('total', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function PurchaseOrdersPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { orders, isLoading, error, createOrder, updateOrderStatus, deleteOrder } = usePurchaseOrders();
  const { vendors } = useVendors();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load purchase orders.' }); }, [error]);

  const vendorMap = useMemo(() => { const m: Record<string, string> = {}; vendors.forEach(v => { m[v.id] = v.name; }); return m; }, [vendors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => o.poNumber.toLowerCase().includes(q) || (o.vendor?.name ?? '').toLowerCase().includes(q));
  }, [orders, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteOrder(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage orders placed with vendors</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No purchase orders found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">PO #</th>
                <th className="text-left px-4 py-3 font-semibold">Vendor</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Order Date</th>
                <th className="text-left px-4 py-3 font-semibold">Expected</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Change Status</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.poNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{o.vendor?.name ?? (o.vendorId ? vendorMap[o.vendorId] : '—') ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(o.status)} size="sm">{label(o.status)}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.orderDate ? formatDateTime(o.orderDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.expectedDate ? formatDateTime(o.expectedDate, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-muted/40 border border-border/40 rounded-lg px-2 py-1 text-xs text-foreground outline-none"
                      value={o.status}
                      onChange={async e => {
                        try { await updateOrderStatus(o.id, e.target.value); }
                        catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
                      }}>
                      {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(o.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <POModal isOpen={modalOpen} onClose={() => setModalOpen(false)} vendors={vendors} onSave={async d => { await createOrder(d); addToast({ type: 'success', message: 'Purchase order created.' }); }} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Purchase Order" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this purchase order permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

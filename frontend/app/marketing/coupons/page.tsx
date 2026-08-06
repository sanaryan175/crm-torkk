'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Tag } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useCoupons } from '@/lib/hooks';
import type { Coupon } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

const DISCOUNT_TYPES = ['percentage', 'fixed'];
const STATUSES = ['active', 'inactive', 'expired'];

const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' => {
  if (s === 'active') return 'success';
  if (s === 'expired') return 'error';
  return 'default';
};

function CouponModal({
  isOpen, onClose, coupon, onSave,
}: {
  isOpen: boolean; onClose: () => void; coupon: Coupon | null;
  onSave: (d: Partial<Coupon>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '',
    validFrom: '', validTo: '', usageLimit: '0', status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (coupon) {
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        validFrom: coupon.validFrom ? String(coupon.validFrom).slice(0, 10) : '',
        validTo: coupon.validTo ? String(coupon.validTo).slice(0, 10) : '',
        usageLimit: String(coupon.usageLimit),
        status: coupon.status,
      });
    } else {
      setForm({ code: '', discountType: 'percentage', discountValue: '', validFrom: '', validTo: '', usageLimit: '0', status: 'active' });
    }
  }, [coupon, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { addToast({ type: 'error', message: 'Coupon code is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue) || 0,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        usageLimit: parseInt(form.usageLimit) || 0,
        status: form.status,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save coupon.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={coupon ? 'Edit Coupon' : 'New Coupon'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code *</label>
          <input className={inp} value={form.code} onChange={e => set('code', e.target.value)} placeholder="SUMMER20" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount Type</label>
            <select className={inp} value={form.discountType} onChange={e => set('discountType', e.target.value)}>
              {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount Value</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.discountValue} onChange={e => set('discountValue', e.target.value)} placeholder="20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valid From</label>
            <input type="date" className={inp} value={form.validFrom} onChange={e => set('validFrom', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valid To</label>
            <input type="date" className={inp} value={form.validTo} onChange={e => set('validTo', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage Limit (0 = unlimited)</label>
            <input type="number" min="0" className={inp} value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {submitting ? 'Saving...' : coupon ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CouponsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { coupons, isLoading, error, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load coupons.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(c => c.code.toLowerCase().includes(q) || c.discountType.includes(q));
  }, [coupons, search]);

  const handleSave = async (d: Partial<Coupon>) => {
    if (editCoupon) { await updateCoupon(editCoupon.id, d); addToast({ type: 'success', message: 'Coupon updated.' }); }
    else { await createCoupon(d); addToast({ type: 'success', message: 'Coupon created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteCoupon(deleteId); addToast({ type: 'success', message: 'Coupon deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage discount coupons and promo codes</p>
        </div>
        <button onClick={() => { setEditCoupon(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No coupons found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Value</th>
                <th className="text-left px-4 py-3 font-semibold">Valid From</th>
                <th className="text-left px-4 py-3 font-semibold">Valid To</th>
                <th className="text-right px-4 py-3 font-semibold">Limit</th>
                <th className="text-right px-4 py-3 font-semibold">Used</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-foreground flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />{c.code}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{c.discountType}</td>
                  <td className="px-4 py-3 text-right font-medium">{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.validFrom ? formatDateTime(c.validFrom, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.validTo ? formatDateTime(c.validTo, { includeTime: false }) : '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.usageLimit === 0 ? '∞' : c.usageLimit}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.usedCount ?? 0}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(c.status)} size="sm">{c.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditCoupon(c); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CouponModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditCoupon(null); }} coupon={editCoupon} onSave={handleSave} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this coupon permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

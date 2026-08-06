'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Share2 } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useReferrals } from '@/lib/hooks';
import type { Referral } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['pending', 'qualified', 'rewarded', 'rejected'];
const REWARD_TYPES = ['cash', 'credit', 'discount', 'gift'];

const statusVariant = (s: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
  if (s === 'rewarded') return 'success';
  if (s === 'qualified') return 'info';
  if (s === 'rejected') return 'error';
  return 'warning';
};

function ReferralModal({ isOpen, onClose, referral, onSave }: {
  isOpen: boolean; onClose: () => void; referral: Referral | null;
  onSave: (d: Partial<Referral>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({
    referrerName: '', referrerEmail: '', referredName: '', referredEmail: '',
    status: 'pending', rewardType: 'cash', rewardAmount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (referral) {
      setForm({
        referrerName: referral.referrerName ?? '',
        referrerEmail: referral.referrerEmail ?? '',
        referredName: referral.referredName ?? '',
        referredEmail: referral.referredEmail ?? '',
        status: referral.status,
        rewardType: referral.rewardType ?? 'cash',
        rewardAmount: referral.rewardAmount != null ? String(referral.rewardAmount) : '',
      });
    } else {
      setForm({ referrerName: '', referrerEmail: '', referredName: '', referredEmail: '', status: 'pending', rewardType: 'cash', rewardAmount: '' });
    }
  }, [referral, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        referrerName: form.referrerName || undefined,
        referrerEmail: form.referrerEmail || undefined,
        referredName: form.referredName || undefined,
        referredEmail: form.referredEmail || undefined,
        status: form.status,
        rewardType: form.rewardType || undefined,
        rewardAmount: form.rewardAmount ? parseFloat(form.rewardAmount) : undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save referral.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={referral ? 'Edit Referral' : 'New Referral'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referrer Name</label>
            <input className={inp} value={form.referrerName} onChange={e => set('referrerName', e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referrer Email</label>
            <input type="email" className={inp} value={form.referrerEmail} onChange={e => set('referrerEmail', e.target.value)} placeholder="john@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referred Name</label>
            <input className={inp} value={form.referredName} onChange={e => set('referredName', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referred Email</label>
            <input type="email" className={inp} value={form.referredEmail} onChange={e => set('referredEmail', e.target.value)} placeholder="jane@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward Type</label>
            <select className={inp} value={form.rewardType} onChange={e => set('rewardType', e.target.value)}>
              {REWARD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward Amount</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.rewardAmount} onChange={e => set('rewardAmount', e.target.value)} placeholder="50" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Saving...' : referral ? 'Save Changes' : 'Create Referral'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ReferralsPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { referrals, isLoading, error, createReferral, updateReferral, deleteReferral } = useReferrals();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editReferral, setEditReferral] = useState<Referral | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load referrals.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return referrals;
    const q = search.toLowerCase();
    return referrals.filter(r =>
      (r.referrerName ?? '').toLowerCase().includes(q) ||
      (r.referredName ?? '').toLowerCase().includes(q) ||
      (r.referrerEmail ?? '').toLowerCase().includes(q)
    );
  }, [referrals, search]);

  const handleSave = async (d: Partial<Referral>) => {
    if (editReferral) { await updateReferral(editReferral.id, d); addToast({ type: 'success', message: 'Referral updated.' }); }
    else { await createReferral(d); addToast({ type: 'success', message: 'Referral created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteReferral(deleteId); addToast({ type: 'success', message: 'Referral deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground mt-1">Track and reward customer referrals</p>
        </div>
        <button onClick={() => { setEditReferral(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Referral
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search referrals..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No referrals found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Referrer</th>
                <th className="text-left px-4 py-3 font-semibold">Referred</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Reward Type</th>
                <th className="text-right px-4 py-3 font-semibold">Reward</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{r.referrerName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{r.referrerEmail || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.referredName || '—'}</p>
                    <p className="text-xs text-muted-foreground">{r.referredEmail || ''}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.rewardType || '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{r.rewardAmount != null ? formatMoney(r.rewardAmount) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(r.createdAt, { includeTime: false })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditReferral(r); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReferralModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditReferral(null); }} referral={editReferral} onSave={handleSave} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Referral" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this referral permanently?</p>
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Landmark } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useBankAccounts } from '@/lib/hooks';
import type { BankAccount } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const ACCOUNT_TYPES = ['savings', 'current', 'cash', 'credit'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function BankModal({ isOpen, onClose, account, onSave }: {
  isOpen: boolean; onClose: () => void; account: BankAccount | null;
  onSave: (d: Partial<BankAccount>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', bankName: '', accountNumber: '', accountType: 'savings', ifsc: '', branch: '', openingBalance: '', isDefault: false, isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (account) setForm({ name: account.name, bankName: account.bankName ?? '', accountNumber: account.accountNumber ?? '', accountType: account.accountType ?? 'savings', ifsc: account.ifsc ?? '', branch: account.branch ?? '', openingBalance: account.openingBalance != null ? String(account.openingBalance) : '', isDefault: account.isDefault ?? false, isActive: account.isActive ?? true });
    else setForm({ name: '', bankName: '', accountNumber: '', accountType: 'savings', ifsc: '', branch: '', openingBalance: '', isDefault: false, isActive: true });
  }, [account, isOpen]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Account name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, bankName: form.bankName || undefined, accountNumber: form.accountNumber || undefined, accountType: form.accountType, ifsc: form.ifsc || undefined, branch: form.branch || undefined, openingBalance: form.openingBalance ? parseFloat(form.openingBalance) : undefined, isDefault: form.isDefault, isActive: form.isActive });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Bank Account' : 'New Bank Account'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Main Business Account" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Name</label>
            <input className={inp} value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="Chase Bank" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Number</label>
            <input className={inp} value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="****1234" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Type</label>
            <select className={inp} value={form.accountType} onChange={e => set('accountType', e.target.value)}>{ACCOUNT_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}</select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IFSC / Routing</label>
            <input className={inp} value={form.ifsc} onChange={e => set('ifsc', e.target.value)} placeholder="IFSC code" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch</label>
            <input className={inp} value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="Branch name" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opening Balance</label>
          <input type="number" min="0" step="0.01" className={inp} value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)} placeholder="0.00" />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground">Set as default</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground">Active</span>
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : account ? 'Save Changes' : 'Create Account'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function BanksPage() {
  const { addToast } = useUI();
  const { formatMoney } = useRegion();
  const { accounts, isLoading, error, createAccount, updateAccount, deleteAccount } = useBankAccounts();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load bank accounts.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(a => a.name.toLowerCase().includes(q) || (a.bankName ?? '').toLowerCase().includes(q));
  }, [accounts, search]);

  const totalBalance = useMemo(() => filtered.reduce((sum, a) => sum + a.balance, 0), [filtered]);

  const handleSave = async (d: Partial<BankAccount>) => {
    if (editAccount) { await updateAccount(editAccount.id, d); addToast({ type: 'success', message: 'Account updated.' }); }
    else { await createAccount(d); addToast({ type: 'success', message: 'Account created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteAccount(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage bank accounts and balances</p>
        </div>
        <button onClick={() => { setEditAccount(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Account
        </button>
      </div>

      <Card className="flex items-center gap-4">
        <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Landmark className="w-5 h-5 text-primary" /></div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Balance</p>
          <p className="text-2xl font-bold text-foreground">{formatMoney(totalBalance)}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No bank accounts found</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="py-4 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{a.name}</h3>
                      {a.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                      {!a.isActive && <Badge variant="error" size="sm">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.bankName || 'No bank name'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label(a.accountType ?? 'savings')} {a.accountNumber ? `· ${a.accountNumber}` : ''}</p>
                    {a.branch && <p className="text-xs text-muted-foreground">{a.branch}</p>}
                    <p className="text-xl font-bold text-foreground mt-3">{formatMoney(a.balance)}</p>
                    {a.openingBalance != null && <p className="text-xs text-muted-foreground">Opening: {formatMoney(a.openingBalance)}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditAccount(a); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <BankModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditAccount(null); }} account={editAccount} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Bank Account" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this bank account permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

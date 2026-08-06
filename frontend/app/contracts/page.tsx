'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, PenLine, FileSignature } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useContracts, useContacts, useCompanies } from '@/lib/hooks';
import type { Contract, ContractStatus } from '@/lib/types';

const STATUS_VARIANT: Record<ContractStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  active: 'success',
  expired: 'warning',
  terminated: 'error',
};

const fmtMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString() : '—';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

// ─── New / Edit Contract Modal ────────────────────────────────────────────────
function ContractModal({
  isOpen,
  onClose,
  contract,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSave: (data: Partial<Contract>) => Promise<void>;
}) {
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { addToast } = useUI();
  const [form, setForm] = useState({
    title: '', type: '', contactId: '', companyId: '',
    startDate: '', endDate: '', renewalDate: '', value: '', terms: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract) {
      setForm({
        title: contract.title,
        type: contract.type ?? '',
        contactId: contract.contactId ?? '',
        companyId: contract.companyId ?? '',
        startDate: contract.startDate ? String(contract.startDate).slice(0, 10) : '',
        endDate: contract.endDate ? String(contract.endDate).slice(0, 10) : '',
        renewalDate: contract.renewalDate ? String(contract.renewalDate).slice(0, 10) : '',
        value: String(contract.value ?? ''),
        terms: contract.terms ?? '',
      });
    } else {
      setForm({ title: '', type: '', contactId: '', companyId: '', startDate: '', endDate: '', renewalDate: '', value: '', terms: '' });
    }
  }, [contract, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast({ type: 'error', message: 'Contract title is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        title: form.title.trim(),
        type: form.type || undefined,
        contactId: form.contactId || undefined,
        companyId: form.companyId || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        renewalDate: form.renewalDate || undefined,
        value: form.value ? parseFloat(form.value) : 0,
        terms: form.terms || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save contract.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={contract ? 'Edit Contract' : 'New Contract'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
            <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Annual Support Contract" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <input className={inp} value={form.type} onChange={e => set('type', e.target.value)} placeholder="Service" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</label>
            <select className={inp} value={form.contactId} onChange={e => set('contactId', e.target.value)}>
              <option value="">No contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
            <select className={inp} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">No company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <input type="date" className={inp} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
            <input type="date" className={inp} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Renewal Date</label>
            <input type="date" className={inp} value={form.renewalDate} onChange={e => set('renewalDate', e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</label>
          <input type="number" min="0" step="0.01" className={inp} value={form.value} onChange={e => set('value', e.target.value)} placeholder="50000" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terms</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.terms} onChange={e => set('terms', e.target.value)} placeholder="Contract terms & conditions..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (contract ? 'Save Changes' : 'Create Contract')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Sign Contract Modal ──────────────────────────────────────────────────────
function SignModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signedByName: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', message: 'Please enter the signer name.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(name.trim());
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to sign contract.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Contract" description="Confirm the contract signer" size="md">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed By *</label>
          <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoFocus />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Signing...' : 'Sign Contract'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Contracts Page ───────────────────────────────────────────────────────────
export default function ContractsPage() {
  const { addToast } = useUI();
  const { contracts, isLoading, error, createContract, updateContract, signContract, deleteContract } = useContracts();
  const { contacts } = useContacts();
  const { companies } = useCompanies();

  const contactNames = new Map(contacts.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
  const companyNames = new Map(companies.map(c => [c.id, c.name]));

  const [modalOpen, setModalOpen] = useState(false);
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [signContractRow, setSignContractRow] = useState<Contract | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load contracts. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Contract>) => {
    await createContract(data);
    addToast({ type: 'success', message: 'Contract created successfully.' });
  };

  const handleUpdate = async (data: Partial<Contract>) => {
    if (!editContract) return;
    await updateContract(editContract.id, data);
    addToast({ type: 'success', message: 'Contract updated successfully.' });
  };

  const handleSign = async (signedByName: string) => {
    if (!signContractRow) return;
    await signContract(signContractRow.id, signedByName);
    addToast({ type: 'success', message: 'Contract signed successfully.' });
    setSignContractRow(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteContract(deleteId);
      addToast({ type: 'success', message: 'Contract deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete contract.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage agreements, renewals and signatures</p>
        </div>
        <button
          onClick={() => { setEditContract(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load contracts. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : contracts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No contracts found</p>
            <p className="text-sm text-muted-foreground">Create your first contract to get started</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {contracts.map((contract, index) => {
            const party = contract.contactId
              ? contactNames.get(contract.contactId)
              : contract.companyId
                ? companyNames.get(contract.companyId)
                : null;
            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          <FileSignature className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">
                            <span className="text-muted-foreground font-normal mr-1">#{contract.contractNumber}</span>
                            {contract.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {contract.type || 'No type'} {party ? `• ${party}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 pl-[52px] flex-wrap text-xs text-muted-foreground">
                        <span>Start: {fmtDate(contract.startDate)}</span>
                        <span>End: {fmtDate(contract.endDate)}</span>
                        <span>Renewal: {fmtDate(contract.renewalDate)}</span>
                        <span className="text-sm font-semibold text-foreground">{fmtMoney(contract.value)}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pl-[52px] flex-wrap">
                        <Badge variant={STATUS_VARIANT[contract.status]} size="sm">{contract.status}</Badge>
                        {contract.signedByName && (
                          <span className="text-xs text-muted-foreground">
                            Signed by {contract.signedByName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {contract.status !== 'active' && (
                        <button
                          onClick={() => setSignContractRow(contract)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                          title="Sign contract"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          Sign
                        </button>
                      )}
                      <button
                        onClick={() => { setEditContract(contract); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit contract"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(contract.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete contract"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ContractModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditContract(null); }}
        contract={editContract}
        onSave={editContract ? handleUpdate : handleCreate}
      />

      {/* Sign Modal */}
      <SignModal
        isOpen={!!signContractRow}
        onClose={() => setSignContractRow(null)}
        onConfirm={handleSign}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Contract" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this contract? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, ArrowLeftRight, Mail, Briefcase, User } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useLeads } from '@/lib/hooks';
import type { Lead, LeadStatus } from '@/lib/types';

const SOURCES = ['website', 'referral', 'cold_outreach', 'event', 'partner', 'inbound', 'outbound', 'other'];
const STATUS_FILTERS: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'];

const STATUS_VARIANT: Record<LeadStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'default',
  contacted: 'info',
  qualified: 'primary',
  unqualified: 'warning',
  converted: 'success',
  lost: 'error',
};

const fmtMoney = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n ?? 0);

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

// ─── New / Edit Lead Modal ────────────────────────────────────────────────────
function LeadModal({
  isOpen,
  onClose,
  lead,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSave: (data: Partial<Lead>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
    source: 'website', status: 'new' as LeadStatus, value: '', notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (lead) {
      setForm({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone ?? '',
        company: lead.company ?? '',
        jobTitle: lead.jobTitle ?? '',
        source: lead.source,
        status: lead.status,
        value: lead.value != null ? String(lead.value) : '',
        notes: lead.notes ?? '',
      });
    } else {
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '', source: 'website', status: 'new', value: '', notes: '' });
    }
  }, [lead, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) {
      addToast({ type: 'error', message: 'First name and email are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        phone: form.phone || undefined,
        company: form.company || undefined,
        jobTitle: form.jobTitle || undefined,
        value: form.value ? parseFloat(form.value) : undefined,
        notes: form.notes || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save lead.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead ? 'Edit Lead' : 'New Lead'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name *</label>
            <input className={inp} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Sarah" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
            <input className={inp} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Chen" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
          <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="sarah@company.com" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
            <input className={inp} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Title</label>
            <input className={inp} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="Sales Director" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</label>
            <input type="number" min="0" className={inp} value={form.value} onChange={e => set('value', e.target.value)} placeholder="50000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</label>
            <select className={inp} value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value as LeadStatus)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (lead ? 'Save Changes' : 'Create Lead')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Convert Lead Modal ───────────────────────────────────────────────────────
function ConvertModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { dealTitle: string; dealValue: number }) => Promise<void>;
}) {
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) { setDealTitle(''); setDealValue(''); }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!dealTitle.trim()) {
      addToast({ type: 'error', message: 'Deal title is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm({ dealTitle: dealTitle.trim(), dealValue: dealValue ? parseFloat(dealValue) : 0 });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to convert lead.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convert Lead" description="Convert this lead into a contact and a deal" size="md">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deal Title *</label>
          <input className={inp} value={dealTitle} onChange={e => setDealTitle(e.target.value)} placeholder="Enterprise License Deal" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deal Value</label>
          <input type="number" min="0" className={inp} value={dealValue} onChange={e => setDealValue(e.target.value)} placeholder="50000" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Converting...' : 'Convert Lead'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Leads Page ───────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { addToast } = useUI();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { leads, isLoading, error, createLead, updateLead, convertLead, deleteLead } = useLeads({
    status: statusFilter,
    source: sourceFilter || undefined,
  });

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter((l) =>
      l.firstName.toLowerCase().includes(q) ||
      l.lastName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.jobTitle || '').toLowerCase().includes(q) ||
      (l.phone || '').includes(q)
    );
  }, [leads, searchQuery]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [convertRow, setConvertRow] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load leads. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Lead>) => {
    await createLead(data);
    addToast({ type: 'success', message: 'Lead created successfully.' });
  };

  const handleUpdate = async (data: Partial<Lead>) => {
    if (!editLead) return;
    await updateLead(editLead.id, data);
    addToast({ type: 'success', message: 'Lead updated successfully.' });
  };

  const handleConvert = async (data: { dealTitle: string; dealValue: number }) => {
    if (!convertRow) return;
    await convertLead(convertRow.id, data);
    addToast({ type: 'success', message: 'Lead converted to contact & deal.' });
    setConvertRow(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteLead(deleteId);
      addToast({ type: 'success', message: 'Lead deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete lead.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Capture, nurture and convert your incoming leads</p>
        </div>
        <button
          onClick={() => { setEditLead(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Lead
        </button>
      </div>

      {/* Toolbar */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full sm:w-52 bg-muted/50 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
          >
            <option value="">All sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1 self-center">Status:</span>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(statusFilter === st ? undefined : st)}
              className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
          {(statusFilter || sourceFilter) && (
            <button
              onClick={() => { setStatusFilter(undefined); setSourceFilter(''); }}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load leads. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No leads found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new lead</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.company || 'No company'} • {lead.jobTitle || 'No title'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pl-[52px] flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {fmtMoney(lead.value)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pl-[52px] flex-wrap">
                      <Badge variant={STATUS_VARIANT[lead.status]} size="sm">{lead.status.replace('_', ' ')}</Badge>
                      <Badge variant="info" size="sm">{lead.source.replace('_', ' ')}</Badge>
                      {lead.assignedTo ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {lead.assignedTo.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground italic">
                          <Briefcase className="w-3 h-3" />
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {lead.status !== 'converted' && (
                      <button
                        onClick={() => setConvertRow(lead)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"
                        title="Convert to contact & deal"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditLead(lead); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit lead"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(lead.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditLead(null); }}
        lead={editLead}
        onSave={editLead ? handleUpdate : handleCreate}
      />

      {/* Convert Modal */}
      <ConvertModal
        isOpen={!!convertRow}
        onClose={() => setConvertRow(null)}
        onConfirm={handleConvert}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Lead" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this lead? This action cannot be undone.</p>
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

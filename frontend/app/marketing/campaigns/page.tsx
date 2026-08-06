'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Send, Megaphone } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useCampaigns } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { Campaign, CampaignStatus } from '@/lib/types';

const CAMPAIGN_TYPES = ['email', 'whatsapp', 'sms', 'push'];
const CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'sending', 'sent', 'completed', 'cancelled'];

const TYPE_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  email: 'primary',
  whatsapp: 'success',
  sms: 'info',
  push: 'warning',
};

const STATUS_VARIANTS: Record<CampaignStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'primary',
  completed: 'success',
  cancelled: 'error',
};

function toDateTimeLocal(d: Date | string) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00`;
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

// ─── New / Edit Campaign Modal ────────────────────────────────────────────────
function CampaignModal({
  isOpen,
  onClose,
  campaign,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSave: (data: Partial<Campaign>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({
    name: '', type: 'email', subject: '', content: '',
    status: 'draft' as CampaignStatus, scheduledAt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (campaign) {
      setForm({
        name: campaign.name,
        type: campaign.type || 'email',
        subject: campaign.subject ?? '',
        content: campaign.content ?? '',
        status: campaign.status,
        scheduledAt: campaign.scheduledAt ? toDateTimeLocal(campaign.scheduledAt) : '',
      });
    } else {
      setForm({ name: '', type: 'email', subject: '', content: '', status: 'draft', scheduledAt: '' });
    }
  }, [campaign, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ type: 'error', message: 'Campaign name is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        name: form.name.trim(),
        type: form.type,
        subject: form.subject || undefined,
        content: form.content || undefined,
        status: form.status,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save campaign.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={campaign ? 'Edit Campaign' : 'New Campaign'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Summer Sale" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>
              {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
            <input className={inp} value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Don't miss our offer!" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value as CampaignStatus)}>
              {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
          <textarea className={`${inp} resize-none`} rows={4} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Campaign message content..." />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled At</label>
          <input type="datetime-local" className={inp} value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (campaign ? 'Save Changes' : 'Create Campaign')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Send Campaign Modal ──────────────────────────────────────────────────────
function SendCampaignModal({
  campaign,
  isOpen,
  onClose,
  onSend,
}: {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (emails: string[]) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [recipients, setRecipients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setRecipients('');
  }, [isOpen]);

  const emails = useMemo(
    () => recipients.split('\n').map((l) => l.trim()).filter((l) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l)),
    [recipients]
  );

  const handleSubmit = async () => {
    if (emails.length === 0) {
      addToast({ type: 'error', message: 'Enter at least one valid recipient email.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSend(emails);
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to send campaign.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send "${campaign?.name || ''}"`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Enter one recipient email per line. Valid emails will be sent to.</p>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipients</label>
          <textarea
            rows={7}
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder={'alice@company.com\nbob@company.com'}
            className="w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors resize-none font-mono"
          />
        </div>
        <p className="text-xs text-muted-foreground">{emails.length} valid recipient{emails.length === 1 ? '' : 's'}</p>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Sending...' : `Send to ${emails.length}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Campaigns Page ───────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { campaigns, isLoading, error, createCampaign, updateCampaign, sendCampaign, deleteCampaign } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [sendCampaignId, setSendCampaignId] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      (c.subject || '').toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load campaigns. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Campaign>) => {
    await createCampaign(data);
    addToast({ type: 'success', message: 'Campaign created successfully.' });
  };

  const handleUpdate = async (data: Partial<Campaign>) => {
    if (!editCampaign) return;
    await updateCampaign(editCampaign.id, data);
    addToast({ type: 'success', message: 'Campaign updated successfully.' });
  };

  const handleSend = async (emails: string[]) => {
    if (!sendCampaignId) return;
    await sendCampaign(sendCampaignId.id, emails.map((email) => ({ email })));
    addToast({ type: 'success', message: `Campaign sent to ${emails.length} recipient${emails.length === 1 ? '' : 's'}.` });
    setSendCampaignId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(deleteId);
      addToast({ type: 'success', message: 'Campaign deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete campaign.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Plan and send marketing campaigns across channels</p>
        </div>
        <button
          onClick={() => { setEditCampaign(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search campaigns..."
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
      </Card>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load campaigns. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No campaigns found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new campaign</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Scheduled</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Sent</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Opened</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Clicked</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Recipients</th>
                <th className="w-10 px-4 py-3" />
                <th className="w-10 px-4 py-3" />
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        {c.subject && <p className="text-xs text-muted-foreground">{c.subject}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_VARIANTS[c.type] || 'default'} size="sm">{c.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[c.status] || 'default'} size="sm">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.scheduledAt ? formatDateTime(c.scheduledAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.sentCount ?? 0}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.openCount ?? 0}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.clickCount ?? 0}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c._count?.recipients ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSendCampaignId(c)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Send campaign"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditCampaign(c); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit campaign"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <CampaignModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCampaign(null); }}
        campaign={editCampaign}
        onSave={editCampaign ? handleUpdate : handleCreate}
      />

      {/* Send Modal */}
      <SendCampaignModal campaign={sendCampaignId} isOpen={!!sendCampaignId} onClose={() => setSendCampaignId(null)} onSend={handleSend} />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Campaign" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this campaign? This action cannot be undone.</p>
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

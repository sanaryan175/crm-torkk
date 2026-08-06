'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Trash2, Pencil, MessageSquare, ChevronDown } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useTickets } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { Ticket, TicketStatus, TicketPriority } from '@/lib/types';

const STATUSES: TicketStatus[] = ['open', 'pending', 'resolved', 'closed', 'reopened'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

const STATUS_BADGE: Record<TicketStatus, 'primary' | 'warning' | 'success' | 'default' | 'info'> = {
  open: 'primary',
  pending: 'warning',
  resolved: 'success',
  closed: 'default',
  reopened: 'info',
};

const PRIORITY_BADGE: Record<TicketPriority, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

function statusBadge(status: string) {
  return STATUS_BADGE[status as TicketStatus] || 'default';
}

function priorityBadge(priority: string) {
  return PRIORITY_BADGE[priority as TicketPriority] || 'default';
}

// ─── Create / Edit Ticket Modal ───────────────────────────────────────────────
function TicketModal({
  isOpen,
  onClose,
  ticket,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
  onSave: (data: Partial<Ticket>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as TicketPriority,
    status: 'open' as TicketStatus,
    customerName: '',
    customerEmail: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (ticket) {
      setForm({
        subject: ticket.subject,
        description: ticket.description ?? '',
        priority: ticket.priority,
        status: ticket.status,
        customerName: ticket.customerName ?? '',
        customerEmail: ticket.customerEmail ?? '',
        tags: (ticket.tags || []).join(', '),
      });
    } else {
      setForm({ subject: '', description: '', priority: 'medium', status: 'open', customerName: '', customerEmail: '', tags: '' });
    }
  }, [ticket, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      addToast({ type: 'error', message: 'Subject is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        subject: form.subject,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        customerName: form.customerName || undefined,
        customerEmail: form.customerEmail || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket ? 'Edit Ticket' : 'New Ticket'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject *</label>
          <input className={inp} value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Cannot login to dashboard" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the issue..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
            <select className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</label>
            <input className={inp} value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Email</label>
            <input type="email" className={inp} value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} placeholder="jane@company.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
          <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="billing, urgent, mobile" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (ticket ? 'Save Changes' : 'Create Ticket')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────
function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onAddComment,
  commentBody,
  setCommentBody,
  isAddingComment,
}: {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: () => void;
  commentBody: string;
  setCommentBody: (v: string) => void;
  isAddingComment: boolean;
}) {
  const { formatDateTime } = useRegion();
  if (!ticket) return null;
  const comments = ticket.comments ?? [];
  const assignedUser = typeof ticket.assignedTo === 'object' && ticket.assignedTo ? ticket.assignedTo as any : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket.subject} description={ticket.ticketNumber} size="xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadge(ticket.status)} size="sm">{ticket.status}</Badge>
          <Badge variant={priorityBadge(ticket.priority)} size="sm">{ticket.priority}</Badge>
          {(ticket.tags || []).map(t => (
            <span key={t} className="text-xs px-2 py-1 rounded-md bg-muted/40 text-muted-foreground">{t}</span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p>
            <p className="font-medium text-foreground mt-0.5">{ticket.customerName || '—'}</p>
            {ticket.customerEmail && <p className="text-muted-foreground text-xs">{ticket.customerEmail}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</p>
            <p className="font-medium text-foreground mt-0.5">{assignedUser?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
            <p className="font-medium text-foreground mt-0.5">{formatDateTime(ticket.createdAt, { includeTime: false })}</p>
          </div>
        </div>

        {ticket.description && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap border border-border/50 rounded-lg p-3 bg-muted/20">{ticket.description}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
          </p>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No comments yet.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">{c.authorId.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</p>
                </div>
                {c.isInternal && <Badge variant="warning" size="sm" className="mb-1">Internal</Badge>}
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <textarea
            rows={2}
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={onAddComment}
              disabled={isAddingComment || !commentBody.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              {isAddingComment ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Tickets Page ─────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { tickets, isLoading, error, createTicket, updateTicket, addComment, deleteTicket } = useTickets({
    status: statusFilter,
    priority: priorityFilter,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) =>
      t.subject.toLowerCase().includes(q) ||
      t.ticketNumber.toLowerCase().includes(q) ||
      (t.customerName || '').toLowerCase().includes(q) ||
      (t.customerEmail || '').toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load tickets. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Ticket>) => {
    await createTicket(data);
    addToast({ type: 'success', message: 'Ticket created successfully.' });
  };

  const handleUpdate = async (data: Partial<Ticket>) => {
    if (!editTicket) return;
    await updateTicket(editTicket.id, data);
    addToast({ type: 'success', message: 'Ticket updated successfully.' });
  };

  const handleStatusChange = async (t: Ticket, status: string) => {
    try {
      await updateTicket(t.id, { status: status as TicketStatus });
      addToast({ type: 'success', message: `Ticket moved to ${status}.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update ticket status.' });
    }
  };

  const handleAddComment = async () => {
    if (!detailTicket || !commentBody.trim()) return;
    setIsAddingComment(true);
    try {
      const created = await addComment(detailTicket.id, commentBody.trim());
      setDetailTicket(prev => prev ? { ...prev, comments: [...(prev.comments ?? []), created] } : prev);
      setCommentBody('');
      addToast({ type: 'success', message: 'Comment added.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to add comment.' });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTicket(deleteId);
      addToast({ type: 'success', message: 'Ticket deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete ticket.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const chipCls = (active: boolean) =>
    `text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground'
    }`;

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage incoming support requests and their resolution</p>
        </div>
        <button
          onClick={() => { setEditTicket(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tickets..."
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
        <div className="flex items-center gap-1 text-muted-foreground">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </Card>

      {/* Filter chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status:</span>
          <button onClick={() => setStatusFilter(undefined)} className={chipCls(!statusFilter)}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? undefined : s)} className={chipCls(statusFilter === s)}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority:</span>
          <button onClick={() => setPriorityFilter(undefined)} className={chipCls(!priorityFilter)}>All</button>
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => setPriorityFilter(priorityFilter === p ? undefined : p)} className={chipCls(priorityFilter === p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load tickets. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Ticket</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Subject</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Assigned To</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Created</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No tickets found</td>
                </tr>
              ) : (
                filteredTickets.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{t.ticketNumber}</td>
                    <td className="px-4 py-3 text-foreground">
                      <button onClick={() => setDetailTicket(t)} className="text-left font-medium hover:text-primary transition-colors">{t.subject}</button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityBadge(t.priority)} size="sm">{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md bg-muted/40 border border-border/40 outline-none focus:border-primary/60 capitalize"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.customerName || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeof t.assignedTo === 'object' && t.assignedTo ? (t.assignedTo as any).name : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(t.createdAt, { includeTime: false })}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditTicket(t); setModalOpen(true); }}
                          title="Edit"
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditTicket(null); setDetailTicket(t); }}
                          title="View"
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          title="Delete"
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TicketModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTicket(null); }}
        ticket={editTicket}
        onSave={editTicket ? handleUpdate : handleCreate}
      />

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={detailTicket}
        isOpen={!!detailTicket}
        onClose={() => setDetailTicket(null)}
        onAddComment={handleAddComment}
        commentBody={commentBody}
        setCommentBody={setCommentBody}
        isAddingComment={isAddingComment}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Ticket" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this ticket? This action cannot be undone.</p>
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

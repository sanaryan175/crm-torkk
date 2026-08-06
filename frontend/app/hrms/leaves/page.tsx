'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Check, X as XIcon } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useLeaves, useEmployees } from '@/lib/hooks';
import type { Leave } from '@/lib/types';

const LEAVE_TYPES = ['casual', 'sick', 'paid', 'unpaid', 'maternity', 'paternity', 'bereavement', 'other'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const typeVariant = (t: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (t) {
    case 'sick': return 'error';
    case 'paid': return 'success';
    case 'unpaid': return 'warning';
    case 'maternity':
    case 'paternity': return 'primary';
    default: return 'info';
  }
};

const statusVariant = (s: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (s) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'pending': return 'warning';
    default: return 'default';
  }
};

// ─── Leave Request Modal ──────────────────────────────────────────────────────
function LeaveModal({
  isOpen,
  onClose,
  leave,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  leave?: Leave | null;
  onSave: (data: Partial<Leave>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { employees } = useEmployees();
  const [form, setForm] = useState({
    employeeId: '', type: 'casual', startDate: '', endDate: '', reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leave) {
      setForm({
        employeeId: leave.employeeId,
        type: leave.type || 'casual',
        startDate: String(leave.startDate).slice(0, 10),
        endDate: String(leave.endDate).slice(0, 10),
        reason: leave.reason ?? '',
      });
    } else {
      setForm({ employeeId: '', type: 'casual', startDate: '', endDate: '', reason: '' });
    }
  }, [leave, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) {
      addToast({ type: 'error', message: 'Employee, start date and end date are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        employeeId: form.employeeId,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save leave request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={leave ? 'Edit Leave Request' : 'Request Leave'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee *</label>
          <select className={inp} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required>
            <option value="">Select employee</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date *</label>
            <input type="date" className={inp} value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date *</label>
            <input type="date" className={inp} value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</label>
            <input className={inp} value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Family event" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (leave ? 'Save Changes' : 'Request Leave')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Leaves Page ──────────────────────────────────────────────────────────────
export default function LeavesPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { employees } = useEmployees();
  const { leaves, isLoading, error, createLeave, updateLeaveStatus, deleteLeave } = useLeaves();
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const employeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : null;
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return leaves;
    const q = searchQuery.toLowerCase();
    return leaves.filter((l) =>
      (employeeName(l.employeeId) || '').toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q) ||
      (l.reason || '').toLowerCase().includes(q)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaves, searchQuery, employees]);

  const leaveDays = (l: Leave) => {
    if (l.days != null) return l.days;
    const start = new Date(String(l.startDate).slice(0, 10)).getTime();
    const end = new Date(String(l.endDate).slice(0, 10)).getTime();
    if (isNaN(start) || isNaN(end)) return 0;
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  };

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load leaves. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Leave>) => {
    await createLeave(data);
    addToast({ type: 'success', message: 'Leave request created successfully.' });
  };

  const handleUpdate = async (data: Partial<Leave>) => {
    if (!editLeave) return;
    await createLeave(data);
    addToast({ type: 'success', message: 'Leave request updated.' });
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveStatus(id, status);
      addToast({ type: 'success', message: `Leave ${status}.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || `Failed to ${status} leave.` });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteLeave(deleteId);
      addToast({ type: 'success', message: 'Leave request deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete leave request.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leaves</h1>
          <p className="text-muted-foreground mt-1">Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => { setEditLeave(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search leaves..."
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
        <div className="text-center text-red-500 py-12">Failed to load leaves. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No leave requests found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or create a leave request</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Start</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">End</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Days</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <motion.tr
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{employeeName(l.employeeId) || l.employeeId}</td>
                  <td className="px-4 py-3">
                    <Badge variant={typeVariant(l.type)} size="sm">{label(l.type)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(l.status)} size="sm">{label(l.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(l.startDate, { includeTime: false })}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(l.endDate, { includeTime: false })}</td>
                  <td className="px-4 py-3 text-muted-foreground">{leaveDays(l)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{l.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {l.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatus(l.id, 'approved')}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatus(l.id, 'rejected')}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            title="Reject"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { setEditLeave(l); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit request"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(l.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete request"
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
      <LeaveModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditLeave(null); }}
        leave={editLeave}
        onSave={editLeave ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Leave Request" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this leave request? This action cannot be undone.</p>
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

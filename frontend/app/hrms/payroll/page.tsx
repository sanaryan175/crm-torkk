'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Trash2, Eye, Check } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { usePayroll, useEmployees } from '@/lib/hooks';
import type { PayrollRun, PayrollEntry } from '@/lib/types';

const RUN_STATUSES = ['draft', 'processed', 'approved', 'paid'];

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (s: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (s) {
    case 'draft': return 'default';
    case 'processed': return 'info';
    case 'approved': return 'warning';
    case 'paid': return 'success';
    default: return 'default';
  }
};

interface PayFormRow {
  basicPay: string;
  allowances: string;
  deductions: string;
  tax: string;
}

const emptyPay = (): PayFormRow => ({ basicPay: '', allowances: '', deductions: '', tax: '' });

// ─── Create Payroll Run Modal ─────────────────────────────────────────────────
function PayrollModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { periodStart: string; periodEnd: string; employees: { employeeId: string; basicPay?: number; allowances?: number; deductions?: number; tax?: number }[] }) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { employees } = useEmployees();
  const [form, setForm] = useState({ periodStart: '', periodEnd: '' });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pay, setPay] = useState<Record<string, PayFormRow>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ periodStart: '', periodEnd: '' });
      setSelected({});
      setPay({});
    }
  }, [isOpen]);

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    setPay(prev => ({ ...prev, [id]: prev[id] ?? emptyPay() }));
  };

  const setPayField = (id: string, k: keyof PayFormRow, v: string) => {
    setPay(prev => ({ ...prev, [id]: { ...(prev[id] ?? emptyPay()), [k]: v } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (!form.periodStart || !form.periodEnd) {
      addToast({ type: 'error', message: 'Period start and end are required.' });
      return;
    }
    if (ids.length === 0) {
      addToast({ type: 'error', message: 'Select at least one employee.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        employees: ids.map(id => {
          const p = pay[id] ?? emptyPay();
          return {
            employeeId: id,
            basicPay: p.basicPay ? parseFloat(p.basicPay) : undefined,
            allowances: p.allowances ? parseFloat(p.allowances) : undefined,
            deductions: p.deductions ? parseFloat(p.deductions) : undefined,
            tax: p.tax ? parseFloat(p.tax) : undefined,
          };
        }),
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to create payroll run.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Payroll Run" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period Start *</label>
            <input type="date" className={inp} value={form.periodStart} onChange={e => setForm(prev => ({ ...prev, periodStart: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period End *</label>
            <input type="date" className={inp} value={form.periodEnd} onChange={e => setForm(prev => ({ ...prev, periodEnd: e.target.value }))} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees *</label>
          <div className="border border-border/40 rounded-lg divide-y divide-border/40 max-h-64 overflow-y-auto">
            {employees.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">No employees found.</p>
            )}
            {employees.map(emp => (
              <div key={emp.id} className="p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selected[emp.id]}
                    onChange={() => toggle(emp.id)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">{emp.firstName} {emp.lastName}</span>
                </label>
                {selected[emp.id] && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-6">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Basic Pay</label>
                      <input type="number" min="0" className={inp} value={(pay[emp.id] ?? emptyPay()).basicPay} onChange={e => setPayField(emp.id, 'basicPay', e.target.value)} placeholder="5000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Allowances</label>
                      <input type="number" min="0" className={inp} value={(pay[emp.id] ?? emptyPay()).allowances} onChange={e => setPayField(emp.id, 'allowances', e.target.value)} placeholder="500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Deductions</label>
                      <input type="number" min="0" className={inp} value={(pay[emp.id] ?? emptyPay()).deductions} onChange={e => setPayField(emp.id, 'deductions', e.target.value)} placeholder="100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Tax</label>
                      <input type="number" min="0" className={inp} value={(pay[emp.id] ?? emptyPay()).tax} onChange={e => setPayField(emp.id, 'tax', e.target.value)} placeholder="400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Run'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Run Detail Modal ─────────────────────────────────────────────────────────
function RunDetailModal({
  run,
  isOpen,
  onClose,
}: {
  run: PayrollRun | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { employees } = useEmployees();
  const { formatMoney } = useRegion();
  if (!run) return null;

  const employeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  };

  const net = (en: PayrollEntry) =>
    en.netPay ?? (en.basicPay ?? 0) + (en.allowances ?? 0) - (en.deductions ?? 0) - (en.tax ?? 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payroll Run Details" size="xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-foreground">{formatMoney(run.totalAmount ?? 0)}</p>
          </div>
          <Badge variant={statusVariant(run.status)} size="md">{label(run.status)}</Badge>
        </div>
        {(run.entries ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No entries in this run.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Employee</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Basic Pay</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Allowances</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Deductions</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Tax</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {(run.entries ?? []).map(en => (
                  <tr key={en.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{employeeName(en.employeeId)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(en.basicPay ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(en.allowances ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(en.deductions ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(en.tax ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(net(en))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Payroll Page ─────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { runs, isLoading, error, createRun, updateRunStatus, deleteRun } = usePayroll();
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [detailRun, setDetailRun] = useState<PayrollRun | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = runs.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return `${String(r.periodStart).slice(0, 10)} ${String(r.periodEnd).slice(0, 10)} ${r.status}`.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load payroll runs. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: { periodStart: string; periodEnd: string; employees: { employeeId: string; basicPay?: number; allowances?: number; deductions?: number; tax?: number }[] }) => {
    await createRun(data);
    addToast({ type: 'success', message: 'Payroll run created successfully.' });
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateRunStatus(id, status);
      addToast({ type: 'success', message: `Payroll run marked as ${label(status)}.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update payroll status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteRun(deleteId);
      addToast({ type: 'success', message: 'Payroll run deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete payroll run.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">Create and manage payroll runs</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Run
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search payroll runs..."
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
        <div className="text-center text-red-500 py-12">Failed to load payroll runs. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No payroll runs found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or create a payroll run</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Processed At</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Entries</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((run, i) => (
                <motion.tr
                  key={run.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {formatDateTime(run.periodStart, { includeTime: false })} → {formatDateTime(run.periodEnd, { includeTime: false })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(run.status)} size="sm">{label(run.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(run.totalAmount ?? 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {run.processedAt ? formatDateTime(run.processedAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{run.entries?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDetailRun(run)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="View entries"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {RUN_STATUSES.filter(s => s !== run.status).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatus(run.id, s)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"
                          title={`Mark as ${label(s)}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(run.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete run"
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

      {/* Create Modal */}
      <PayrollModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />

      {/* Detail Modal */}
      <RunDetailModal run={detailRun} isOpen={!!detailRun} onClose={() => setDetailRun(null)} />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Payroll Run" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this payroll run? This action cannot be undone.</p>
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, CalendarCheck, CalendarX, Clock } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useAttendance, useEmployees } from '@/lib/hooks';
import type { Attendance } from '@/lib/types';

const ATTENDANCE_STATUSES = ['present', 'absent', 'half_day', 'late', 'holiday'];

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'present': return 'success';
    case 'absent': return 'error';
    case 'half_day': return 'warning';
    case 'late': return 'warning';
    case 'holiday': return 'info';
    default: return 'default';
  }
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ─── Mark Attendance Modal ────────────────────────────────────────────────────
function AttendanceModal({
  isOpen,
  onClose,
  record,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  record?: Attendance | null;
  onSave: (data: Partial<Attendance>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { employees } = useEmployees();
  const [form, setForm] = useState({
    employeeId: '', date: todayKey(), status: 'present',
    checkIn: '', checkOut: '', notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      const toTime = (v?: Date | string | null) => (v ? String(v).slice(11, 16) : '');
      setForm({
        employeeId: record.employeeId,
        date: String(record.date).slice(0, 10),
        status: record.status || 'present',
        checkIn: toTime(record.checkIn),
        checkOut: toTime(record.checkOut),
        notes: record.notes ?? '',
      });
    } else {
      setForm({ employeeId: '', date: todayKey(), status: 'present', checkIn: '', checkOut: '', notes: '' });
    }
  }, [record, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.date) {
      addToast({ type: 'error', message: 'Employee and date are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        employeeId: form.employeeId,
        date: form.date,
        status: form.status,
        checkIn: form.checkIn ? `${form.date}T${form.checkIn}` : undefined,
        checkOut: form.checkOut ? `${form.date}T${form.checkOut}` : undefined,
        notes: form.notes || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save attendance.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={record ? 'Edit Attendance' : 'Mark Attendance'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee *</label>
            <select className={inp} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required>
              <option value="">Select employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</label>
            <input type="date" className={inp} value={form.date} onChange={e => set('date', e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
            {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check In</label>
            <input type="time" className={inp} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check Out</label>
            <input type="time" className={inp} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (record ? 'Save Changes' : 'Mark Attendance')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Attendance Page ──────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { employees } = useEmployees();
  const { records, isLoading, error, createAttendance, updateAttendance, deleteAttendance } = useAttendance();
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const employeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : null;
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      (employeeName(r.employeeId) || '').toLowerCase().includes(q) ||
      String(r.date).toLowerCase().includes(q) ||
      (r.notes || '').toLowerCase().includes(q)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, searchQuery, employees]);

  const summary = useMemo(() => {
    const t = todayKey();
    const todays = records.filter(r => String(r.date).slice(0, 10) === t);
    const present = todays.filter(r => r.status === 'present' || r.status === 'late').length;
    const absent = todays.filter(r => r.status === 'absent').length;
    const withHours = todays.filter(r => r.hours != null);
    const avgHours = withHours.length
      ? withHours.reduce((sum, r) => sum + (r.hours ?? 0), 0) / withHours.length
      : 0;
    return { present, absent, avgHours };
  }, [records]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load attendance. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Attendance>) => {
    await createAttendance(data);
    addToast({ type: 'success', message: 'Attendance recorded successfully.' });
  };

  const handleUpdate = async (data: Partial<Attendance>) => {
    if (!editRecord) return;
    await updateAttendance(editRecord.id, data);
    addToast({ type: 'success', message: 'Attendance updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteAttendance(deleteId);
      addToast({ type: 'success', message: 'Attendance record deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete attendance record.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Track employee attendance and work hours</p>
        </div>
        <button
          onClick={() => { setEditRecord(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Mark Attendance
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Present Today</p>
            <p className="text-2xl font-bold text-foreground">{summary.present}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <CalendarX className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Absent Today</p>
            <p className="text-2xl font-bold text-foreground">{summary.absent}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Hours Today</p>
            <p className="text-2xl font-bold text-foreground">{summary.avgHours.toFixed(1)}</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search attendance..."
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
        <div className="text-center text-red-500 py-12">Failed to load attendance. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No attendance records found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or mark attendance</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Check In</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Check Out</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Hours</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Overtime</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Notes</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{employeeName(r.employeeId) || r.employeeId}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(r.date, { includeTime: false })}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)} size="sm">{label(r.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.checkIn ? formatDateTime(r.checkIn, { includeTime: true }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.checkOut ? formatDateTime(r.checkOut, { includeTime: true }) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.hours != null ? `${r.hours}h` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.overtime != null ? `${r.overtime}h` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{r.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditRecord(r); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit record"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark / Edit Modal */}
      <AttendanceModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditRecord(null); }}
        record={editRecord}
        onSave={editRecord ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Attendance Record" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
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

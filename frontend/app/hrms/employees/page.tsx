'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Users } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useEmployees, useDepartments, useTeamMembers } from '@/lib/hooks';
import type { Employee } from '@/lib/types';

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'intern', 'freelance'];
const EMPLOYEE_STATUSES = ['active', 'inactive', 'on_leave', 'terminated'];

const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const statusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'active': return 'success';
    case 'on_leave': return 'warning';
    case 'terminated': return 'error';
    case 'inactive': return 'default';
    default: return 'info';
  }
};

// ─── New / Edit Employee Modal ────────────────────────────────────────────────
function EmployeeModal({
  isOpen,
  onClose,
  employee,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSave: (data: Partial<Employee>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { departments } = useDepartments();
  const { members } = useTeamMembers();
  const { employees } = useEmployees();
  const [form, setForm] = useState({
    userId: '', employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
    departmentId: '', designation: '', employmentType: 'full_time', joinDate: '',
    status: 'active', managerId: '', salary: '', currency: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        userId: employee.userId ?? '',
        employeeCode: employee.employeeCode ?? '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone ?? '',
        departmentId: employee.departmentId ?? '',
        designation: employee.designation ?? '',
        employmentType: employee.employmentType ?? 'full_time',
        joinDate: employee.joinDate ? String(employee.joinDate).slice(0, 10) : '',
        status: employee.status || 'active',
        managerId: employee.managerId ?? '',
        salary: employee.salary != null ? String(employee.salary) : '',
        currency: employee.currency ?? '',
      });
    } else {
      setForm({
        userId: '', employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
        departmentId: '', designation: '', employmentType: 'full_time', joinDate: '',
        status: 'active', managerId: '', salary: '', currency: '',
      });
    }
  }, [employee, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      addToast({ type: 'error', message: 'First name, last name and email are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        userId: form.userId || undefined,
        employeeCode: form.employeeCode || undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        departmentId: form.departmentId || undefined,
        designation: form.designation || undefined,
        employmentType: form.employmentType,
        joinDate: form.joinDate || undefined,
        status: form.status,
        managerId: form.managerId || undefined,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        currency: form.currency || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save employee.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'New Employee'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name *</label>
            <input className={inp} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Sarah" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name *</label>
            <input className={inp} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Chen" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
            <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="sarah@company.com" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee Code</label>
            <input className={inp} value={form.employeeCode} onChange={e => set('employeeCode', e.target.value)} placeholder="EMP-001" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Account</label>
            <select className={inp} value={form.userId} onChange={e => set('userId', e.target.value)}>
              <option value="">No user account</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
            <select className={inp} value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
              <option value="">No department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Designation</label>
            <input className={inp} value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Software Engineer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employment Type</label>
            <select className={inp} value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {EMPLOYEE_STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join Date</label>
            <input type="date" className={inp} value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager</label>
            <select className={inp} value={form.managerId} onChange={e => set('managerId', e.target.value)}>
              <option value="">No manager</option>
              {employees
                .filter(emp => emp.id !== employee?.id)
                .map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary</label>
            <input type="number" min="0" className={inp} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="75000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
            <input className={inp} value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Employees Page ───────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const { addToast } = useUI();
  const { formatDateTime, formatMoney } = useRegion();
  const { departments } = useDepartments();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const { employees, isLoading, error, createEmployee, updateEmployee, deleteEmployee } = useEmployees({
    departmentId: deptFilter ?? undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.employeeCode || '').toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.designation || '').toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load employees. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Employee>) => {
    await createEmployee(data);
    addToast({ type: 'success', message: 'Employee created successfully.' });
  };

  const handleUpdate = async (data: Partial<Employee>) => {
    if (!editEmployee) return;
    await updateEmployee(editEmployee.id, data);
    addToast({ type: 'success', message: 'Employee updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteId);
      addToast({ type: 'success', message: 'Employee deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete employee.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your workforce and HR records</p>
        </div>
        <button
          onClick={() => { setEditEmployee(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Employee
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search employees..."
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
        <div className="flex items-center gap-1 flex-wrap">
          <Users className="w-4 h-4 text-muted-foreground mr-1 hidden sm:block" />
          <button
            onClick={() => setDeptFilter(null)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              deptFilter === null ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeptFilter(deptFilter === d.id ? null : d.id)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                deptFilter === d.id ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </Card>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load employees. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No employees found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or create a new employee</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Designation</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Department</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Join Date</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Salary</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.employeeCode || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.designation || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.employmentType ? label(emp.employmentType) : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(emp.status)} size="sm">{label(emp.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {emp.joinDate ? formatDateTime(emp.joinDate, { includeTime: false }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {emp.salary != null ? formatMoney(emp.salary) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditEmployee(emp); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit employee"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete employee"
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

      {/* Create / Edit Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditEmployee(null); }}
        employee={editEmployee}
        onSave={editEmployee ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Employee" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
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

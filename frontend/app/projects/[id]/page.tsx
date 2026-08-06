'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Trash2, CheckCircle2, Calendar, Coins, User, Users, Flag, ListTodo, Clock } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useProjectTasks, useTeamMembers, triggerRefresh } from '@/lib/hooks';
import { apiFetch } from '@/lib/api';
import { useUI, useRegion } from '@/lib/context';
import type { Project, ProjectStatus, ProjectMilestone, TaskStatus } from '@/lib/types';

const PROJECT_STATUS_BADGE: Record<ProjectStatus, 'default' | 'primary' | 'success' | 'warning'> = {
  planning: 'default',
  active: 'success',
  on_hold: 'warning',
  completed: 'primary',
  cancelled: 'default',
};

const TASK_STATUS_BADGE: Record<TaskStatus, 'default' | 'info' | 'warning' | 'success'> = {
  todo: 'default',
  in_progress: 'info',
  in_review: 'warning',
  done: 'success',
};

const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function projectStatusBadge(status: string) {
  return PROJECT_STATUS_BADGE[status as ProjectStatus] || 'default';
}

function taskStatusBadge(status: string) {
  return TASK_STATUS_BADGE[status as TaskStatus] || 'default';
}

// ─── Add Milestone Modal ──────────────────────────────────────────────────────
function MilestoneModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; dueDate?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) setForm({ name: '', dueDate: '' });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ type: 'error', message: 'Name is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({ name: form.name, dueDate: form.dueDate || undefined });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save milestone.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Milestone" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
          <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Phase 1 complete" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</label>
          <input type="date" className={inp} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Add Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────
function MemberModal({
  isOpen,
  onClose,
  onSave,
  members,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { userId: string; role?: string }) => Promise<void>;
  members: { id: string; name: string }[];
}) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) { setUserId(''); setRole(''); }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      addToast({ type: 'error', message: 'Select a team member.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({ userId, role: role || undefined });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to add member.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Member *</label>
          <select className={inp} value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">Select a member...</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
          <input className={inp} value={role} onChange={e => setRole(e.target.value)} placeholder="Developer, Designer..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function TaskModal({
  isOpen,
  onClose,
  onSave,
  members,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  members: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) setForm({ title: '', description: '', priority: 'medium', status: 'todo', assigneeId: '', dueDate: '', estimatedHours: '' });
  }, [isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast({ type: 'error', message: 'Title is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        assigneeId: form.assigneeId || undefined,
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save task.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Design landing page" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Task details..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
            <select className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
            <select className={inp} value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</label>
            <input type="date" className={inp} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Hours</label>
          <input type="number" min="0" step="0.5" className={inp} value={form.estimatedHours} onChange={e => set('estimatedHours', e.target.value)} placeholder="8" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Project Detail Page ──────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();
  const { addToast } = useUI();
  const { formatMoney, formatDateTime } = useRegion();
  const { members } = useTeamMembers();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus } = useProjectTasks({ projectId: id });

  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await apiFetch(`/projects/${id}`);
      setProject(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load project. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const afterMutation = async () => {
    await loadProject();
    triggerRefresh('projects');
  };

  const handleAddMilestone = async (data: { name: string; dueDate?: string }) => {
    await apiFetch(`/projects/${id}/milestones`, { method: 'POST', body: JSON.stringify(data) });
    await afterMutation();
    addToast({ type: 'success', message: 'Milestone added.' });
  };

  const handleCompleteMilestone = async (milestone: ProjectMilestone) => {
    try {
      await apiFetch(`/projects/${id}/milestones/${milestone.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) });
      await afterMutation();
      addToast({ type: 'success', message: 'Milestone marked complete.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update milestone.' });
    }
  };

  const handleDeleteMilestone = async (milestone: ProjectMilestone) => {
    try {
      await apiFetch(`/projects/${id}/milestones/${milestone.id}`, { method: 'DELETE' });
      await afterMutation();
      addToast({ type: 'success', message: 'Milestone deleted.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete milestone.' });
    }
  };

  const handleAddMember = async (data: { userId: string; role?: string }) => {
    await apiFetch(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(data) });
    await afterMutation();
    addToast({ type: 'success', message: 'Member added.' });
  };

  const handleCreateTask = async (data: any) => {
    await createTask({ ...data, projectId: id });
    addToast({ type: 'success', message: 'Task created.' });
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      addToast({ type: 'success', message: `Task moved to ${status.replace('_', ' ')}.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update task status.' });
    }
  };

  const memberName = (m: any) => {
    if (!m) return '—';
    if (m.user?.name) return m.user.name;
    if (m.name) return m.name;
    return m.userId ? `Member ${m.userId.slice(0, 8)}` : '—';
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  if (error) {
    return (
      <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="text-center text-red-500 py-12">Failed to load project. Please verify backend is running.</div>
      </motion.div>
    );
  }

  if (isLoading || !project) {
    return (
      <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {project.code && <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">{project.code}</span>}
            <Badge variant={projectStatusBadge(project.status)} size="sm">{project.status.replace('_', ' ')}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-2">{project.name}</h1>
        </div>
        <div className="w-full sm:w-64 space-y-1.5 self-start sm:self-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} />
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Overview</h2>
            {project.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                <p className="font-medium text-foreground mt-0.5">{project.startDate ? formatDateTime(project.startDate, { includeTime: false }) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">End Date</p>
                <p className="font-medium text-foreground mt-0.5">{project.endDate ? formatDateTime(project.endDate, { includeTime: false }) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Budget</p>
                <p className="font-medium text-foreground mt-0.5 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-muted-foreground" /> {project.budget != null ? formatMoney(project.budget) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Manager</p>
                <p className="font-medium text-foreground mt-0.5 flex items-center gap-1"><User className="w-3.5 h-3.5 text-muted-foreground" /> {typeof project.manager === 'object' && project.manager?.name ? project.manager.name : 'Unassigned'}</p>
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Flag className="w-4 h-4 text-muted-foreground" /> Milestones</h2>
              <button onClick={() => setMilestoneOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {(project.milestones ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No milestones yet.</p>
            ) : (
              <div className="space-y-2">
                {(project.milestones ?? []).map((m) => {
                  const done = m.status === 'completed';
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 border border-border/50 rounded-lg p-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{m.name}</p>
                          {m.dueDate && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDateTime(m.dueDate, { includeTime: false })}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!done && (
                          <button
                            onClick={() => handleCompleteMilestone(m)}
                            className="p-1.5 rounded text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMilestone(m)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Tasks */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><ListTodo className="w-4 h-4 text-muted-foreground" /> Tasks ({tasks.length})</h2>
              <button onClick={() => setTaskOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
            {tasksLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="border border-border/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md bg-muted/40 border border-border/40 outline-none focus:border-primary/60 capitalize flex-shrink-0"
                      >
                        {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <Badge
                        variant={t.priority === 'urgent' || t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {typeof t.assignedTo === 'object' && t.assignedTo ? (t.assignedTo as any).name : 'Unassigned'}</span>
                      {t.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(t.dueDate, { includeTime: false })}</span>}
                      {t.estimatedHours != null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.estimatedHours}h</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Members sidebar */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Members</h2>
            <button onClick={() => setMemberOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {(project.members ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {(project.members ?? []).map((m: any, i: number) => (
                <div key={m?.id ?? i} className="flex items-center justify-between gap-3 border border-border/50 rounded-lg p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {(memberName(m) || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{memberName(m)}</p>
                      {m?.role && <p className="text-xs text-muted-foreground">{m.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <MilestoneModal isOpen={milestoneOpen} onClose={() => setMilestoneOpen(false)} onSave={handleAddMilestone} />
      <MemberModal isOpen={memberOpen} onClose={() => setMemberOpen(false)} onSave={handleAddMember} members={members} />
      <TaskModal isOpen={taskOpen} onClose={() => setTaskOpen(false)} onSave={handleCreateTask} members={members} />

      {/* hidden helper to keep inp class referenced */}
      <input className={inp} hidden readOnly />
    </motion.div>
  );
}

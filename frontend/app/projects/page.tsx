'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Search, X, Trash2, Pencil, FolderKanban, ListTodo, Calendar, Coins, User, Layers } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useProjects, useProjectTasks, useTeamMembers } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { Project, ProjectStatus, TaskStatus } from '@/lib/types';

const STATUS_BADGE: Record<ProjectStatus, 'default' | 'primary' | 'success' | 'warning'> = {
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

function projectStatusBadge(status: string) {
  return STATUS_BADGE[status as ProjectStatus] || 'default';
}

function taskStatusBadge(status: string) {
  return TASK_STATUS_BADGE[status as TaskStatus] || 'default';
}

const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];

// ─── New Project Modal ────────────────────────────────────────────────────────
function ProjectModal({
  isOpen,
  onClose,
  project,
  onSave,
  members,
}: {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (data: Partial<Project>) => Promise<void>;
  members: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'planning' as ProjectStatus,
    startDate: '',
    endDate: '',
    budget: '',
    managerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        code: project.code ?? '',
        description: project.description ?? '',
        status: project.status,
        startDate: project.startDate ? String(project.startDate).slice(0, 10) : '',
        endDate: project.endDate ? String(project.endDate).slice(0, 10) : '',
        budget: project.budget != null ? String(project.budget) : '',
        managerId: (typeof project.manager === 'object' && project.manager?.id) ? project.manager.id : '',
      });
    } else {
      setForm({ name: '', code: '', description: '', status: 'planning', startDate: '', endDate: '', budget: '', managerId: '' });
    }
  }, [project, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ type: 'error', message: 'Name is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
         name: form.name,
         code: form.code.trim() || undefined,
         description: form.description || undefined,
         status: form.status,
         startDate: form.startDate || undefined,
         endDate: form.endDate || undefined,
         budget: form.budget ? Number(form.budget) : undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save project.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'New Project'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Website Redesign" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</label>
            <input className={inp} value={form.code} onChange={e => set('code', e.target.value)} placeholder="WR-2026" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Project overview..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager</label>
            <select className={inp} value={form.managerId} onChange={e => set('managerId', e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <input type="date" className={inp} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
            <input type="date" className={inp} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</label>
          <input type="number" min="0" step="0.01" className={inp} value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="50000" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (project ? 'Save Changes' : 'Create Project')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Projects Page ────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'projects' | 'tasks'>('projects');
  const { addToast } = useUI();
  const { formatMoney } = useRegion();
  const { members } = useTeamMembers();
  const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
  const { tasks, createTask, updateTaskStatus } = useProjectTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load projects. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Project>) => {
    await createProject(data);
    addToast({ type: 'success', message: 'Project created successfully.' });
  };

  const handleUpdate = async (data: Partial<Project>) => {
    if (!editProject) return;
    await updateProject(editProject.id, data);
    addToast({ type: 'success', message: 'Project updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteId);
      addToast({ type: 'success', message: 'Project deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete project.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      addToast({ type: 'success', message: `Task moved to ${status.replace('_', ' ')}.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update task status.' });
    }
  };

  const projectName = (projectId: string) => projects.find((p) => p.id === projectId)?.name || '—';

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Plan, track, and manage your team's work</p>
        </div>
        <button
          onClick={() => { setEditProject(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search projects..."
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
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setView('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'projects' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> Projects
          </button>
          <button
            onClick={() => setView('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'tasks' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListTodo className="w-4 h-4" /> Tasks
          </button>
        </div>
      </Card>

      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load projects. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : view === 'projects' ? (
        filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card hoverable className="h-full flex flex-col gap-4" onClick={() => router.push(`/projects/${p.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {p.code && <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">{p.code}</span>}
                        <Badge variant={projectStatusBadge(p.status)} size="sm">{p.status.replace('_', ' ')}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mt-2 truncate">{p.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditProject(p); setModalOpen(true); }}
                        title="Edit"
                        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                        title="Delete"
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{p.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> {p.budget != null ? formatMoney(p.budget) : '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {typeof p.manager === 'object' && p.manager?.name ? p.manager.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {p._count?.tasks ?? 0} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {p.milestones?.length ?? 0} milestones
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Project</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No tasks found</td>
                </tr>
              ) : (
                tasks.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{t.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{projectName(t.projectId)}</td>
                    <td className="px-4 py-3 capitalize">
                      <Badge
                        variant={t.priority === 'urgent' || t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md bg-muted/40 border border-border/40 outline-none focus:border-primary/60 capitalize"
                      >
                        {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeof t.assignedTo === 'object' && t.assignedTo ? (t.assignedTo as any).name : '—'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditProject(null); }}
        project={editProject}
        onSave={editProject ? handleUpdate : handleCreate}
        members={members}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
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

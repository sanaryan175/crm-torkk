'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Megaphone } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useAnnouncements } from '@/lib/hooks';
import type { Announcement } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['draft', 'published', 'archived'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'info' => {
  if (s === 'published') return 'success';
  if (s === 'archived') return 'info';
  return 'default';
};

function AnnouncementModal({ isOpen, onClose, announcement, onSave }: {
  isOpen: boolean; onClose: () => void; announcement: Announcement | null;
  onSave: (d: Partial<Announcement>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', content: '', status: 'draft', publishedAt: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (announcement) {
      setForm({ title: announcement.title, content: announcement.content ?? '', status: announcement.status, publishedAt: announcement.publishedAt ? String(announcement.publishedAt).slice(0, 16) : '' });
    } else {
      setForm({ title: '', content: '', status: 'draft', publishedAt: '' });
    }
  }, [announcement, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, content: form.content || undefined, status: form.status, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={announcement ? 'Edit Announcement' : 'New Announcement'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Company holiday schedule" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
          <textarea className={`${inp} resize-none`} rows={5} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Announcement details..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publish At</label>
            <input type="datetime-local" className={inp} value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : announcement ? 'Save Changes' : 'Create Announcement'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AnnouncementsPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { announcements, isLoading, error, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load announcements.' }); }, [error]);

  const filtered = useMemo(() => {
    if (!search.trim()) return announcements;
    const q = search.toLowerCase();
    return announcements.filter(a => a.title.toLowerCase().includes(q) || (a.content ?? '').toLowerCase().includes(q));
  }, [announcements, search]);

  const handleSave = async (d: Partial<Announcement>) => {
    if (editAnnouncement) { await updateAnnouncement(editAnnouncement.id, d); addToast({ type: 'success', message: 'Announcement updated.' }); }
    else { await createAnnouncement(d); addToast({ type: 'success', message: 'Announcement created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteAnnouncement(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Broadcast important updates to your team</p>
        </div>
        <button onClick={() => { setEditAnnouncement(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No announcements found</p></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <Badge variant={statusVariant(a.status)} size="sm">{label(a.status)}</Badge>
                      </div>
                      {a.content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {a.publishedAt ? `Published ${formatDateTime(a.publishedAt, { includeTime: false })}` : `Created ${formatDateTime(a.createdAt, { includeTime: false })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditAnnouncement(a); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnnouncementModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditAnnouncement(null); }} announcement={editAnnouncement} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Announcement" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this announcement permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

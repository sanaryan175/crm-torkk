'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, CalendarDays } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useCalendarEvents } from '@/lib/hooks';
import type { CalendarEvent } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const EVENT_TYPES = ['meeting', 'call', 'task', 'reminder', 'other'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const typeVariant = (t: string): 'default' | 'primary' | 'info' | 'warning' => {
  if (t === 'meeting') return 'primary';
  if (t === 'call') return 'info';
  if (t === 'task') return 'warning';
  return 'default';
};

function toLocalDT(d: Date | string) {
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function EventModal({ isOpen, onClose, event, onSave }: {
  isOpen: boolean; onClose: () => void; event: CalendarEvent | null;
  onSave: (d: Partial<CalendarEvent>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', allDay: false, type: 'meeting', location: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (event) {
      setForm({ title: event.title, description: event.description ?? '', startDate: toLocalDT(event.startDate), endDate: event.endDate ? toLocalDT(event.endDate) : '', allDay: event.allDay ?? false, type: event.type, location: event.location ?? '' });
    } else {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      setForm({ title: '', description: '', startDate: toLocalDT(now), endDate: '', allDay: false, type: 'meeting', location: '' });
    }
  }, [event, isOpen]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) { addToast({ type: 'error', message: 'Title and start date are required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ title: form.title, description: form.description || undefined, startDate: new Date(form.startDate).toISOString(), endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined, allDay: form.allDay, type: form.type, location: form.location || undefined });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'New Event'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Team standup" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date *</label>
            <input type="datetime-local" className={inp} value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
            <input type="datetime-local" className={inp} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
            <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>{EVENT_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}</select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
            <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Zoom / Conference Room A" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.allDay} onChange={e => set('allDay', e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground">All day event</span>
        </label>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : event ? 'Save Changes' : 'Create Event'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function CalendarPage() {
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load events.' }); }, [error]);

  // Sort upcoming first
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [events]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(e => e.title.toLowerCase().includes(q) || (e.location ?? '').toLowerCase().includes(q));
  }, [sorted, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};
    filtered.forEach(ev => {
      const dateKey = new Date(ev.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(ev);
    });
    return groups;
  }, [filtered]);

  const handleSave = async (d: Partial<CalendarEvent>) => {
    if (editEvent) { await updateEvent(editEvent.id, d); addToast({ type: 'success', message: 'Event updated.' }); }
    else { await createEvent(d); addToast({ type: 'success', message: 'Event created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteEvent(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage meetings, tasks and reminders</p>
        </div>
        <button onClick={() => { setEditEvent(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No events found</p></Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 pl-1">{dateKey}</h2>
              <div className="space-y-2">
                {dayEvents.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-1 h-12 bg-primary rounded-full flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-foreground">{ev.title}</h3>
                              <Badge variant={typeVariant(ev.type)} size="sm">{label(ev.type)}</Badge>
                              {ev.allDay && <Badge variant="default" size="sm">All day</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ev.allDay ? 'All day' : formatDateTime(ev.startDate)}
                              {ev.endDate && !ev.allDay && ` → ${formatDateTime(ev.endDate)}`}
                              {ev.location && ` · ${ev.location}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => { setEditEvent(ev); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(ev.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <EventModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditEvent(null); }} event={editEvent} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Event" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this event permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

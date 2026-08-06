'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Warehouse } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useWarehouses, useTeamMembers } from '@/lib/hooks';
import type { Warehouse as WarehouseType } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

function WarehouseModal({ isOpen, onClose, warehouse, onSave }: {
  isOpen: boolean; onClose: () => void; warehouse: WarehouseType | null;
  onSave: (d: Partial<WarehouseType>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { members } = useTeamMembers();
  const [form, setForm] = useState({ name: '', code: '', address: '', managerId: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (warehouse) setForm({ name: warehouse.name, code: warehouse.code ?? '', address: warehouse.address ?? '', managerId: warehouse.managerId ?? '', isActive: warehouse.isActive ?? true });
    else setForm({ name: '', code: '', address: '', managerId: '', isActive: true });
  }, [warehouse, isOpen]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, code: form.code || undefined, address: form.address || undefined, managerId: form.managerId || undefined, isActive: form.isActive });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={warehouse ? 'Edit Warehouse' : 'New Warehouse'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Main Warehouse" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</label>
            <input className={inp} value={form.code} onChange={e => set('code', e.target.value)} placeholder="WH-001" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</label>
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Industrial Ave" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager</label>
          <select className={inp} value={form.managerId} onChange={e => set('managerId', e.target.value)}>
            <option value="">No manager</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground">Active</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : warehouse ? 'Save Changes' : 'Create Warehouse'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function WarehousesPage() {
  const { addToast } = useUI();
  const { members } = useTeamMembers();
  const { warehouses, isLoading, error, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<WarehouseType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load warehouses.' }); }, [error]);

  const memberMap = useMemo(() => { const m: Record<string, string> = {}; members.forEach(u => { m[u.id] = u.name; }); return m; }, [members]);

  const filtered = useMemo(() => {
    if (!search.trim()) return warehouses;
    const q = search.toLowerCase();
    return warehouses.filter(w => w.name.toLowerCase().includes(q) || (w.code ?? '').toLowerCase().includes(q));
  }, [warehouses, search]);

  const handleSave = async (d: Partial<WarehouseType>) => {
    if (editWarehouse) { await updateWarehouse(editWarehouse.id, d); addToast({ type: 'success', message: 'Warehouse updated.' }); }
    else { await createWarehouse(d); addToast({ type: 'success', message: 'Warehouse created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteWarehouse(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground mt-1">Manage storage locations and warehouses</p>
        </div>
        <button onClick={() => { setEditWarehouse(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Warehouse
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search warehouses..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No warehouses found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Address</th>
                <th className="text-left px-4 py-3 font-semibold">Manager</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{w.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{w.code || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.address || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.managerId ? (memberMap[w.managerId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={w.isActive ? 'success' : 'default'} size="sm">{w.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditWarehouse(w); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(w.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WarehouseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditWarehouse(null); }} warehouse={editWarehouse} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Warehouse" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this warehouse permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

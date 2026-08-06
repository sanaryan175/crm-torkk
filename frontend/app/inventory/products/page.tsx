'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Package } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI, useRegion } from '@/lib/context';
import { useProducts, useProductCategories } from '@/lib/hooks';
import type { Product } from '@/lib/types';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';
const STATUSES = ['active', 'inactive', 'out_of_stock'];
const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const statusVariant = (s: string): 'default' | 'success' | 'error' => {
  if (s === 'active') return 'success';
  if (s === 'out_of_stock') return 'error';
  return 'default';
};

function ProductModal({ isOpen, onClose, product, onSave }: {
  isOpen: boolean; onClose: () => void; product: Product | null;
  onSave: (d: Partial<Product>) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { categories } = useProductCategories();
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', categoryId: '', description: '', unit: '', price: '', cost: '', taxRate: '', reorderLevel: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (product) setForm({ name: product.name, sku: product.sku ?? '', barcode: product.barcode ?? '', categoryId: product.categoryId ?? '', description: product.description ?? '', unit: product.unit ?? '', price: String(product.price), cost: product.cost != null ? String(product.cost) : '', taxRate: product.taxRate != null ? String(product.taxRate) : '', reorderLevel: product.reorderLevel != null ? String(product.reorderLevel) : '', status: product.status });
    else setForm({ name: '', sku: '', barcode: '', categoryId: '', description: '', unit: '', price: '', cost: '', taxRate: '', reorderLevel: '', status: 'active' });
  }, [product, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast({ type: 'error', message: 'Name is required.' }); return; }
    setSubmitting(true);
    try {
      await onSave({ name: form.name, sku: form.sku || undefined, barcode: form.barcode || undefined, categoryId: form.categoryId || undefined, description: form.description || undefined, unit: form.unit || undefined, price: parseFloat(form.price) || 0, cost: form.cost ? parseFloat(form.cost) : undefined, taxRate: form.taxRate ? parseFloat(form.taxRate) : undefined, reorderLevel: form.reorderLevel ? parseInt(form.reorderLevel) : undefined, status: form.status });
      onClose();
    } catch (err: any) { addToast({ type: 'error', message: err.message || 'Failed.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'New Product'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</label>
            <input className={inp} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Barcode</label>
            <input className={inp} value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="1234567890" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <select className={inp} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price *</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.price} onChange={e => set('price', e.target.value)} placeholder="99.99" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="50.00" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Rate %</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.taxRate} onChange={e => set('taxRate', e.target.value)} placeholder="10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit</label>
            <input className={inp} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="pcs / kg / box" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reorder Level</label>
            <input type="number" min="0" className={inp} value={form.reorderLevel} onChange={e => set('reorderLevel', e.target.value)} placeholder="10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProductsPage() {
  const { addToast } = useUI();
  const { formatMoney } = useRegion();
  const { products, isLoading, error, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useProductCategories();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (error) addToast({ type: 'error', message: 'Failed to load products.' }); }, [error]);

  const catMap = useMemo(() => { const m: Record<string, string> = {}; categories.forEach(c => { m[c.id] = c.name; }); return m; }, [categories]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q) || (p.barcode ?? '').includes(q));
  }, [products, search]);

  const handleSave = async (d: Partial<Product>) => {
    if (editProduct) { await updateProduct(editProduct.id, d); addToast({ type: 'success', message: 'Product updated.' }); }
    else { await createProduct(d); addToast({ type: 'success', message: 'Product created.' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteProduct(deleteId); addToast({ type: 'success', message: 'Deleted.' }); setDeleteId(null); }
    catch (err: any) { addToast({ type: 'error', message: err.message || 'Delete failed.' }); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage product catalog and inventory</p>
        </div>
        <button onClick={() => { setEditProduct(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><p className="text-muted-foreground">No products found</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">SKU</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Price</th>
                <th className="text-right px-4 py-3 font-semibold">Cost</th>
                <th className="text-right px-4 py-3 font-semibold">Stock</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categoryId ? (catMap[p.categoryId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.cost != null ? formatMoney(p.cost) : '—'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.stock ?? 0}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(p.status)} size="sm">{label(p.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditProduct(p); setModalOpen(true); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProduct(null); }} product={editProduct} onSave={handleSave} />
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete this product permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}

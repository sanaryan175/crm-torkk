'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Eye, Package } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useSalesOrders } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { SalesOrder, SalesOrderStatus } from '@/lib/types';

const ORDER_STATUSES: SalesOrderStatus[] = ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  draft: 'Draft', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};
const STATUS_VARIANTS: Record<SalesOrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error',
};

function toDateInput(d: Date | string) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── New / Edit Order Modal ───────────────────────────────────────────────────
function OrderModal({
  isOpen,
  onClose,
  order,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  order?: SalesOrder | null;
  onSave: (data: any) => Promise<void>;
}) {
  const { addToast } = useUI();
  const { baseCurrency } = useRegion();
  const [form, setForm] = useState({
    orderDate: '', deliveryDate: '', currency: baseCurrency, taxRate: '0', discount: '0', notes: '',
  });
  const [items, setItems] = useState<{ name: string; quantity: string; unitPrice: string; taxRate: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (order) {
      setForm({
        orderDate: toDateInput(order.orderDate),
        deliveryDate: order.deliveryDate ? toDateInput(order.deliveryDate) : '',
        currency: order.currency,
        taxRate: String(order.taxRate ?? 0),
        discount: String(order.discount ?? 0),
        notes: order.notes ?? '',
      });
      setItems((order.items || []).map((it) => ({
        name: it.name,
        quantity: String(it.quantity),
        unitPrice: String(it.unitPrice),
        taxRate: String(it.taxRate),
      })));
    } else {
      setForm({ orderDate: today(), deliveryDate: '', currency: baseCurrency, taxRate: '0', discount: '0', notes: '' });
      setItems([{ name: '', quantity: '1', unitPrice: '0', taxRate: '0' }]);
    }
  }, [order, isOpen, baseCurrency]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const setItem = (i: number, k: 'name' | 'quantity' | 'unitPrice' | 'taxRate', v: string) =>
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addItem = () => setItems(prev => [...prev, { name: '', quantity: '1', unitPrice: '0', taxRate: '0' }]);
  const removeItem = (i: number) => setItems(prev => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.name.trim());
    if (!form.orderDate || validItems.length === 0) {
      addToast({ type: 'error', message: 'Order date and at least one item are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        orderDate: form.orderDate,
        deliveryDate: form.deliveryDate || undefined,
        currency: form.currency || baseCurrency,
        taxRate: parseFloat(form.taxRate) || 0,
        discount: parseFloat(form.discount) || 0,
        notes: form.notes || undefined,
        items: validItems.map((it) => {
          const quantity = parseFloat(it.quantity) || 0;
          const unitPrice = parseFloat(it.unitPrice) || 0;
          return {
            name: it.name,
            quantity,
            unitPrice,
            taxRate: parseFloat(it.taxRate) || 0,
            lineTotal: quantity * unitPrice,
          };
        }),
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order ? 'Edit Order' : 'New Order'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Date *</label>
            <input type="date" className={inp} value={form.orderDate} onChange={e => set('orderDate', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Date</label>
            <input type="date" className={inp} value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
            <input className={inp} value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Rate (%)</label>
            <input type="number" step="any" min="0" className={inp} value={form.taxRate} onChange={e => set('taxRate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount</label>
            <input type="number" step="any" min="0" className={inp} value={form.discount} onChange={e => set('discount', e.target.value)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items *</label>
            <button type="button" onClick={addItem} className="text-xs text-primary hover:underline">
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-5">
                  <input className={inp} placeholder="Item name" value={it.name} onChange={e => setItem(i, 'name', e.target.value)} />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input type="number" min="0" className={inp} placeholder="Qty" value={it.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input type="number" step="any" min="0" className={inp} placeholder="Price" value={it.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input type="number" step="any" min="0" className={inp} placeholder="Tax %" value={it.taxRate} onChange={e => setItem(i, 'taxRate', e.target.value)} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remove item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Order notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (order ? 'Save Changes' : 'Create Order')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { formatMoney, formatDateTime } = useRegion();
  if (!order) return null;
  const items = order.items || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order ${order.orderNumber}`} size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <Badge variant={STATUS_VARIANTS[order.status]} size="sm" className="mt-1">{ORDER_STATUS_LABELS[order.status] || order.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Date</p>
            <p className="text-sm font-medium text-foreground mt-1">{formatDateTime(order.orderDate, { includeTime: false })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Delivery Date</p>
            <p className="text-sm font-medium text-foreground mt-1">{order.deliveryDate ? formatDateTime(order.deliveryDate, { includeTime: false }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Items</p>
            <p className="text-sm font-medium text-foreground mt-1">{items.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Item</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Qty</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Unit Price</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Tax %</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id || i} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{it.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{it.quantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(it.unitPrice)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{it.taxRate}%</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatMoney(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span>{formatMoney(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span><span>{formatMoney(order.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-foreground border-t border-border pt-2">
              <span>Total</span><span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Sales Orders Page ────────────────────────────────────────────────────────
export default function SalesOrdersPage() {
  const { addToast } = useUI();
  const { formatMoney, formatDateTime } = useRegion();
  const { orders, isLoading, error, createOrder, updateOrder, deleteOrder } = useSalesOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<SalesOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<SalesOrder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      (o.notes || '').toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load orders. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: any) => {
    await createOrder(data);
    addToast({ type: 'success', message: 'Order created successfully.' });
  };

  const handleUpdate = async (data: any) => {
    if (!editOrder) return;
    await updateOrder(editOrder.id, data);
    addToast({ type: 'success', message: 'Order updated successfully.' });
  };

  const handleStatusChange = async (id: string, status: SalesOrderStatus) => {
    try {
      await updateOrder(id, { status });
      addToast({ type: 'success', message: 'Order status updated.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteOrder(deleteId);
      addToast({ type: 'success', message: 'Order deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete order.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">Manage orders and track fulfillment status</p>
        </div>
        <button
          onClick={() => { setEditOrder(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders..."
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
        <div className="text-center text-red-500 py-12">Failed to load orders. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new order</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Order Date</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Delivery Date</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Items</th>
                <th className="w-10 px-4 py-3" />
                <th className="w-10 px-4 py-3" />
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setDetailOrder(order)}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{order.orderNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as SalesOrderStatus)}
                      className="bg-muted/40 border border-border/40 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary/60"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(order.orderDate, { includeTime: false })}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.deliveryDate ? formatDateTime(order.deliveryDate, { includeTime: false }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(order.total)}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{(order.items || []).length}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailOrder(order); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="View order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditOrder(order); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit order"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(order.id); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete order"
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
      <OrderModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditOrder(null); }}
        order={editOrder}
        onSave={editOrder ? handleUpdate : handleCreate}
      />

      {/* Detail Modal */}
      <OrderDetailModal order={detailOrder} isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Order" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
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

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Send, CreditCard, FileText, X, PlusCircle } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useInvoices, usePayments, useContacts } from '@/lib/hooks';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD', 'AED', 'CHF'];
const PAYMENT_METHODS = ['bank_transfer', 'cash', 'check', 'credit_card', 'debit_card', 'paypal', 'other'];

const STATUS_VARIANT: Record<InvoiceStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  sent: 'info',
  partial_paid: 'warning',
  paid: 'success',
  overdue: 'error',
  cancelled: 'error',
};

const fmtMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString() : '—';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

interface InvoiceItemRow {
  name: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

// ─── New Invoice Modal ────────────────────────────────────────────────────────
function InvoiceModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const { contacts } = useContacts();
  const { addToast } = useUI();
  const [form, setForm] = useState({
    contactId: '', currency: 'USD', taxRate: '', discount: '', notes: '',
  });
  const [items, setItems] = useState<InvoiceItemRow[]>([{ name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ contactId: '', currency: 'USD', taxRate: '', discount: '', notes: '' });
      setItems([{ name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
    }
  }, [isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const setItem = (i: number, k: keyof InvoiceItemRow, v: string) =>
    setItems(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const addRow = () => setItems(prev => [...prev, { name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
  const removeRow = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.name.trim());
    if (validItems.length === 0) {
      addToast({ type: 'error', message: 'At least one item is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        contactId: form.contactId || undefined,
        currency: form.currency,
        taxRate: parseFloat(form.taxRate) || 0,
        discount: parseFloat(form.discount) || 0,
        notes: form.notes || undefined,
        items: validItems.map(i => ({
          name: i.name.trim(),
          quantity: parseFloat(i.quantity) || 1,
          unitPrice: parseFloat(i.unitPrice) || 0,
          taxRate: parseFloat(i.taxRate) || 0,
        })),
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to create invoice.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Invoice" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</label>
            <select className={inp} value={form.contactId} onChange={e => set('contactId', e.target.value)}>
              <option value="">No contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
            <select className={inp} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Rate (%)</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.taxRate} onChange={e => set('taxRate', e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount</label>
            <input type="number" min="0" step="0.01" className={inp} value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</label>
          <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1 pb-1">
            <span className="col-span-4">Item *</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Unit Price</span>
            <span className="col-span-2">Tax %</span>
            <span className="col-span-2"></span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className={`${inp} col-span-4`}
                  value={item.name}
                  onChange={e => setItem(i, 'name', e.target.value)}
                  placeholder="Item name"
                />
                <input
                  type="number"
                  min="0"
                  className={`${inp} col-span-2`}
                  value={item.quantity}
                  onChange={e => setItem(i, 'quantity', e.target.value)}
                  placeholder="1"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${inp} col-span-2`}
                  value={item.unitPrice}
                  onChange={e => setItem(i, 'unitPrice', e.target.value)}
                  placeholder="0.00"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${inp} col-span-2`}
                  value={item.taxRate}
                  onChange={e => setItem(i, 'taxRate', e.target.value)}
                  placeholder="0"
                />
                <div className="col-span-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={items.length === 1}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add item
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Invoice notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
function PaymentModal({
  isOpen,
  onClose,
  invoice,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onConfirm: (data: { amount: number; method: string; reference?: string; notes?: string }) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (isOpen) {
      setAmount(invoice ? String(invoice.total - invoice.amountPaid) : '');
      setMethod('bank_transfer');
      setReference('');
      setNotes('');
    }
  }, [isOpen, invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addToast({ type: 'error', message: 'Payment amount must be greater than zero.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm({
        amount: parseFloat(amount),
        method,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to record payment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" description={invoice ? `Invoice #${invoice.invoiceNumber}` : ''} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount *</label>
          <input type="number" min="0" step="0.01" className={inp} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</label>
          <select className={inp} value={method} onChange={e => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</label>
          <input className={inp} value={reference} onChange={e => setReference(e.target.value)} placeholder="Check #, transaction id..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea className={`${inp} resize-none`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment notes..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────
function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
  payments,
}: {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  payments: any[];
}) {
  if (!invoice) return null;

  const rows = [
    { label: 'Invoice #', value: invoice.invoiceNumber },
    { label: 'Issued', value: fmtDate(invoice.issueDate) },
    { label: 'Due', value: fmtDate(invoice.dueDate) },
    { label: 'Status', value: invoice.status.replace('_', ' ') },
    { label: 'Total', value: fmtMoney(invoice.total, invoice.currency) },
    { label: 'Amount Paid', value: fmtMoney(invoice.amountPaid, invoice.currency) },
    { label: 'Balance', value: fmtMoney(invoice.total - invoice.amountPaid, invoice.currency) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rows.map(r => (
            <div key={r.label} className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{r.label}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{r.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
          <div className="space-y-1.5">
            {invoice.items.length === 0 && <p className="text-sm text-muted-foreground">No items.</p>}
            {invoice.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground">
                  {item.quantity} × {fmtMoney(item.unitPrice, invoice.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payments</p>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No payments recorded yet.</p>
          ) : (
            <div className="space-y-1.5">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-foreground font-medium">{fmtMoney(p.amount, invoice.currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(p.paidAt)} • {p.method.replace('_', ' ')}
                      {p.reference ? ` • ${p.reference}` : ''}
                    </p>
                  </div>
                  {p.notes && <p className="text-xs text-muted-foreground text-right max-w-[40%]">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {invoice.notes && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Invoices Page ────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const { addToast } = useUI();
  const { invoices, isLoading, error, createInvoice, sendInvoice, recordPayment, deleteInvoice } = useInvoices();
  const { payments } = usePayments();
  const { contacts } = useContacts();

  const contactNames = new Map(contacts.map(c => [c.id, `${c.firstName} ${c.lastName}`]));

  const [modalOpen, setModalOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load invoices. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: any) => {
    await createInvoice(data);
    addToast({ type: 'success', message: 'Invoice created successfully.' });
  };

  const handleSend = async (invoice: Invoice) => {
    try {
      await sendInvoice(invoice.id);
      addToast({ type: 'success', message: 'Invoice sent.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to send invoice.' });
    }
  };

  const handleRecordPayment = async (data: { amount: number; method: string; reference?: string; notes?: string }) => {
    if (!paymentInvoice) return;
    await recordPayment(paymentInvoice.id, data);
    addToast({ type: 'success', message: 'Payment recorded.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deleteId);
      addToast({ type: 'success', message: 'Invoice deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete invoice.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const detailPayments = detailInvoice
    ? payments.filter(p => p.invoiceId === detailInvoice.id)
    : [];

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Bill your customers and track payments</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load invoices. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No invoices found</p>
            <p className="text-sm text-muted-foreground">Create your first invoice to get started</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="py-4 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setDetailInvoice(invoice)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">#{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {invoice.contactId ? (contactNames.get(invoice.contactId) || 'Contact') : 'No contact'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pl-[52px] flex-wrap text-xs text-muted-foreground">
                      <span>Issued: {fmtDate(invoice.issueDate)}</span>
                      <span>Due: {fmtDate(invoice.dueDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pl-[52px] flex-wrap">
                      <Badge variant={STATUS_VARIANT[invoice.status]} size="sm">{invoice.status.replace('_', ' ')}</Badge>
                      <span className="text-sm font-semibold text-foreground">{fmtMoney(invoice.total, invoice.currency)}</span>
                      <span className="text-xs text-muted-foreground">
                        Paid {fmtMoney(invoice.amountPaid, invoice.currency)} • Balance {fmtMoney(invoice.total - invoice.amountPaid, invoice.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {(invoice.status === 'draft' || invoice.status === 'sent') && (
                      <button
                        onClick={() => handleSend(invoice)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                        title="Send invoice"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    )}
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <button
                        onClick={() => setPaymentInvoice(invoice)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                        title="Record payment"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Payment
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(invoice.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <InvoiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />

      {/* Detail Modal */}
      <InvoiceDetailModal
        invoice={detailInvoice}
        isOpen={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        payments={detailPayments}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onConfirm={handleRecordPayment}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Invoice" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this invoice? This action cannot be undone.</p>
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

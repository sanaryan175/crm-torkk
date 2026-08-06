'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Send, FileText, PlusCircle, X } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useQuotes, useContacts } from '@/lib/hooks';
import type { Quote, QuoteStatus } from '@/lib/types';

const STATUS_OPTIONS: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD', 'AED', 'CHF'];

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning',
  converted: 'success',
};

const fmtMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString() : '—';

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

interface QuoteItemRow {
  name: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

// ─── New Quote Modal ──────────────────────────────────────────────────────────
function QuoteModal({
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
    title: '', contactId: '', currency: 'USD', taxRate: '', discount: '', notes: '',
  });
  const [items, setItems] = useState<QuoteItemRow[]>([{ name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ title: '', contactId: '', currency: 'USD', taxRate: '', discount: '', notes: '' });
      setItems([{ name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
    }
  }, [isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const setItem = (i: number, k: keyof QuoteItemRow, v: string) =>
    setItems(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const addRow = () => setItems(prev => [...prev, { name: '', quantity: '1', unitPrice: '', taxRate: '' }]);
  const removeRow = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.name.trim());
    if (!form.title.trim() || validItems.length === 0) {
      addToast({ type: 'error', message: 'Title and at least one item are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        title: form.title,
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
      addToast({ type: 'error', message: err.message || 'Failed to create quote.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Quote" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
            <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Q3 Infrastructure Quote" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</label>
            <select className={inp} value={form.contactId} onChange={e => set('contactId', e.target.value)}>
              <option value="">No contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
            <select className={inp} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
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
          <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Quote notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Quotes Page ──────────────────────────────────────────────────────────────
export default function QuotesPage() {
  const { addToast } = useUI();
  const { quotes, isLoading, error, createQuote, updateQuote, convertQuote, deleteQuote } = useQuotes();
  const { contacts } = useContacts();

  const contactNames = new Map(contacts.map(c => [c.id, `${c.firstName} ${c.lastName}`]));

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load quotes. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: any) => {
    await createQuote(data);
    addToast({ type: 'success', message: 'Quote created successfully.' });
  };

  const handleStatusChange = async (quote: Quote, status: QuoteStatus) => {
    try {
      await updateQuote(quote.id, { status });
      addToast({ type: 'success', message: 'Quote status updated.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update quote status.' });
    }
  };

  const handleConvert = async (quote: Quote) => {
    try {
      await convertQuote(quote.id);
      addToast({ type: 'success', message: 'Quote converted to invoice.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to convert quote.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteQuote(deleteId);
      addToast({ type: 'success', message: 'Quote deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete quote.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground mt-1">Create, send and track your sales quotes</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load quotes. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No quotes found</p>
            <p className="text-sm text-muted-foreground">Create your first quote to get started</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          <span className="text-muted-foreground font-normal mr-1">#{quote.quoteNumber}</span>
                          {quote.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {quote.contactId ? (contactNames.get(quote.contactId) || 'Contact') : 'No contact'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pl-[52px] flex-wrap text-xs text-muted-foreground">
                      <span>Issued: {fmtDate(quote.issueDate)}</span>
                      <span>Expires: {fmtDate(quote.expiryDate)}</span>
                      <span className="text-sm font-semibold text-foreground">{fmtMoney(quote.total, quote.currency)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pl-[52px] flex-wrap">
                      <Badge variant={STATUS_VARIANT[quote.status]} size="sm">{quote.status.replace('_', ' ')}</Badge>
                      <select
                        value={quote.status}
                        onChange={e => handleStatusChange(quote, e.target.value as QuoteStatus)}
                        className="text-xs bg-muted/40 border border-border/40 rounded-md px-2 py-1 text-foreground outline-none focus:border-primary/60 transition-colors"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {quote.status === 'accepted' && (
                      <button
                        onClick={() => handleConvert(quote)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                        title="Convert to invoice"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Convert to Invoice
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(quote.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete quote"
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
      <QuoteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Quote" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this quote? This action cannot be undone.</p>
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

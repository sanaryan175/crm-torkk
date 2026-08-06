'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Pencil, Trash2, Globe, Mail, Users, Building2 } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useUI } from '@/lib/context';
import { useCompanies } from '@/lib/hooks';
import type { Company } from '@/lib/types';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

// ─── New / Edit Company Modal ─────────────────────────────────────────────────
function CompanyModal({
  isOpen,
  onClose,
  company,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSave: (data: Partial<Company>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: '', industry: '', website: '', phone: '', email: '',
    address: '', city: '', state: '', country: '',
    size: '', tags: '', description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        industry: company.industry ?? '',
        website: company.website ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        country: company.country ?? '',
        size: company.size ?? '',
        tags: company.tags.join(', '),
        description: company.description ?? '',
      });
    } else {
      setForm({ name: '', industry: '', website: '', phone: '', email: '', address: '', city: '', state: '', country: '', size: '', tags: '', description: '' });
    }
  }, [company, isOpen]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ type: 'error', message: 'Company name is required.' });
      return;
    }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    setIsSubmitting(true);
    try {
      await onSave({
        name: form.name.trim(),
        industry: form.industry || undefined,
        website: form.website || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        size: form.size || undefined,
        tags,
        description: form.description || undefined,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save company.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company ? 'Edit Company' : 'New Company'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</label>
            <input className={inp} value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Technology" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</label>
            <input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
            <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@acme.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</label>
            <select className={inp} value={form.size} onChange={e => set('size', e.target.value)}>
              <option value="">Select size</option>
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</label>
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="100 Market St" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</label>
            <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="San Francisco" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</label>
            <input className={inp} value={form.state} onChange={e => set('state', e.target.value)} placeholder="CA" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</label>
            <input className={inp} value={form.country} onChange={e => set('country', e.target.value)} placeholder="USA" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
          <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="enterprise, saas" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="About the company..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (company ? 'Save Changes' : 'Create Company')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Companies Page ───────────────────────────────────────────────────────────
export default function CompaniesPage() {
  const { addToast } = useUI();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { companies, isLoading, error, createCompany, updateCompany, deleteCompany } = useCompanies({
    q: debounced || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load companies. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCreate = async (data: Partial<Company>) => {
    await createCompany(data);
    addToast({ type: 'success', message: 'Company created successfully.' });
  };

  const handleUpdate = async (data: Partial<Company>) => {
    if (!editCompany) return;
    await updateCompany(editCompany.id, data);
    addToast({ type: 'success', message: 'Company updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCompany(deleteId);
      addToast({ type: 'success', message: 'Company deleted.' });
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete company.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-1">Manage the organizations you work with</p>
        </div>
        <button
          onClick={() => { setEditCompany(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Company
        </button>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{companies.length} companies</div>
      </Card>

      {/* List */}
      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load companies. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No companies found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or create a new company</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {companies.map((company, index) => {
            const owner = company.owner;
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{company.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {company.industry || 'No industry'}
                            {company.size ? ` • ${company.size} employees` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 pl-[52px] flex-wrap">
                        {company.email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {company.email}
                          </span>
                        )}
                        {company.website && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            {company.website}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 pl-[52px] flex-wrap">
                        <Badge variant="default" size="sm">
                          <Users className="w-3 h-3 mr-1" />
                          {company._count?.contacts ?? 0} contacts
                        </Badge>
                        <Badge variant="info" size="sm">
                          {company._count?.deals ?? 0} deals
                        </Badge>
                        {company.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="primary" size="sm">{tag}</Badge>
                        ))}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {owner ? owner.name : <span className="italic">Unassigned</span>}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => { setEditCompany(company); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit company"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(company.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCompany(null); }}
        company={editCompany}
        onSave={editCompany ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Company" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this company? This action cannot be undone.</p>
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

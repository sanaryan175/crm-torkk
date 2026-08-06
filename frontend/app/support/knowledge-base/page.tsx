'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Trash2, Pencil, FolderOpen, FileText, Clock } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useKnowledgeArticles } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { KnowledgeArticle } from '@/lib/types';

const STATUS_BADGE: Record<string, 'default' | 'success' | 'info'> = {
  draft: 'default',
  published: 'success',
  archived: 'info',
};

function articleStatusBadge(status: string) {
  return STATUS_BADGE[status] || 'default';
}

// ─── New / Edit Article Modal ─────────────────────────────────────────────────
function ArticleModal({
  isOpen,
  onClose,
  article,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  article?: KnowledgeArticle | null;
  onSave: (data: Partial<KnowledgeArticle>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    tags: '',
    status: 'draft',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUI();

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        category: article.category ?? '',
        tags: (article.tags || []).join(', '),
        status: article.status,
        content: article.content,
      });
    } else {
      setForm({ title: '', category: '', tags: '', status: 'draft', content: '' });
    }
  }, [article, isOpen]);

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
        category: form.category.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: form.status,
        content: form.content,
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save article.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = 'w-full bg-muted/40 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={article ? 'Edit Article' : 'New Article'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="How to reset your password" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Getting Started" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
          <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="billing, password, help" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
          <textarea className={`${inp} resize-none`} rows={10} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the article content..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (article ? 'Save Changes' : 'Create Article')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Knowledge Base Page ──────────────────────────────────────────────────────
export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { addToast } = useUI();
  const { formatDateTime } = useRegion();
  const { articles, isLoading, error, createArticle, updateArticle, deleteArticle } = useKnowledgeArticles();

  const [modalOpen, setModalOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<KnowledgeArticle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter((a) => a.title.toLowerCase().includes(q));
  }, [articles, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, KnowledgeArticle[]>();
    filtered.forEach((a) => {
      const cat = a.category?.trim() || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load articles. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((a) => a.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const handleCreate = async (data: Partial<KnowledgeArticle>) => {
    await createArticle(data);
    addToast({ type: 'success', message: 'Article created successfully.' });
  };

  const handleUpdate = async (data: Partial<KnowledgeArticle>) => {
    if (!editArticle) return;
    await updateArticle(editArticle.id, data);
    addToast({ type: 'success', message: 'Article updated successfully.' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteArticle(deleteId);
      addToast({ type: 'success', message: 'Article deleted.' });
      if (selectedId === deleteId) setSelectedId(null);
      setDeleteId(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete article.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Help articles and documentation for your team and customers</p>
        </div>
        <button
          onClick={() => { setEditArticle(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Search */}
      <Card className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search articles by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </Card>

      {error ? (
        <div className="text-center text-red-500 py-12">Failed to load articles. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Articles</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {grouped.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No articles found.</p>
              ) : (
                grouped.map(([cat, items]) => (
                  <div key={cat} className="py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1">{cat}</p>
                    {items.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className={`w-full text-left px-4 py-2.5 flex items-start justify-between gap-2 transition-colors ${
                          selected?.id === a.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent/5 text-foreground'
                        }`}
                      >
                        <span className="flex items-start gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{a.title}</span>
                        </span>
                        {a.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Main panel */}
          <Card className="lg:col-span-2">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={articleStatusBadge(selected.status)} size="sm">{selected.status}</Badge>
                      <span className="text-xs px-2 py-1 rounded-md bg-muted/40 text-muted-foreground capitalize">{selected.category || 'Uncategorized'}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground leading-snug">{selected.title}</h2>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditArticle(selected); setModalOpen(true); }}
                      title="Edit"
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(selected.id)}
                      title="Delete"
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selected.publishedAt ? formatDateTime(selected.publishedAt, { includeTime: false }) : 'Not published yet'}
                  </span>
                  {(selected.tags || []).length > 0 && (
                    <span className="flex flex-wrap items-center gap-1.5">
                      {(selected.tags || []).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground">#{t}</span>
                      ))}
                    </span>
                  )}
                </div>

                <div className="prose prose-sm max-w-none text-sm text-foreground/90 whitespace-pre-wrap border-t border-border/50 pt-5 leading-relaxed">
                  {selected.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select an article to view its content</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ArticleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditArticle(null); }}
        article={editArticle}
        onSave={editArticle ? handleUpdate : handleCreate}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Article" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
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

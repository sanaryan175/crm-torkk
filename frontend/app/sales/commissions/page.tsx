'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Wallet, Clock, Link2 } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import { useCommissions } from '@/lib/hooks';
import { useUI, useRegion } from '@/lib/context';
import type { Commission } from '@/lib/types';

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  paid: 'success',
  approved: 'success',
  completed: 'success',
  rewarded: 'success',
  pending: 'warning',
  processing: 'warning',
  unpaid: 'warning',
  rejected: 'error',
  cancelled: 'error',
};

function statusVariant(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  return STATUS_VARIANTS[status.toLowerCase()] || 'default';
}

const PENDING_STATUSES = ['pending', 'processing', 'unpaid', 'due'];

// ─── Commissions Page ─────────────────────────────────────────────────────────
export default function CommissionsPage() {
  const { addToast } = useUI();
  const { formatMoney, formatDateTime } = useRegion();
  const { commissions, isLoading, error } = useCommissions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommissions = useMemo(() => {
    if (!searchQuery.trim()) return commissions;
    const q = searchQuery.toLowerCase();
    return commissions.filter((c) =>
      (c.user?.name || '').toLowerCase().includes(q) ||
      (c.dealId || '').toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [commissions, searchQuery]);

  useEffect(() => {
    if (error) addToast({ type: 'error', message: 'Failed to load commissions. Please try again.' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const totalCommissions = useMemo(() => commissions.reduce((sum, c) => sum + (c.amount || 0), 0), [commissions]);
  const pendingCount = useMemo(
    () => commissions.filter((c) => PENDING_STATUSES.includes(c.status.toLowerCase())).length,
    [commissions]
  );

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Commissions</h1>
        <p className="text-muted-foreground mt-1">Review sales commissions earned by your team</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Commissions</p>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(totalCommissions)}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search commissions..."
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
        <div className="text-center text-red-500 py-12">Failed to load commissions. Please verify backend is running.</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredCommissions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-2">
            <p className="text-muted-foreground">No commissions found</p>
            <p className="text-sm text-muted-foreground">Commissions are generated automatically from closed deals</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">User</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Deal</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Amount</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Rate</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.user?.name ? c.user.name.charAt(0).toUpperCase() : '—'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.user?.name || 'Unassigned'}</p>
                        {c.user?.email && <p className="text-xs text-muted-foreground">{c.user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.dealId ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-mono text-xs">
                        <Link2 className="w-3 h-3" />
                        {c.dealId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoney(c.amount)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {c.rate != null ? `${c.rate}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(c.status)} size="sm">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(c.createdAt, { includeTime: false })}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

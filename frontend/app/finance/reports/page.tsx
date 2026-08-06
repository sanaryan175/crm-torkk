'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Landmark } from 'lucide-react';
import Card from '@/components/ui/card';
import { useRegion } from '@/lib/context';
import { useIncomes, useExpenses, useBudgets, useBankAccounts } from '@/lib/hooks';

function SummaryCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

export default function FinanceReportsPage() {
  const { formatMoney, formatDateTime } = useRegion();
  const { incomes } = useIncomes();
  const { expenses } = useExpenses();
  const { budgets } = useBudgets();
  const { accounts } = useBankAccounts();

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const netProfit = totalIncome - totalExpenses;
  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);

  const recentIncomes = useMemo(() => [...incomes].sort((a, b) => new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime()).slice(0, 5), [incomes]);
  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()).slice(0, 5), [expenses]);

  // Category breakdown
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    incomes.forEach(i => { const k = i.category || 'Uncategorized'; map[k] = (map[k] || 0) + i.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [incomes]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { const k = e.category || 'Uncategorized'; map[k] = (map[k] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
        <p className="text-muted-foreground mt-1">Financial overview and summary</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Income" value={formatMoney(totalIncome)} icon={TrendingUp} color="bg-green-500/10 text-green-600" />
        <SummaryCard title="Total Expenses" value={formatMoney(totalExpenses)} icon={TrendingDown} color="bg-red-500/10 text-red-500" />
        <SummaryCard title="Net Profit" value={formatMoney(netProfit)} icon={DollarSign} color={netProfit >= 0 ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'} />
        <SummaryCard title="Bank Balance" value={formatMoney(totalBalance)} icon={Landmark} color="bg-blue-500/10 text-blue-600" />
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Active Budgets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgets.filter(b => b.status === 'active').map(b => (
              <Card key={b.id}>
                <p className="font-medium text-foreground">{b.name}</p>
                <p className="text-sm text-muted-foreground">{b.category || 'General'}</p>
                <p className="text-xl font-bold text-foreground mt-2">{formatMoney(b.amount)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by category */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Income by Category</h2>
          <Card>
            {incomeByCategory.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No income data</p>
            ) : (
              <div className="space-y-3">
                {incomeByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <span className="text-sm font-semibold text-green-600">{formatMoney(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Expenses by category */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Expenses by Category</h2>
          <Card>
            {expenseByCategory.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No expense data</p>
            ) : (
              <div className="space-y-3">
                {expenseByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <span className="text-sm font-semibold text-red-500">{formatMoney(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Income</h2>
          <Card>
            {recentIncomes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No recent income</p>
            ) : (
              <div className="space-y-3">
                {recentIncomes.map(i => (
                  <div key={i.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{i.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(i.incomeDate, { includeTime: false })}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{formatMoney(i.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Expenses</h2>
          <Card>
            {recentExpenses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No recent expenses</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(e.expenseDate, { includeTime: false })}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-500">{formatMoney(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

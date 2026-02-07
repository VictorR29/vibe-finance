import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardStat } from './ui/Card';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatMonthYear } from '../utils/format';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Wallet,
  Globe,
  Calendar,
  PiggyBank,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { SavingsGoal } from '../types';

const SavingsGoalProgress: React.FC<{ goal: SavingsGoal; currency: string }> = ({
  goal,
  currency,
}) => {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  return (
    <div className="space-y-2 p-3 rounded-xl hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{goal.name}</span>
        <span className="text-primary font-bold">
          {formatCurrency(goal.targetAmount, currency)}
        </span>
      </div>
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatCurrency(goal.currentAmount, currency)} ahorrado</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { state, setCurrency } = useAppContext();
  const [filterType, setFilterType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  const isDarkMode = state.theme === 'dark';

  // Calculate balance for each account
  const accountBalances = useMemo(() => {
    return state.accounts.map(account => {
      const transactions = state.transactions.filter(t => t.accountId === account.id);
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = account.initialBalance + income - expense;
      return { ...account, balance };
    });
  }, [state.accounts, state.transactions]);

  // 1. Calculate available periods based on transactions + current date
  const availablePeriods = useMemo(() => {
    const dates = new Set<string>();
    const now = new Date();

    // Always add current period to ensure it appears even if empty
    if (filterType === 'monthly') {
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
      dates.add(currentMonth);
    } else {
      const currentYear = now.getFullYear().toString();
      dates.add(currentYear);
    }

    // Add periods from transactions
    state.transactions.forEach(t => {
      if (filterType === 'monthly') {
        dates.add(t.date.slice(0, 7));
      } else {
        dates.add(t.date.slice(0, 4));
      }
    });

    return Array.from(dates).sort().reverse();
  }, [state.transactions, filterType]);

  // 2. Set default selection to most recent period on load/switch
  useEffect(() => {
    if (availablePeriods.length > 0 && !availablePeriods.includes(selectedPeriod)) {
      setSelectedPeriod(availablePeriods[0]);
    }
  }, [availablePeriods, filterType, selectedPeriod]);

  // 3. Calculate Period Stats
  const periodStats = useMemo(() => {
    if (!selectedPeriod) return { income: 0, expense: 0, balance: 0 };

    const filtered = state.transactions.filter(t => {
      if (filterType === 'monthly') {
        return t.date.startsWith(selectedPeriod);
      } else {
        return t.date.startsWith(selectedPeriod);
      }
    });

    const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [state.transactions, selectedPeriod, filterType]);

  // 4. Lifetime Stats (Global) - Kept for reference or top cards
  const globalStats = useMemo(() => {
    const income = state.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [state.transactions]);

  const currencies = [
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'Dólar EEUU ($)' },
    { code: 'COP', label: 'Peso Colombiano ($)' },
    { code: 'MXN', label: 'Peso Mexicano ($)' },
    { code: 'GBP', label: 'Libra Esterlina (£)' },
  ];

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [state.transactions]);

  const sortedGoals = useMemo(() => {
    return [...state.savingsGoals].sort((a, b) => {
      const progressA = a.currentAmount / a.targetAmount;
      const progressB = b.currentAmount / b.targetAmount;
      return progressB - progressA;
    });
  }, [state.savingsGoals]);

  const tickColor = isDarkMode ? '#9CA3AF' : '#4B5563';
  const chartColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header / Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resumen</h1>
          <p className="text-gray-500 dark:text-gray-400">Bienvenido de nuevo a Vibe Finanzas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <select
              value={state.currency}
              onChange={e => setCurrency(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer hover:bg-white/90 dark:hover:bg-gray-800 transition-colors shadow-sm text-gray-700 dark:text-gray-200 font-medium"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Stats Grid (Lifetime) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <CardStat
          label="Total Ingresos (Histórico)"
          value={formatCurrency(globalStats.income, state.currency)}
          icon={<ArrowUpRight className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <CardStat
          label="Total Gastos (Histórico)"
          value={formatCurrency(globalStats.expense, state.currency)}
          icon={<ArrowDownLeft className="w-6 h-6" />}
          color="bg-rose-500"
        />
        <div
          onClick={() => setShowAccountsModal(true)}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <CardStat
            label="Balance Global (Ver desglose)"
            value={formatCurrency(globalStats.balance, state.currency)}
            icon={<Wallet className="w-6 h-6" />}
            color="bg-primary"
          />
        </div>
      </div>

      {/* Period Analysis Section */}
      <Card className="overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Balance del Período</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
            {/* Toggle Type */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setFilterType('monthly')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  filterType === 'monthly'
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                Mensual
              </button>
              <button
                onClick={() => setFilterType('yearly')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  filterType === 'yearly'
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                Anual
              </button>
            </div>

            {/* Date Selector */}
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-white dark:bg-gray-800 border-none text-sm font-medium text-gray-700 dark:text-gray-200 py-1.5 px-3 rounded-lg focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              {availablePeriods.map(period => (
                <option key={period} value={period}>
                  {filterType === 'monthly' ? formatMonthYear(period) : period}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Period Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Ingresos
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(periodStats.income, state.currency)}
            </span>
            <div className="mt-2 w-full h-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full"></div>
            </div>
          </div>

          {/* Expenses */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              Gastos
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(periodStats.expense, state.currency)}
            </span>
            <div className="mt-2 w-full h-1 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
              {/* Simple visual relative to income (capped at 100% for bar) */}
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{
                  width: `${periodStats.income > 0 ? Math.min((periodStats.expense / periodStats.income) * 100, 100) : 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Net Result */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 flex flex-col items-center text-center relative overflow-hidden">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              Resultado Neto
            </span>
            <span
              className={cn(
                'text-2xl font-bold',
                periodStats.balance >= 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {periodStats.balance >= 0 ? '+' : ''}
              {formatCurrency(periodStats.balance, state.currency)}
            </span>
            <div className="mt-2 flex items-center gap-1 text-xs text-blue-600/70 dark:text-blue-400/70">
              <PiggyBank className="w-3 h-3" />
              <span>
                {periodStats.income > 0
                  ? Math.round(
                      ((periodStats.income - periodStats.expense) / periodStats.income) * 100
                    )
                  : 0}
                % margen
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Top Gastos (Histórico)" className="lg:col-span-2 min-h-[400px]">
          <div className="h-[300px] w-full mt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseByCategory}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barSize={40}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  width={80}
                  tickFormatter={value =>
                    formatCurrency(value, state.currency).replace(/(\.00|,\d+)/, '')
                  }
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  contentStyle={{
                    backgroundColor: isDarkMode
                      ? 'rgba(17, 24, 39, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                  formatter={(value: number) => [formatCurrency(value, state.currency), 'Gasto']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Metas de Ahorro">
          <div className="space-y-4 mt-2">
            {sortedGoals.length > 0 ? (
              sortedGoals
                .slice(0, 4)
                .map(goal => (
                  <SavingsGoalProgress key={goal.id} goal={goal} currency={state.currency} />
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sin metas activas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                  Define objetivos financieros para ver tu progreso aquí.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Accounts Breakdown Modal */}
      <Modal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
        title="Desglose por Cuentas"
        size="md"
      >
        <div className="space-y-4">
          {accountBalances.map(account => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: account.color || '#6366f1' }}
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Balance inicial: {formatCurrency(account.initialBalance, account.currency)}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg font-bold ${
                  account.balance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(account.balance, account.currency)}
              </p>
            </div>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">TOTAL GLOBAL</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(globalStats.balance, state.currency)}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowAccountsModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Dashboard;

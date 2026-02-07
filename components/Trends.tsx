import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { formatCurrency, formatShortDate } from '../utils/format';
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '../utils/cn';

type Period = '30d' | '3m' | '6m' | '1y';

interface TrendData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
}

const Trends: React.FC = () => {
  const { state } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('6m');

  const getDaysForPeriod = (period: Period): number => {
    switch (period) {
      case '30d':
        return 30;
      case '3m':
        return 90;
      case '6m':
        return 180;
      case '1y':
        return 365;
      default:
        return 180;
    }
  };

  const trendData = useMemo(() => {
    const days = getDaysForPeriod(selectedPeriod);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Group transactions by date
    const dailyData: Record<string, { income: number; expense: number }> = {};

    // Initialize all days with 0
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { income: 0, expense: 0 };
    }

    // Fill with actual transactions
    state.transactions.forEach(t => {
      if (
        t.date >= startDate.toISOString().split('T')[0] &&
        t.date <= endDate.toISOString().split('T')[0]
      ) {
        if (!dailyData[t.date]) {
          dailyData[t.date] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          dailyData[t.date].income += t.amount;
        } else {
          dailyData[t.date].expense += t.amount;
        }
      }
    });

    // Convert to array and calculate running balance
    let runningBalance = 0;
    const data: TrendData[] = Object.keys(dailyData)
      .sort()
      .map(date => {
        runningBalance += dailyData[date].income - dailyData[date].expense;
        return {
          date,
          income: dailyData[date].income,
          expense: dailyData[date].expense,
          balance: runningBalance,
        };
      });

    return data;
  }, [state.transactions, selectedPeriod]);

  const monthlyComparison = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};

    state.transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        months[month].income += t.amount;
      } else {
        months[month].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(months).sort().slice(-6); // Last 6 months

    return sortedMonths.map((month, index) => {
      const prevMonth = index > 0 ? sortedMonths[index - 1] : null;
      const incomeChange = prevMonth
        ? ((months[month].income - months[prevMonth].income) / months[prevMonth].income) * 100
        : 0;
      const expenseChange = prevMonth
        ? ((months[month].expense - months[prevMonth].expense) / months[prevMonth].expense) * 100
        : 0;

      return {
        month,
        income: months[month].income,
        expense: months[month].expense,
        balance: months[month].income - months[month].expense,
        incomeChange: isFinite(incomeChange) ? incomeChange : 0,
        expenseChange: isFinite(expenseChange) ? expenseChange : 0,
      };
    });
  }, [state.transactions]);

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  const totalIncome = trendData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = trendData.reduce((sum, d) => sum + d.expense, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tendencias</h1>
        <div className="flex gap-2">
          {(['30d', '3m', '6m', '1y'] as Period[]).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedPeriod === period
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {period === '30d' && '30 días'}
              {period === '3m' && '3 meses'}
              {period === '6m' && '6 meses'}
              {period === '1y' && '1 año'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Totales</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome, state.currency)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="bg-rose-50/50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gastos Totales</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpense, state.currency)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-rose-500" />
          </div>
        </Card>

        <Card
          className={cn(
            netBalance >= 0
              ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance Neto</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  netBalance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {formatCurrency(netBalance, state.currency)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card title="Evolución Financiera">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={value =>
                  formatCurrency(value, state.currency)
                    .replace(/[^0-9.,]/g, '')
                    .slice(0, 4) + '...'
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={label => `Fecha: ${formatShortDate(label)}`}
                formatter={(value: number, name: string) => [
                  formatCurrency(value, state.currency),
                  name === 'income' ? 'Ingresos' : name === 'expense' ? 'Gastos' : 'Balance',
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                fillOpacity={1}
                fill="url(#colorExpense)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Balance Chart */}
      <Card title="Balance Acumulado">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={value =>
                  formatCurrency(value, state.currency)
                    .replace(/[^0-9.,]/g, '')
                    .slice(0, 4) + '...'
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={label => `Fecha: ${formatShortDate(label)}`}
                formatter={(value: number) => [formatCurrency(value, state.currency), 'Balance']}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Comparison Table */}
      {monthlyComparison.length > 0 && (
        <Card title="Comparación Mensual">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Mes
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Ingresos
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Gastos
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Balance
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    vs Mes Anterior
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyComparison.map((month, index) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatMonth(month.month)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(month.income, state.currency)}
                      {index > 0 && (
                        <span
                          className={cn(
                            'ml-2 text-xs',
                            month.incomeChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          )}
                        >
                          {month.incomeChange >= 0 ? '↑' : '↓'}{' '}
                          {Math.abs(month.incomeChange).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-rose-600 dark:text-rose-400 font-medium">
                      {formatCurrency(month.expense, state.currency)}
                      {index > 0 && (
                        <span
                          className={cn(
                            'ml-2 text-xs',
                            month.expenseChange <= 0 ? 'text-emerald-500' : 'text-rose-500'
                          )}
                        >
                          {month.expenseChange >= 0 ? '↑' : '↓'}{' '}
                          {Math.abs(month.expenseChange).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'py-3 px-4 text-sm text-right font-bold',
                        month.balance >= 0
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {formatCurrency(month.balance, state.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {index === 0 ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {month.balance > monthlyComparison[index - 1].balance ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Trends;

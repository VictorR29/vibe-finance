import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '../types';
import { formatCurrency, formatShortDate } from '../utils/format';
import {
  Edit,
  Trash2,
  PlusCircle,
  Filter,
  Search,
  Calendar,
  X,
  ArrowRightLeft,
} from 'lucide-react';

const TransactionList: React.FC = () => {
  const { state, deleteTransaction } = useAppContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const openModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
    showToast(
      editingTransaction
        ? 'Transacción actualizada correctamente'
        : 'Transacción creada correctamente',
      'success'
    );
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (window.confirm(`¿Estás seguro de eliminar "${transaction.description}"?`)) {
      deleteTransaction(transaction.id);
      showToast('Transacción eliminada correctamente', 'success');
    }
  };

  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter(t => {
        const matchesSearch =
          !filter ||
          t.description.toLowerCase().includes(filter.toLowerCase()) ||
          t.category.toLowerCase().includes(filter.toLowerCase());
        const matchesDate = !dateFilter || t.date === dateFilter;
        const matchesCategories =
          selectedCategories.length === 0 || selectedCategories.includes(t.category);
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesAccount = accountFilter === 'all' || t.accountId === accountFilter;

        return matchesSearch && matchesDate && matchesCategories && matchesType && matchesAccount;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, filter, dateFilter, selectedCategories, typeFilter, accountFilter]);

  const activeFiltersCount =
    selectedCategories.length +
    (typeFilter !== 'all' ? 1 : 0) +
    (dateFilter ? 1 : 0) +
    (accountFilter !== 'all' ? 1 : 0);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setFilter('');
    setDateFilter('');
    setSelectedCategories([]);
    setTypeFilter('all');
    setAccountFilter('all');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transacciones</h1>
        <Button onClick={() => openModal()} size="md" className="shadow-lg shadow-primary/30">
          <PlusCircle className="w-4 h-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      <Card className="min-h-[60vh]">
        {/* Filters Section */}
        <div className="space-y-4 mb-6">
          {/* Top Row: Search and Date */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Text Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descripción o categoría..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200"
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative md:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full md:w-auto pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:[color-scheme:dark]"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:right-3 bg-gray-50 dark:bg-gray-800 pl-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tipo:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setTypeFilter('transfer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'transfer'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Transferencias
              </button>
            </div>
          </div>

          {/* Account Filter */}
          {state.accounts.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Cuenta:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAccountFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    accountFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Todas
                </button>
                {state.accounts
                  .filter(a => a.isActive)
                  .map(account => (
                    <button
                      key={account.id}
                      onClick={() => setAccountFilter(account.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        accountFilter === account.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {account.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Categories Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Categorías:</span>
            <div className="flex flex-wrap gap-2">
              {state.categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategories.includes(category)
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Count & Clear Button */}
          {(activeFiltersCount > 0 || filter) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeFiltersCount + (filter ? 1 : 0)} filtro
                {activeFiltersCount + (filter ? 1 : 0) !== 1 ? 's' : ''} activo
                {activeFiltersCount + (filter ? 1 : 0) !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar todos
              </button>
            </div>
          )}
        </div>

        <div className="flow-root">
          <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => {
                const isTransfer = transaction.type === 'transfer';
                const fromAccount = state.accounts.find(a => a.id === transaction.accountId);
                const toAccount = state.accounts.find(a => a.id === transaction.toAccountId);

                return (
                  <li
                    key={transaction.id}
                    className={`flex items-center justify-between py-4 group rounded-xl px-2 -mx-2 transition-colors gap-3 ${
                      isTransfer
                        ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-500 hover:bg-blue-100/70 dark:hover:bg-blue-900/30'
                        : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      {isTransfer ? (
                        <div className="p-2 sm:p-3 rounded-2xl flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      ) : (
                        <div
                          className={`p-2 sm:p-3 rounded-2xl flex-shrink-0 ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}
                        >
                          <div className="font-bold text-base sm:text-lg w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                            {transaction.category.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                          {isTransfer
                            ? `Transferencia: ${fromAccount?.name || 'Cuenta'} → ${toAccount?.name || 'Cuenta'}`
                            : transaction.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {isTransfer ? (
                            <>
                              {formatShortDate(transaction.date)}
                              {transaction.description &&
                                transaction.description !== 'Transferencia entre cuentas' && (
                                  <span className="ml-1">&middot; {transaction.description}</span>
                                )}
                            </>
                          ) : (
                            <>
                              {transaction.category} &middot; {formatShortDate(transaction.date)}
                              {transaction.accountId && (
                                <span className="ml-1">
                                  &middot;{' '}
                                  {state.accounts.find(a => a.id === transaction.accountId)?.name ||
                                    'Cuenta eliminada'}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p
                        className={`font-bold text-sm sm:text-base md:text-lg whitespace-nowrap ${
                          isTransfer
                            ? 'text-blue-600 dark:text-blue-400'
                            : transaction.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {isTransfer ? (
                          <span className="flex items-center gap-1">
                            <ArrowRightLeft className="w-4 h-4" />
                            {formatCurrency(transaction.amount, state.currency)}
                          </span>
                        ) : (
                          <>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, state.currency)}
                          </>
                        )}
                      </p>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(transaction)}
                          className="p-1 h-auto text-gray-500 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="p-1 h-auto text-gray-500 hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No se encontraron transacciones.
                </p>
                {(filter || dateFilter) && (
                  <button
                    onClick={() => {
                      setFilter('');
                      setDateFilter('');
                    }}
                    className="text-primary hover:underline mt-2 text-sm font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </ul>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Editar Transacción' : 'Añadir Transacción'}
      >
        <TransactionForm onSubmit={closeModal} initialData={editingTransaction} />
      </Modal>
    </div>
  );
};

export default TransactionList;

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ConfirmModal } from './ui/ConfirmModal';
import { Account } from '../types';
import { formatCurrency } from '../utils/format';
import {
  Plus,
  Edit2,
  Trash2,
  Wallet,
  PiggyBank,
  CreditCard,
  DollarSign,
  Landmark,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../utils/cn';

const accountTypes = {
  cash: { label: 'Efectivo', icon: DollarSign },
  checking: { label: 'Cuenta Corriente', icon: Landmark },
  savings: { label: 'Ahorros', icon: PiggyBank },
  credit: { label: 'Tarjeta de Crédito', icon: CreditCard },
  investment: { label: 'Inversión', icon: Briefcase },
  other: { label: 'Otra', icon: Wallet },
};

const accountColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#78716c', // Stone
];

interface AccountFormData {
  name: string;
  type: Account['type'];
  initialBalance: number;
  color: string;
}

const Accounts: React.FC = () => {
  const { state, addAccount, updateAccount, deleteAccount } = useAppContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'checking',
    initialBalance: 0,
    color: accountColors[0],
  });

  const calculateAccountBalance = (accountId: string): number => {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return 0;

    const transactions = state.transactions.filter(t => t.accountId === accountId);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return account.initialBalance + income - expenses;
  };

  const getAccountTransactionsCount = (accountId: string): number => {
    return state.transactions.filter(t => t.accountId === accountId).length;
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
        color: account.color || accountColors[0],
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'checking',
        initialBalance: 0,
        color: accountColors[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setFormData({
      name: '',
      type: 'checking',
      initialBalance: 0,
      color: accountColors[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('El nombre de la cuenta es obligatorio', 'error');
      return;
    }

    if (editingAccount) {
      updateAccount({
        ...editingAccount,
        ...formData,
      });
      showToast('Cuenta actualizada correctamente', 'success');
    } else {
      addAccount({
        ...formData,
        currency: state.currency,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      showToast('Cuenta creada correctamente', 'success');
    }

    closeModal();
  };

  const handleDeleteAccount = () => {
    if (deletingAccount) {
      deleteAccount(deletingAccount.id);
      showToast('Cuenta eliminada correctamente', 'success');
      setDeletingAccount(null);
    }
  };

  const totalBalance = useMemo(() => {
    return state.accounts.reduce((sum, account) => {
      if (account.isActive) {
        return sum + calculateAccountBalance(account.id);
      }
      return sum;
    }, 0);
  }, [state.accounts, state.transactions]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cuentas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Balance total: {formatCurrency(totalBalance, state.currency)}
          </p>
        </div>
        <Button onClick={() => openModal()} className="shadow-lg shadow-primary/30">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.accounts.map(account => {
          const balance = calculateAccountBalance(account.id);
          const transactionCount = getAccountTransactionsCount(account.id);
          const IconComponent = accountTypes[account.type].icon;

          return (
            <Card
              key={account.id}
              className={cn(
                'relative overflow-hidden transition-all hover:shadow-lg',
                !account.isActive && 'opacity-60'
              )}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: account.color }}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: account.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {accountTypes[account.type].label}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(account)}
                      className="p-1 h-auto text-gray-500 hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {state.accounts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingAccount(account)}
                        className="p-1 h-auto text-gray-500 hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Balance actual</span>
                    <span
                      className={cn(
                        'text-2xl font-bold',
                        balance >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {formatCurrency(balance, account.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Balance inicial</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatCurrency(account.initialBalance, account.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Transacciones</span>
                    <span className="text-gray-700 dark:text-gray-300">{transactionCount}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {state.accounts.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tienes cuentas
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Crea tu primera cuenta para empezar a gestionar tus finanzas
          </p>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Crear cuenta
          </Button>
        </div>
      )}

      {/* Account Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la cuenta
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cuenta Corriente Banco"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(accountTypes) as Account['type'][]).map(type => {
                const Icon = accountTypes[type].icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-all',
                      formData.type === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{accountTypes[type].label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Balance inicial
            </label>
            <input
              type="number"
              value={formData.initialBalance}
              onChange={e =>
                setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este será el balance de partida de la cuenta
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {accountColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingAccount ? 'Guardar cambios' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDeleteAccount}
        title="Eliminar Cuenta"
        message={
          deletingAccount && getAccountTransactionsCount(deletingAccount.id) > 0
            ? `Esta cuenta tiene ${getAccountTransactionsCount(deletingAccount.id)} transacciones. Al eliminarla, las transacciones quedarán sin cuenta asignada.`
            : '¿Estás seguro de que deseas eliminar esta cuenta?'
        }
        itemName={deletingAccount?.name}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Accounts;

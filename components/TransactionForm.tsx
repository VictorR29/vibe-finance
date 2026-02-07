import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';
import { ArrowRightLeft } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData }) => {
  const { state, addTransaction, updateTransaction } = useAppContext();

  // Get default account (first active one)
  const defaultAccount = state.accounts.find(a => a.isActive)?.id || state.accounts[0]?.id || '';

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense' | 'transfer',
    accountId: defaultAccount,
    toAccountId: '',
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: String(initialData.amount),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date,
        type: initialData.type,
        accountId: initialData.accountId,
        toAccountId: initialData.toAccountId || '',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'La cantidad debe ser un número mayor que 0';
    }
    if (formData.type !== 'transfer' && !formData.category.trim()) {
      newErrors.category = 'La categoría es obligatoria';
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.accountId) newErrors.accountId = 'Debes seleccionar una cuenta de origen';
    if (formData.type === 'transfer') {
      if (!formData.toAccountId) {
        newErrors.toAccountId = 'Debes seleccionar una cuenta de destino';
      } else if (formData.accountId === formData.toAccountId) {
        newErrors.toAccountId = 'La cuenta de destino no puede ser la misma que la de origen';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const transactionData = {
      amount: Number(formData.amount),
      category: formData.type === 'transfer' ? 'Transferencia' : formData.category.trim(),
      description:
        formData.description.trim() ||
        (formData.type === 'transfer' ? 'Transferencia entre cuentas' : ''),
      date: formData.date,
      type: formData.type,
      accountId: formData.accountId,
      toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
    };

    if (initialData) {
      updateTransaction({ ...transactionData, id: initialData.id });
    } else {
      addTransaction(transactionData);
    }
    onSubmit();
  };

  const activeAccounts = state.accounts.filter(a => a.isActive);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div className="flex gap-2 mb-4">
        {(['expense', 'income', 'transfer'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type })}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              formData.type === type
                ? type === 'income'
                  ? 'bg-emerald-500 text-white'
                  : type === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type === 'income' && 'Ingreso'}
            {type === 'expense' && 'Gasto'}
            {type === 'transfer' && (
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-4 h-4" />
                Transferencia
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Cantidad"
          type="number"
          value={formData.amount}
          onChange={value => setFormData({ ...formData, amount: value })}
          error={errors.amount}
          placeholder="0.00"
          required
        />
        <FormField
          label="Fecha"
          type="date"
          value={formData.date}
          onChange={value => setFormData({ ...formData, date: value })}
          error={errors.date}
          required
        />
      </div>

      {/* Transfer Fields */}
      {formData.type === 'transfer' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Desde cuenta"
              type="select"
              value={formData.accountId}
              onChange={value => setFormData({ ...formData, accountId: value })}
              error={errors.accountId}
              options={activeAccounts.map(acc => ({
                value: acc.id,
                label: acc.name,
              }))}
              required
            />
            <FormField
              label="Hacia cuenta"
              type="select"
              value={formData.toAccountId}
              onChange={value => setFormData({ ...formData, toAccountId: value })}
              error={errors.toAccountId}
              options={activeAccounts
                .filter(acc => acc.id !== formData.accountId)
                .map(acc => ({
                  value: acc.id,
                  label: acc.name,
                }))}
              required
            />
          </div>
          <FormField
            label="Descripción (opcional)"
            type="text"
            value={formData.description}
            onChange={value => setFormData({ ...formData, description: value })}
            placeholder="Ej: Ahorro mensual"
          />
        </div>
      ) : (
        <>
          <FormField
            label="Descripción"
            type="text"
            value={formData.description}
            onChange={value => setFormData({ ...formData, description: value })}
            error={errors.description}
            placeholder="Ej: Café con amigos"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Categoría"
              type="select"
              value={formData.category}
              onChange={value => setFormData({ ...formData, category: value })}
              error={errors.category}
              options={state.categories.map(cat => ({ value: cat, label: cat }))}
              required
            />
            <FormField
              label="Cuenta"
              type="select"
              value={formData.accountId}
              onChange={value => setFormData({ ...formData, accountId: value })}
              error={errors.accountId}
              options={activeAccounts.map(acc => ({
                value: acc.id,
                label: acc.name,
              }))}
              required
            />
          </div>
        </>
      )}

      <FormField
        label="Etiquetas (separadas por coma)"
        type="text"
        value={formData.tags}
        onChange={value => setFormData({ ...formData, tags: value })}
        placeholder="Ej: trabajo, personal"
      />

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          className={formData.type === 'transfer' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          {initialData ? 'Actualizar' : formData.type === 'transfer' ? 'Transferir' : 'Añadir'}
          {formData.type === 'transfer' ? '' : ' Transacción'}
        </Button>
      </div>
    </form>
  );
};

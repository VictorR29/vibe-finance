import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';

interface TransactionFormProps {
  onSubmit: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData }) => {
  const { state, addTransaction, updateTransaction } = useAppContext();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
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
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'La cantidad debe ser un número mayor que 0';
    }
    if (!formData.category.trim()) newErrors.category = 'La categoría es obligatoria';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const transactionData = {
      amount: Number(formData.amount),
      category: formData.category.trim(),
      description: formData.description.trim(),
      date: formData.date,
      type: formData.type,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    
    if (initialData) {
        updateTransaction({ ...transactionData, id: initialData.id });
    } else {
        addTransaction(transactionData);
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Cantidad" type="number" value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          error={errors.amount} placeholder="0.00" required
        />
        <FormField
          label="Fecha" type="date" value={formData.date}
          onChange={(value) => setFormData({ ...formData, date: value })}
          error={errors.date} required
        />
      </div>
      <FormField
        label="Descripción" type="text" value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        error={errors.description} placeholder="Ej: Café con amigos" required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Categoría" type="select" value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          error={errors.category}
          options={state.categories.map(cat => ({ value: cat, label: cat }))}
          required
        />
        <FormField
          label="Tipo" type="select" value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
          options={[
            { value: 'expense', label: 'Gasto' },
            { value: 'income', label: 'Ingreso' }
          ]}
        />
      </div>
      <FormField
        label="Etiquetas (separadas por coma)" type="text" value={formData.tags}
        onChange={(value) => setFormData({ ...formData, tags: value })}
        placeholder="Ej: trabajo, personal"
      />
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          {initialData ? 'Actualizar' : 'Añadir'} Transacción
        </Button>
      </div>
    </form>
  );
};
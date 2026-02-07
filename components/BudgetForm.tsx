import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { Budget } from '../types';
import { useAppContext } from '../context/AppContext';

interface BudgetFormProps {
  onSubmit: () => void;
  initialData?: Budget | null;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, initialData }) => {
  const { state, addBudget, updateBudget } = useAppContext();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category,
        limit: String(initialData.limit),
        period: initialData.period,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'La categoría es obligatoria';
    if (!formData.limit || isNaN(Number(formData.limit)) || Number(formData.limit) <= 0) {
      newErrors.limit = 'El límite debe ser un número mayor que 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const budgetData = {
      category: formData.category,
      limit: Number(formData.limit),
      period: formData.period,
    };

    if (initialData) {
      updateBudget({ ...budgetData, id: initialData.id });
    } else {
      addBudget(budgetData);
    }
    onSubmit();
  };

  const availableCategories = state.categories.filter(
    cat => !state.budgets.some(b => b.category === cat && b.id !== initialData?.id)
  );

  if (initialData?.category && !availableCategories.includes(initialData.category)) {
    availableCategories.unshift(initialData.category);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Categoría"
        type="select"
        value={formData.category}
        onChange={value => setFormData({ ...formData, category: value })}
        error={errors.category}
        options={availableCategories.map(cat => ({ value: cat, label: cat }))}
        required
        disabled={!!initialData}
      />
      <FormField
        label="Límite Mensual"
        type="number"
        value={formData.limit}
        onChange={value => setFormData({ ...formData, limit: value })}
        error={errors.limit}
        placeholder="500"
        required
      />
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          {initialData ? 'Actualizar' : 'Crear'} Presupuesto
        </Button>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { SavingsGoal } from '../types';
import { useAppContext } from '../context/AppContext';

interface SavingsGoalFormProps {
  onSubmit: () => void;
  initialData?: SavingsGoal | null;
}

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ onSubmit, initialData }) => {
  const { addSavingsGoal, updateSavingsGoal } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        targetAmount: String(initialData.targetAmount),
        currentAmount: String(initialData.currentAmount),
        targetDate: initialData.targetDate,
        priority: initialData.priority,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (
      !formData.targetAmount ||
      isNaN(Number(formData.targetAmount)) ||
      Number(formData.targetAmount) <= 0
    ) {
      newErrors.targetAmount = 'El objetivo debe ser un número mayor que 0';
    }
    if (isNaN(Number(formData.currentAmount)) || Number(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'La cantidad actual debe ser un número positivo';
    }
    if (!formData.targetDate) newErrors.targetDate = 'La fecha objetivo es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const goalData = {
      name: formData.name.trim(),
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      targetDate: formData.targetDate,
      priority: formData.priority,
    };

    if (initialData) {
      updateSavingsGoal({ ...goalData, id: initialData.id });
    } else {
      addSavingsGoal(goalData);
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Nombre de la Meta"
        type="text"
        value={formData.name}
        onChange={value => setFormData({ ...formData, name: value })}
        error={errors.name}
        placeholder="Ej: Viaje a Japón"
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Cantidad Objetivo"
          type="number"
          value={formData.targetAmount}
          onChange={value => setFormData({ ...formData, targetAmount: value })}
          error={errors.targetAmount}
          placeholder="1000"
          required
        />
        <FormField
          label="Cantidad Actual"
          type="number"
          value={formData.currentAmount}
          onChange={value => setFormData({ ...formData, currentAmount: value })}
          error={errors.currentAmount}
          placeholder="0"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Fecha Objetivo"
          type="date"
          value={formData.targetDate}
          onChange={value => setFormData({ ...formData, targetDate: value })}
          error={errors.targetDate}
          required
        />
        <FormField
          label="Prioridad"
          type="select"
          value={formData.priority}
          onChange={value =>
            setFormData({ ...formData, priority: value as 'high' | 'medium' | 'low' })
          }
          options={[
            { value: 'low', label: 'Baja' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' },
          ]}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          {initialData ? 'Actualizar' : 'Crear'} Meta
        </Button>
      </div>
    </form>
  );
};

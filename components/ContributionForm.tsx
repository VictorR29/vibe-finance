import React, { useState } from 'react';
import { Button } from './ui/Button';
import { FormField } from './ui/FormField';
import { SavingsGoal } from '../types';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/Toast';

interface ContributionFormProps {
  goal: SavingsGoal;
  onSubmit: () => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({ goal, onSubmit }) => {
  const { updateSavingsGoal, state } = useAppContext();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contributionAmount = Number(amount);
    if (!amount || isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    // Calcular el nuevo monto actual
    const newCurrentAmount = goal.currentAmount + contributionAmount;

    // Validar que no exceda el objetivo
    if (newCurrentAmount > goal.targetAmount) {
      setError(
        `El aporte excede el objetivo. Máximo permitido: ${goal.targetAmount - goal.currentAmount}`
      );
      return;
    }

    // Actualizar la meta (esto automáticamente crea la transacción)
    updateSavingsGoal({
      ...goal,
      currentAmount: newCurrentAmount,
    });

    showToast(`Aporte de ${amount} agregado a "${goal.name}"`, 'success');
    setAmount('');
    setError('');
    onSubmit();
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Meta: <span className="font-semibold text-gray-900 dark:text-white">{goal.name}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Progreso actual: <span className="font-semibold text-primary">{goal.currentAmount}</span>{' '}
          / {goal.targetAmount}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Faltan: {remainingAmount} para completar la meta
        </p>
      </div>

      <FormField
        label="Monto a aportar"
        type="number"
        value={amount}
        onChange={value => {
          setAmount(value);
          setError('');
        }}
        error={error}
        placeholder={`Máximo: ${remainingAmount}`}
        required
        autoFocus
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          Agregar Aporte
        </Button>
      </div>
    </form>
  );
};

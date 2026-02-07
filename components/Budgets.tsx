import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ConfirmModal } from './ui/ConfirmModal';
import { BudgetForm } from './BudgetForm';
import { Budget, Transaction } from '../types';
import { formatCurrency } from '../utils/format';
import { Edit, Trash2, PlusCircle, ShieldAlert, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';

const getSpentAmount = (category: string, transactions: Transaction[]): number => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return transactions
    .filter(
      t =>
        t.category === category &&
        t.type === 'expense' &&
        new Date(t.date) >= firstDay &&
        new Date(t.date) <= lastDay
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

const getPeriodLabel = (period: string): string => {
  switch (period) {
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensual';
    case 'yearly':
      return 'Anual';
    default:
      return period;
  }
};

const BudgetCard: React.FC<{
  budget: Budget;
  spent: number;
  currency: string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}> = ({ budget, spent, currency, onEdit, onDelete }) => {
  const progress = Math.min((spent / budget.limit) * 100, 100);

  const getProgressColor = () => {
    if (progress > 90) return 'bg-error';
    if (progress > 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-100">
            {budget.category}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Calendar className="w-3 h-3" />
            <span>{getPeriodLabel(budget.period)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)} className="p-1 h-auto">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(budget.id)}
            className="p-1 h-auto text-error"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={cn('h-4 rounded-full', getProgressColor())}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">
            {formatCurrency(spent, currency)} gastado
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            Límite: {formatCurrency(budget.limit, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Budgets: React.FC = () => {
  const { state, deleteBudget } = useAppContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const openModal = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const handleDeleteBudget = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id);
      showToast('Presupuesto eliminado correctamente', 'success');
      setDeletingBudget(null);
    }
  };

  const budgetsWithSpent = useMemo(() => {
    return state.budgets
      .map(budget => ({
        ...budget,
        spent: getSpentAmount(budget.category, state.transactions),
      }))
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
  }, [state.budgets, state.transactions]);

  return (
    <>
      <Card
        title="Presupuestos"
        actions={
          <Button onClick={() => openModal()}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Añadir Presupuesto
          </Button>
        }
      >
        {budgetsWithSpent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetsWithSpent.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={budget.spent}
                currency={state.currency}
                onEdit={openModal}
                onDelete={() => setDeletingBudget(budget)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Sin Presupuestos Definidos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Crea presupuestos para controlar tus gastos por categoría.
            </p>
            <Button onClick={() => openModal()} className="mt-4">
              Crear mi primer presupuesto
            </Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      >
        <BudgetForm onSubmit={closeModal} initialData={editingBudget} />
      </Modal>

      <ConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteBudget}
        title="Eliminar Presupuesto"
        message="¿Estás seguro de que deseas eliminar este presupuesto? Ya no se realizará el seguimiento de los gastos en esta categoría."
        itemName={deletingBudget?.category}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};

export default Budgets;

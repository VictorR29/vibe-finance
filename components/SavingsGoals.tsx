
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { SavingsGoalForm } from './SavingsGoalForm';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Edit, Trash2, PlusCircle, Target } from 'lucide-react';
import { cn } from '../utils/cn';

const priorityClasses = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

const SavingsGoalCard: React.FC<{ goal: SavingsGoal, currency: string, onEdit: (goal: SavingsGoal) => void, onDelete: (id: string) => void }> = ({ goal, currency, onEdit, onDelete }) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Objetivo: {formatDate(goal.targetDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                     <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityClasses[goal.priority])}>
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(goal)} className="p-1 h-auto"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)} className="p-1 h-auto text-error"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>
             <div className="space-y-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-primary h-4 rounded-full text-center text-white text-xs flex items-center justify-center" style={{ width: `${progress}%` }}>
                        {Math.round(progress)}%
                    </div>
                </div>
                <div className="text-sm text-center text-gray-600 dark:text-gray-300">
                    {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                </div>
            </div>
        </div>
    )
}

const SavingsGoals: React.FC = () => {
    const { state, deleteSavingsGoal } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

    const openModal = (goal?: SavingsGoal) => {
        setEditingGoal(goal || null);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingGoal(null);
        setIsModalOpen(false);
    };
    
    return (
        <>
            <Card
                title="Metas de Ahorro"
                actions={
                    <Button onClick={() => openModal()}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Añadir Meta
                    </Button>
                }
            >
                {state.savingsGoals.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {state.savingsGoals.map((goal) => (
                           <SavingsGoalCard key={goal.id} goal={goal} currency={state.currency} onEdit={openModal} onDelete={deleteSavingsGoal} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <Target className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aún no tienes metas de ahorro</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">¡Define tu primer objetivo para empezar a ahorrar!</p>
                        <Button onClick={() => openModal()} className="mt-4">Crear mi primera meta</Button>
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}>
                <SavingsGoalForm onSubmit={closeModal} initialData={editingGoal} />
            </Modal>
        </>
    );
};

export default SavingsGoals;

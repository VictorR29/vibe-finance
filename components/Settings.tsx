
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Download, Upload, Trash2, Plus, AlertTriangle, CheckCircle, Tag, X } from 'lucide-react';

export const Settings: React.FC = () => {
    const { state, addCategory, deleteCategory, importData } = useAppContext();
    const [newCategory, setNewCategory] = useState('');
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Export Logic
    const handleExport = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `vibe-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Import Logic
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Basic validation
                if (json.transactions && Array.isArray(json.transactions)) {
                    importData(json);
                    setImportStatus('success');
                    setTimeout(() => setImportStatus('idle'), 3000);
                } else {
                    throw new Error('Invalid format');
                }
            } catch (error) {
                console.error("Import error", error);
                setImportStatus('error');
                setTimeout(() => setImportStatus('idle'), 3000);
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    // Category Logic
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            addCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    // Check if category is in use
    const isCategoryInUse = (category: string): boolean => {
        const hasTransactions = state.transactions.some(t => t.category === category);
        const hasBudgets = state.budgets.some(b => b.category === category);
        return hasTransactions || hasBudgets;
    };

    const handleDeleteCategory = (category: string) => {
        if (isCategoryInUse(category)) {
            const transactionCount = state.transactions.filter(t => t.category === category).length;
            const budgetCount = state.budgets.filter(b => b.category === category).length;
            
            let errorMsg = `No puedes eliminar "${category}" porque está en uso.`;
            if (transactionCount > 0) {
                errorMsg += ` Tiene ${transactionCount} transacción(es).`;
            }
            if (budgetCount > 0) {
                errorMsg += ` Está asignada a ${budgetCount} presupuesto(s).`;
            }
            
            setCategoryError(errorMsg);
            setTimeout(() => setCategoryError(null), 5000);
            return;
        }
        
        deleteCategory(category);
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Section */}
                <Card title="Copia de Seguridad">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tus datos se guardan en este dispositivo. Para no perderlos si cambias de móvil o borras el historial, descarga una copia de seguridad frecuentemente.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleExport} variant="primary" className="w-full justify-between">
                                <span>Descargar Copia (Exportar)</span>
                                <Download className="w-4 h-4" />
                            </Button>
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept=".json" 
                                    className="hidden" 
                                />
                                <Button onClick={handleImportClick} variant="secondary" className="w-full justify-between">
                                    <span>Restaurar Copia (Importar)</span>
                                    <Upload className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {importStatus === 'success' && (
                            <div className="flex items-center gap-2 text-success text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                                Datos restaurados correctamente.
                            </div>
                        )}
                        {importStatus === 'error' && (
                            <div className="flex items-center gap-2 text-error text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                                Error al leer el archivo. Asegúrate que sea un backup válido.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Categories Section */}
                <Card title="Gestionar Categorías">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Añade categorías personalizadas para organizar mejor tus gastos e ingresos.
                    </p>

                    {categoryError && (
                        <div className="flex items-start gap-2 text-error text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{categoryError}</span>
                            <button onClick={() => setCategoryError(null)} className="text-error hover:text-error-hover">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nueva categoría..."
                            className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                        />
                        <Button type="submit" size="icon" disabled={!newCategory.trim()}>
                            <Plus className="w-5 h-5" />
                        </Button>
                    </form>

                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {state.categories.map((cat) => (
                            <div key={cat} className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <Tag className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                                <button 
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="text-gray-400 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                    title={isCategoryInUse(cat) ? 'Categoría en uso - no se puede eliminar' : 'Eliminar categoría'}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};


import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, actions }) => {
  return (
    <div className={cn(
      'bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl', 
      className
    )}>
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-gray-200/50 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {title && <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

interface CardStatProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string; // e.g., "bg-emerald-500"
}

// Map basic bg colors to a glowing style
const getColorStyles = (colorClass: string) => {
    // Extract color name like 'emerald', 'rose', 'primary'
    if(colorClass.includes('primary')) return {
        bg: 'bg-primary/20 dark:bg-primary/40',
        text: 'text-primary dark:text-indigo-200',
        glow: 'bg-primary'
    };
    if(colorClass.includes('emerald')) return {
        bg: 'bg-emerald-500/20 dark:bg-emerald-500/40',
        text: 'text-emerald-600 dark:text-emerald-200',
        glow: 'bg-emerald-500'
    };
    if(colorClass.includes('rose')) return {
        bg: 'bg-rose-500/20 dark:bg-rose-500/40',
        text: 'text-rose-600 dark:text-rose-200',
        glow: 'bg-rose-500'
    };
    if(colorClass.includes('purple')) return {
        bg: 'bg-purple-500/20 dark:bg-purple-500/40',
        text: 'text-purple-600 dark:text-purple-200',
        glow: 'bg-purple-500'
    };
    // Default
    return {
        bg: 'bg-gray-500/20 dark:bg-gray-500/40',
        text: 'text-gray-600 dark:text-gray-200',
        glow: 'bg-gray-500'
    };
};

export const CardStat: React.FC<CardStatProps> = ({ label, value, icon, color }) => {
    const styles = getColorStyles(color);

    return (
        <div className="relative overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/30 dark:border-white/10 p-5 rounded-3xl shadow-lg group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${styles.bg} ${styles.text} shadow-inner group-hover:scale-110 transition-transform duration-300 backdrop-blur-md border border-white/10`}>
                    {icon}
                </div>
            </div>
            {/* Decorative bright circle for dark mode visibility */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${styles.glow} opacity-20 dark:opacity-40 blur-2xl group-hover:opacity-30 dark:group-hover:opacity-60 transition-opacity`}></div>
        </div>
    );
};

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import {
  LayoutDashboard,
  Wallet,
  Bot,
  Sun,
  Moon,
  Target,
  Shield,
  Settings as SettingsIcon,
  TrendingUp,
} from 'lucide-react';
import { cn } from './utils/cn';
import { Theme } from './types';
import { ToastProvider } from './components/ui/Toast';
import {
  DashboardSkeleton,
  TransactionListSkeleton,
  BudgetsSkeleton,
  SavingsGoalsSkeleton,
  SettingsSkeleton,
} from './components/ui/Skeleton';

// Create a simple Trends skeleton
const TrendsSkeleton: React.FC = () => (
  <div className="space-y-6 pb-20 md:pb-0">
    <div className="flex justify-between items-center">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
  </div>
);

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const TransactionList = lazy(() => import('./components/TransactionList'));
const SavingsGoals = lazy(() => import('./components/SavingsGoals'));
const Budgets = lazy(() => import('./components/Budgets'));
const Settings = lazy(() => import('./components/Settings'));
const Trends = lazy(() => import('./components/Trends'));

type View = 'dashboard' | 'transactions' | 'savingsGoals' | 'budgets' | 'trends' | 'settings';

const MainApp: React.FC = () => {
  const { state, setTheme, isLoading } = useAppContext();
  const [activeView, setActiveView] = useState<View>('dashboard');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(state.theme);
  }, [state.theme]);

  const handleThemeToggle = () => {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const renderContent = () => {
    if (isLoading) {
      switch (activeView) {
        case 'dashboard':
          return <DashboardSkeleton />;
        case 'transactions':
          return <TransactionListSkeleton />;
        case 'savingsGoals':
          return <SavingsGoalsSkeleton />;
        case 'budgets':
          return <BudgetsSkeleton />;
        case 'trends':
          return <TrendsSkeleton />;
        case 'settings':
          return <SettingsSkeleton />;
        default:
          return <DashboardSkeleton />;
      }
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionList />;
      case 'savingsGoals':
        return <SavingsGoals />;
      case 'budgets':
        return <Budgets />;
      case 'trends':
        return <Trends />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const NavItem = ({
    view,
    icon,
    label,
    mobile = false,
  }: {
    view: View;
    icon: React.ReactElement<any>;
    label: string;
    mobile?: boolean;
  }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={cn(
          'flex items-center transition-all duration-300 group',
          mobile ? 'flex-col justify-center p-2 rounded-xl' : 'w-full px-4 py-3 rounded-xl mb-1',
          isActive
            ? mobile
              ? 'text-primary'
              : 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
        )}
      >
        <div
          className={cn(
            'transition-transform duration-200',
            isActive && mobile ? '-translate-y-1' : ''
          )}
        >
          {React.cloneElement(icon, {
            className: cn('w-6 h-6', mobile ? '' : 'mr-3'),
          })}
        </div>
        <span className={cn('font-medium', mobile ? 'text-[10px] mt-1' : 'text-sm')}>{label}</span>
        {mobile && isActive && (
          <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full mb-1"></div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar (Glassmorphism) */}
      <aside className="hidden md:flex w-72 flex-col p-4 z-20">
        <div className="h-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl flex flex-col shadow-2xl">
          <div className="h-24 flex items-center px-8 border-b border-gray-200/50 dark:border-white/5">
            <div className="bg-gradient-to-tr from-primary to-purple-500 p-2 rounded-xl shadow-lg mr-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Vibe
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Menu
            </p>
            <NavItem view="dashboard" icon={<LayoutDashboard />} label="Dashboard" />
            <NavItem view="transactions" icon={<Wallet />} label="Transacciones" />
            <NavItem view="savingsGoals" icon={<Target />} label="Metas" />
            <NavItem view="budgets" icon={<Shield />} label="Presupuestos" />
            <NavItem view="trends" icon={<TrendingUp />} label="Tendencias" />

            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
              Sistema
            </p>
            <NavItem view="settings" icon={<SettingsIcon />} label="Configuración" />
          </nav>

          <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
            <button
              onClick={handleThemeToggle}
              className="flex items-center w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200"
            >
              {state.theme === 'light' ? (
                <Moon className="w-5 h-5 mr-3" />
              ) : (
                <Sun className="w-5 h-5 mr-3" />
              )}
              <span className="text-sm font-medium">
                {state.theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-full">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0">
          <div className="flex items-center">
            <div className="bg-gradient-to-tr from-primary to-purple-500 p-1.5 rounded-lg shadow mr-2">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Vibe</span>
          </div>
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
          >
            {state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">{renderContent()}</div>
        </div>

        {/* Mobile Bottom Navigation (Glassmorphism) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
            <NavItem view="dashboard" icon={<LayoutDashboard />} label="Inicio" mobile />
            <NavItem view="transactions" icon={<Wallet />} label="Transacc." mobile />
            <NavItem view="savingsGoals" icon={<Target />} label="Metas" mobile />
            <NavItem view="budgets" icon={<Shield />} label="Presup." mobile />
            <NavItem view="trends" icon={<TrendingUp />} label="Tendencias" mobile />
          </div>
        </nav>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AppProvider>
  );
};

export default App;

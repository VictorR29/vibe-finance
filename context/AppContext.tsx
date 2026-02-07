import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { AppState, AppAction, Transaction, SavingsGoal, Budget, Theme, Account } from '../types';
import { loadStateFromDB, saveStateToDB } from '../utils/db';
import { generateId } from '../utils/idGenerator';

const initialCategories = [
  'Comida',
  'Transporte',
  'Vivienda',
  'Ocio',
  'Salud',
  'Educación',
  'Salario',
  'Meta de Ahorro',
  'Otros',
];

const defaultAccount: Account = {
  id: 'default',
  name: 'Cuenta Principal',
  type: 'checking',
  currency: 'EUR',
  initialBalance: 0,
  color: '#6366f1',
  isActive: true,
  createdAt: new Date().toISOString(),
};

const initialState: AppState = {
  transactions: [],
  accounts: [defaultAccount],
  savingsGoals: [],
  budgets: [],
  categories: initialCategories,
  theme: 'light',
  currency: 'EUR',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a => (a.id === action.payload.id ? action.payload : a)),
      };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };
    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case 'DELETE_SAVINGS_GOAL':
      return { ...state, savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload) };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b => (b.id === action.payload.id ? action.payload : b)),
      };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    case 'ADD_CATEGORY':
      if (state.categories.includes(action.payload)) return state;
      return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c !== action.payload) };
    case 'LOAD_DATA':
      // Migration: ensure accounts array exists and calculate real balance
      let migratedAccounts = action.payload.accounts;
      if (!migratedAccounts || migratedAccounts.length === 0) {
        // Calculate current balance from existing transactions
        const transactions = action.payload.transactions || [];
        const income = transactions
          .filter((t: Transaction) => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const expenses = transactions
          .filter((t: Transaction) => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const currentBalance = income - expenses;

        migratedAccounts = [
          {
            ...defaultAccount,
            initialBalance: currentBalance,
            currency: action.payload.currency || 'EUR',
          },
        ];
      }
      const migratedState = {
        ...action.payload,
        accounts: migratedAccounts,
      };
      return migratedState;
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  importData: (data: AppState) => void;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const storedState = await loadStateFromDB();
        if (storedState) {
          const mergedState = { ...initialState, ...storedState };
          if (!mergedState.categories || mergedState.categories.length === 0) {
            mergedState.categories = initialCategories;
          }
          // Migration: ensure accounts array exists with real balance
          if (!mergedState.accounts || mergedState.accounts.length === 0) {
            const transactions = mergedState.transactions || [];
            const income = transactions
              .filter((t: Transaction) => t.type === 'income')
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            const expenses = transactions
              .filter((t: Transaction) => t.type === 'expense')
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            const currentBalance = income - expenses;

            mergedState.accounts = [
              {
                ...defaultAccount,
                initialBalance: currentBalance,
                currency: mergedState.currency || 'EUR',
              },
            ];
          }
          dispatch({ type: 'LOAD_DATA', payload: mergedState });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    initData();
  }, []);

  // Save data to IndexedDB with debounce
  useEffect(() => {
    if (!isInitialized) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToDB(state).catch(error => {
        console.error('Error saving state:', error);
      });
    }, 1000); // 1 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isInitialized]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: { ...transaction, id: generateId() } });
  }, []);

  const updateTransaction = useCallback((transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: { ...account, id: generateId() } });
  }, []);

  const updateAccount = useCallback((account: Account) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  }, []);

  const addSavingsGoal = useCallback(
    (goal: Omit<SavingsGoal, 'id'>) => {
      const newGoal = { ...goal, id: generateId() };
      dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newGoal });

      if (goal.currentAmount > 0) {
        // Get the default account or the first active account
        const defaultAcc = state.accounts.find(a => a.isActive) || state.accounts[0];
        const transaction: Omit<Transaction, 'id'> = {
          amount: goal.currentAmount,
          category: 'Meta de Ahorro',
          description: `Inicio de meta: ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          accountId: defaultAcc?.id || 'default',
        };
        dispatch({ type: 'ADD_TRANSACTION', payload: { ...transaction, id: generateId() } });
      }
    },
    [state.accounts]
  );

  const updateSavingsGoal = useCallback(
    (goal: SavingsGoal) => {
      // Handle contribution transaction first (before updating the goal)
      const originalGoal = state.savingsGoals.find(g => g.id === goal.id);
      if (originalGoal) {
        const contributionAmount = goal.currentAmount - originalGoal.currentAmount;
        if (contributionAmount > 0) {
          // Get the default account or the first active account
          const defaultAcc = state.accounts.find(a => a.isActive) || state.accounts[0];
          const transaction: Omit<Transaction, 'id'> = {
            amount: contributionAmount,
            category: 'Meta de Ahorro',
            description: `Aporte a meta: ${goal.name}`,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            accountId: defaultAcc?.id || 'default',
          };
          dispatch({ type: 'ADD_TRANSACTION', payload: { ...transaction, id: generateId() } });
        }
      }

      // Then update the goal
      dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal });
    },
    [state.savingsGoals, state.accounts]
  );

  const deleteSavingsGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    dispatch({ type: 'ADD_BUDGET', payload: { ...budget, id: generateId() } });
  }, []);

  const updateBudget = useCallback((budget: Budget) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  }, []);

  const addCategory = useCallback((category: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  }, []);

  const deleteCategory = useCallback((category: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: category });
  }, []);

  const importData = useCallback((data: AppState) => {
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setCurrency = useCallback((currency: string) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      state,
      dispatch,
      isLoading: !isInitialized,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addBudget,
      updateBudget,
      deleteBudget,
      addCategory,
      deleteCategory,
      importData,
      setTheme,
      setCurrency,
    }),
    [
      state,
      isInitialized,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addBudget,
      updateBudget,
      deleteBudget,
      addCategory,
      deleteCategory,
      importData,
      setTheme,
      setCurrency,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

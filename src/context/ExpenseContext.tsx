// Expense Data Context - Manages expenses, budgets, and bills

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Expense, Budget, Bill } from '../types';
import { getCurrentPeriod } from '../utils/helpers';

interface ExpenseContextType {
    expenses: Expense[];
    budgets: Budget[];
    bills: Bill[];
    currentBudget: Budget | null;
    loading: boolean;
    error: string | null;

    // Expense operations
    addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;

    // Budget operations
    createBudget: (amount: number) => Promise<void>;
    updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;

    // Bill operations
    addBill: (bill: Omit<Bill, 'id' | 'userId'>) => Promise<void>;
    updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
    deleteBill: (id: string) => Promise<void>;
    markBillPaid: (id: string, isPaid: boolean) => Promise<void>;

    // Category budget helpers
    getCategorySpending: (categoryName: string, budgetPeriodId?: string) => number;
    getCategoryExpenses: (categoryName: string, budgetPeriodId?: string) => Expense[];
    getTotalExpenses: (budgetPeriodId?: string) => number;
    getTotalBills: () => number;

    clearError: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};

interface ExpenseProviderProps {
    children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
    const { user, userProfile } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert Firestore timestamp to Date
    const timestampToDate = (timestamp: unknown): Date => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        return new Date(timestamp as string | number);
    };

    // Subscribe to expenses
    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expenseData: Expense[] = snapshot.docs.map(docSnapshot => ({
                ...docSnapshot.data(),
                id: docSnapshot.id,
                date: timestampToDate(docSnapshot.data().date),
                createdAt: timestampToDate(docSnapshot.data().createdAt),
            } as Expense));

            setExpenses(expenseData);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching expenses:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to budgets
    useEffect(() => {
        if (!user) {
            setBudgets([]);
            return;
        }

        const q = query(
            collection(db, 'budgets'),
            where('userId', '==', user.uid),
            orderBy('startDate', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const budgetData: Budget[] = snapshot.docs.map(docSnapshot => ({
                ...docSnapshot.data(),
                id: docSnapshot.id,
                startDate: timestampToDate(docSnapshot.data().startDate),
                endDate: timestampToDate(docSnapshot.data().endDate),
                createdAt: timestampToDate(docSnapshot.data().createdAt),
            } as Budget));

            setBudgets(budgetData);

            // Find current budget period
            const current = budgetData.find(b => {
                const start = new Date(b.startDate);
                const end = new Date(b.endDate);
                const now = new Date();
                return now >= start && now <= end;
            });

            setCurrentBudget(current || null);
        }, (err) => {
            console.error('Error fetching budgets:', err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to bills
    useEffect(() => {
        if (!user) {
            setBills([]);
            return;
        }

        const q = query(
            collection(db, 'bills'),
            where('userId', '==', user.uid),
            orderBy('dueDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const billData: Bill[] = snapshot.docs.map(docSnapshot => ({
                ...docSnapshot.data(),
                id: docSnapshot.id,
                paidDate: docSnapshot.data().paidDate ? timestampToDate(docSnapshot.data().paidDate) : undefined,
            } as Bill));

            setBills(billData);
        }, (err) => {
            console.error('Error fetching bills:', err);
            setError(err.message);
        });

        return () => unsubscribe();
    }, [user]);

    // Auto-create budget for current period if none exists
    useEffect(() => {
        if (user && userProfile && budgets.length === 0 && !loading) {
            createBudget(userProfile.settings?.income || 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userProfile, budgets, loading]);

    // Expense operations
    const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
        if (!user) return;

        try {
            let budgetPeriodId = expense.budgetPeriodId;

            // If no budget period, create one or use current
            if (!budgetPeriodId && currentBudget) {
                budgetPeriodId = currentBudget.id;
            }

            await addDoc(collection(db, 'expenses'), {
                ...expense,
                userId: user.uid,
                budgetPeriodId: budgetPeriodId || '',
                date: Timestamp.fromDate(new Date(expense.date)),
                createdAt: Timestamp.now(),
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const updateExpense = async (id: string, updates: Partial<Expense>) => {
        try {
            const expenseRef = doc(db, 'expenses', id);
            const updateData: Record<string, unknown> = { ...updates };
            if (updates.date) {
                updateData.date = Timestamp.fromDate(new Date(updates.date));
            }
            await updateDoc(expenseRef, updateData);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    // Budget operations
    const createBudget = async (amount: number) => {
        if (!user) return;

        try {
            // Get cycle settings from user profile
            const cycleType = userProfile?.settings?.budgetCycle || 'semi-monthly';
            const cycleStartDay = userProfile?.settings?.cycleStartDay || 1;
            const period = getCurrentPeriod(new Date(), cycleType, cycleStartDay);

            await addDoc(collection(db, 'budgets'), {
                userId: user.uid,
                amount,
                startDate: Timestamp.fromDate(period.start),
                endDate: Timestamp.fromDate(period.end),
                createdAt: Timestamp.now(),
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const updateBudget = async (id: string, updates: Partial<Budget>) => {
        try {
            const budgetRef = doc(db, 'budgets', id);
            await updateDoc(budgetRef, updates);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    // Bill operations
    const addBill = async (bill: Omit<Bill, 'id' | 'userId'>) => {
        if (!user) return;

        try {
            await addDoc(collection(db, 'bills'), {
                ...bill,
                userId: user.uid,
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const updateBill = async (id: string, updates: Partial<Bill>) => {
        try {
            const billRef = doc(db, 'bills', id);
            await updateDoc(billRef, updates);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const deleteBill = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'bills', id));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    const markBillPaid = async (id: string, isPaid: boolean) => {
        try {
            const billRef = doc(db, 'bills', id);
            await updateDoc(billRef, {
                isPaid,
                paidDate: isPaid ? Timestamp.now() : null,
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    };

    // Category budget helper functions
    const getCategorySpending = (categoryName: string, budgetPeriodId?: string): number => {
        return expenses
            .filter(e => {
                const matchesCategory = e.category.toLowerCase() === categoryName.toLowerCase();
                const matchesPeriod = !budgetPeriodId || e.budgetPeriodId === budgetPeriodId;
                return matchesCategory && matchesPeriod;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const getCategoryExpenses = (categoryName: string, budgetPeriodId?: string): Expense[] => {
        return expenses.filter(e => {
            const matchesCategory = e.category.toLowerCase() === categoryName.toLowerCase();
            const matchesPeriod = !budgetPeriodId || e.budgetPeriodId === budgetPeriodId;
            return matchesCategory && matchesPeriod;
        });
    };

    const getTotalExpenses = (budgetPeriodId?: string): number => {
        return expenses
            .filter(e => !budgetPeriodId || e.budgetPeriodId === budgetPeriodId)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const getTotalBills = (): number => {
        return bills
            .filter(b => !b.isPaid)
            .reduce((sum, b) => sum + b.amount, 0);
    };

    const clearError = () => setError(null);

    const value: ExpenseContextType = {
        expenses,
        budgets,
        bills,
        currentBudget,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        createBudget,
        updateBudget,
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        getCategorySpending,
        getCategoryExpenses,
        getTotalExpenses,
        getTotalBills,
        clearError,
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

// Utility functions for the expense tracker

import {
    startOfWeek,
    endOfWeek,
    subWeeks,
    format,
    isWithinInterval,
    getDaysInMonth,
    differenceInDays
} from 'date-fns';
import type { Expense, Budget, WeeklyComparison, ExpenseCategory } from '../types';

// Format currency in Philippine Peso
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Get the current budget period based on cycle type and start day
export const getCurrentPeriod = (
    date: Date = new Date(),
    cycleType: string = 'semi-monthly',
    cycleStartDay: number = 1
): { start: Date; end: Date } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const lastDayOfMonth = getDaysInMonth(date);

    switch (cycleType) {
        case 'weekly': {
            // cycleStartDay is 1-7 (1=Monday, 7=Sunday)
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
            // Convert cycleStartDay to JS format (0=Sunday)
            const startDayJS = cycleStartDay === 7 ? 0 : cycleStartDay;

            // Calculate days since the last start day
            let daysSinceStart = (dayOfWeek - startDayJS + 7) % 7;
            const start = new Date(date);
            start.setDate(date.getDate() - daysSinceStart);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);

            return { start, end };
        }

        case 'semi-monthly': {
            // Second reset date is cycleStartDay + 15 (wraps around month if needed)
            const secondDay = cycleStartDay > 15 ? cycleStartDay - 15 : cycleStartDay + 15;
            const effectiveSecondDay = Math.min(secondDay, lastDayOfMonth);
            const effectiveStartDay = Math.min(cycleStartDay, lastDayOfMonth);

            if (day >= effectiveStartDay && day < effectiveSecondDay) {
                // First half period
                return {
                    start: new Date(year, month, effectiveStartDay, 0, 0, 0, 0),
                    end: new Date(year, month, effectiveSecondDay - 1, 23, 59, 59, 999),
                };
            } else if (day >= effectiveSecondDay) {
                // Second half period - ends day before start day next month
                const nextMonth = month + 1;
                const nextYear = nextMonth > 11 ? year + 1 : year;
                const nextMonthNormalized = nextMonth > 11 ? 0 : nextMonth;
                const nextMonthDays = getDaysInMonth(new Date(nextYear, nextMonthNormalized, 1));
                const nextStartDay = Math.min(cycleStartDay, nextMonthDays);

                return {
                    start: new Date(year, month, effectiveSecondDay, 0, 0, 0, 0),
                    end: new Date(nextYear, nextMonthNormalized, nextStartDay - 1, 23, 59, 59, 999),
                };
            } else {
                // Before start day this month - we're in previous month's second half
                const prevMonth = month - 1;
                const prevYear = prevMonth < 0 ? year - 1 : year;
                const prevMonthNormalized = prevMonth < 0 ? 11 : prevMonth;
                const prevMonthDays = getDaysInMonth(new Date(prevYear, prevMonthNormalized, 1));
                const prevSecondDay = cycleStartDay > 15 ? cycleStartDay - 15 : cycleStartDay + 15;
                const effectivePrevSecondDay = Math.min(prevSecondDay, prevMonthDays);

                return {
                    start: new Date(prevYear, prevMonthNormalized, effectivePrevSecondDay, 0, 0, 0, 0),
                    end: new Date(year, month, effectiveStartDay - 1, 23, 59, 59, 999),
                };
            }
        }

        case 'monthly': {
            const effectiveStartDay = Math.min(cycleStartDay, lastDayOfMonth);

            if (day >= effectiveStartDay) {
                // Current month's period
                const nextMonth = month + 1;
                const nextYear = nextMonth > 11 ? year + 1 : year;
                const nextMonthNormalized = nextMonth > 11 ? 0 : nextMonth;
                const nextMonthDays = getDaysInMonth(new Date(nextYear, nextMonthNormalized, 1));
                const nextStartDay = Math.min(cycleStartDay, nextMonthDays);

                return {
                    start: new Date(year, month, effectiveStartDay, 0, 0, 0, 0),
                    end: new Date(nextYear, nextMonthNormalized, nextStartDay - 1, 23, 59, 59, 999),
                };
            } else {
                // Previous month's period
                const prevMonth = month - 1;
                const prevYear = prevMonth < 0 ? year - 1 : year;
                const prevMonthNormalized = prevMonth < 0 ? 11 : prevMonth;
                const prevMonthDays = getDaysInMonth(new Date(prevYear, prevMonthNormalized, 1));
                const prevStartDay = Math.min(cycleStartDay, prevMonthDays);

                return {
                    start: new Date(prevYear, prevMonthNormalized, prevStartDay, 0, 0, 0, 0),
                    end: new Date(year, month, effectiveStartDay - 1, 23, 59, 59, 999),
                };
            }
        }

        case 'quarterly': {
            // Quarterly: 3 months starting from cycle start day
            const quarterMonth = Math.floor(month / 3) * 3;
            const effectiveStartDay = Math.min(cycleStartDay, getDaysInMonth(new Date(year, quarterMonth, 1)));
            const quarterStart = new Date(year, quarterMonth, effectiveStartDay, 0, 0, 0, 0);

            const nextQuarterMonth = quarterMonth + 3;
            const nextYear = nextQuarterMonth > 11 ? year + 1 : year;
            const nextQuarterNormalized = nextQuarterMonth > 11 ? nextQuarterMonth - 12 : nextQuarterMonth;
            const nextStartDay = Math.min(cycleStartDay, getDaysInMonth(new Date(nextYear, nextQuarterNormalized, 1)));
            const quarterEnd = new Date(nextYear, nextQuarterNormalized, nextStartDay - 1, 23, 59, 59, 999);

            return { start: quarterStart, end: quarterEnd };
        }

        case 'yearly': {
            // Yearly: 12 months starting from cycle start day of January
            const effectiveStartDay = Math.min(cycleStartDay, 31);
            const yearStart = new Date(year, 0, effectiveStartDay, 0, 0, 0, 0);

            if (date < yearStart) {
                // Before start day this year - use last year's period
                return {
                    start: new Date(year - 1, 0, effectiveStartDay, 0, 0, 0, 0),
                    end: new Date(year, 0, effectiveStartDay - 1, 23, 59, 59, 999),
                };
            }

            return {
                start: yearStart,
                end: new Date(year + 1, 0, effectiveStartDay - 1, 23, 59, 59, 999),
            };
        }

        default:
            // Default to semi-monthly 1st-15th
            if (day <= 15) {
                return {
                    start: new Date(year, month, 1, 0, 0, 0, 0),
                    end: new Date(year, month, 15, 23, 59, 59, 999),
                };
            } else {
                return {
                    start: new Date(year, month, 16, 0, 0, 0, 0),
                    end: new Date(year, month, lastDayOfMonth, 23, 59, 59, 999),
                };
            }
    }
};

// Get the next payday
export const getNextPayday = (date: Date = new Date()): Date => {
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    if (day < 15) {
        return new Date(year, month, 15);
    } else if (day < 30) {
        const lastDay = getDaysInMonth(date);
        return new Date(year, month, Math.min(30, lastDay));
    } else {
        // After 30th, next payday is 15th of next month
        return new Date(year, month + 1, 15);
    }
};

// Get days remaining in current period
export const getDaysRemaining = (budget: Budget): number => {
    const today = new Date();
    const end = new Date(budget.endDate);
    return Math.max(0, differenceInDays(end, today) + 1);
};

// Calculate remaining budget
export const getRemainingBudget = (budget: Budget, expenses: Expense[]): number => {
    const totalSpent = expenses
        .filter(e => e.budgetPeriodId === budget.id)
        .reduce((sum, e) => sum + e.amount, 0);

    return budget.amount - totalSpent;
};

// Calculate daily spending limit based on remaining budget
export const getDailyLimit = (budget: Budget, expenses: Expense[]): number => {
    const remaining = getRemainingBudget(budget, expenses);
    const daysRemaining = getDaysRemaining(budget);
    return daysRemaining > 0 ? remaining / daysRemaining : 0;
};

// Get expenses for a specific week
export const getWeekExpenses = (expenses: Expense[], weekOffset: number = 0): Expense[] => {
    const targetDate = subWeeks(new Date(), weekOffset);
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
    });
};

// Calculate weekly comparison data
export const getWeeklyComparison = (expenses: Expense[]): WeeklyComparison => {
    const currentWeekExpenses = getWeekExpenses(expenses, 0);
    const previousWeekExpenses = getWeekExpenses(expenses, 1);

    const calculateWeekData = (weekExpenses: Expense[]) => {
        const total = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
        const byCategory: Partial<Record<ExpenseCategory, number>> = {};

        weekExpenses.forEach(expense => {
            byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
        });

        return {
            total,
            byCategory,
            dailyAverage: total / 7,
            expenses: weekExpenses,
        };
    };

    const currentWeek = calculateWeekData(currentWeekExpenses);
    const previousWeek = calculateWeekData(previousWeekExpenses);

    const percentageChange = previousWeek.total > 0
        ? ((currentWeek.total - previousWeek.total) / previousWeek.total) * 100
        : 0;

    return {
        currentWeek,
        previousWeek,
        percentageChange,
    };
};

// Format date for display
export const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM d, yyyy');
};

// Format date for grouping (Today, Yesterday, or date)
export const getDateLabel = (date: Date): string => {
    const today = new Date();
    const expenseDate = new Date(date);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    expenseDate.setHours(0, 0, 0, 0);

    const diff = differenceInDays(today, expenseDate);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return format(expenseDate, 'EEEE'); // Day name
    return format(expenseDate, 'MMM d');
};

// Generate a unique ID
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get progress percentage
export const getProgressPercentage = (spent: number, budget: number): number => {
    if (budget <= 0) return 0;
    return Math.min(100, (spent / budget) * 100);
};

// Get status color based on budget usage
export const getBudgetStatusColor = (percentage: number): string => {
    if (percentage < 50) return '#10B981'; // Green
    if (percentage < 75) return '#F59E0B'; // Yellow
    if (percentage < 90) return '#F97316'; // Orange
    return '#EF4444'; // Red
};

// Group expenses by date
export const groupExpensesByDate = (expenses: Expense[]): Map<string, Expense[]> => {
    const grouped = new Map<string, Expense[]>();

    const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedExpenses.forEach(expense => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
        const existing = grouped.get(dateKey) || [];
        grouped.set(dateKey, [...existing, expense]);
    });

    return grouped;
};

// Category Budget Helper Functions

// Calculate total spending for a specific category
export const calculateCategorySpending = (
    expenses: Expense[],
    categoryName: string,
    budgetPeriodId?: string
): number => {
    return expenses
        .filter(e => {
            const matchesCategory = e.category.toLowerCase() === categoryName.toLowerCase();
            const matchesPeriod = !budgetPeriodId || e.budgetPeriodId === budgetPeriodId;
            return matchesCategory && matchesPeriod;
        })
        .reduce((sum, e) => sum + e.amount, 0);
};

// Calculate category spending percentage
export const getCategoryPercentage = (spent: number, allocated: number): number => {
    if (allocated <= 0) return 0;
    return (spent / allocated) * 100;
};

// Check if category is over budget
export const isOverBudget = (spent: number, allocated: number): boolean => {
    return spent > allocated;
};

// Get total allocated budget across all categories
export const getTotalAllocatedBudget = (categoryBudgets: any[]): number => {
    return categoryBudgets.reduce((sum, cat) => sum + (cat.allocatedBudget || 0), 0);
};

// Get category info (handles both default and custom categories)
export const getCategoryDisplay = (
    category: string,
    customCategories: any[],
    defaultCategories: Record<string, any>
): { name: string; icon: string; color: string } => {
    // Check custom categories first
    const customCat = customCategories.find(c => c.name.toLowerCase() === category.toLowerCase());
    if (customCat) {
        return {
            name: customCat.name,
            icon: customCat.icon,
            color: customCat.color,
        };
    }

    // Fall back to default categories
    if (defaultCategories[category]) {
        return defaultCategories[category];
    }

    // Default fallback
    return {
        name: category,
        icon: '📦',
        color: '#6B7280',
    };
};


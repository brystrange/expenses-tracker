// Type definitions for Expense Tracker

// Budget Cycle Types
export type BudgetCycle =
  | 'weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// Expense Categories
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'healthcare'
  | 'bills'
  | 'other';

// Bill Categories
export type BillCategory =
  | 'utilities'
  | 'rent'
  | 'subscription'
  | 'loan'
  | 'insurance'
  | 'other';

// User Budget
export interface Budget {
  id: string;
  userId: string;
  amount: number;           // Budget amount for the cycle
  startDate: Date;          // Start of budget period
  endDate: Date;            // End of budget period
  createdAt: Date;
}

// Daily Expense
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;              // Can be ExpenseCategory or custom category name
  description: string;
  date: Date;
  budgetPeriodId: string;        // Links to current budget period
  createdAt: Date;
}

// Recurring Bill
export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number;          // Day of month (1-31)
  isPaid: boolean;
  paidDate?: Date;
  category: BillCategory;
  isRecurring: boolean;
}

// Category Budget - User-defined categories with allocated budgets
export interface CategoryBudget {
  id: string;                     // Unique identifier for the category
  name: string;                   // Category name (e.g., "Transportation", "Groceries")
  icon: string;                   // Emoji icon for the category
  color: string;                  // Hex color code for visual theming
  allocatedBudget: number;        // Budget allocated for this category
  createdAt: Date;
}

// User Settings for Budget Cycle
export interface UserSettings {
  budgetCycle: BudgetCycle;       // Selected cycle type
  cycleStartDay: number;          // Day to start the cycle (1-31 or 1-7 for weekly)
  income: number;                 // Income for the selected cycle
  dailySpendingLimit?: number;    // Optional override for daily limit
  currency: string;               // Currency code
  categoryBudgets: CategoryBudget[]; // User-defined category budgets
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: UserSettings;         // User's budget settings
  createdAt: Date;
}

// Default user settings
export const DEFAULT_SETTINGS: UserSettings = {
  budgetCycle: 'semi-monthly',
  cycleStartDay: 1,
  income: 0,
  currency: 'PHP',
  categoryBudgets: [],
};

// Weekly Comparison Data
export interface WeeklyComparison {
  currentWeek: {
    total: number;
    byCategory: Partial<Record<ExpenseCategory, number>>;
    dailyAverage: number;
    expenses: Expense[];
  };
  previousWeek: {
    total: number;
    byCategory: Partial<Record<ExpenseCategory, number>>;
    dailyAverage: number;
    expenses: Expense[];
  };
  percentageChange: number;
}

// Budget Cycle metadata for display
export interface CycleInfo {
  name: string;
  description: string;
  days: number;           // Approximate days in cycle
  incomeLabel: string;    // Label for income input
  spendingLimitLabel: string; // Label for spending limit display
}

export const CYCLE_INFO: Record<BudgetCycle, CycleInfo> = {
  weekly: {
    name: 'Weekly',
    description: 'Reset every week',
    days: 7,
    incomeLabel: 'Weekly Budget',
    spendingLimitLabel: 'Weekly Spending Limit',
  },
  'semi-monthly': {
    name: 'Semi-Monthly',
    description: 'Reset on 1st & 16th',
    days: 15,
    incomeLabel: 'Semi-Monthly Budget',
    spendingLimitLabel: 'Semi-Monthly Spending Limit',
  },
  monthly: {
    name: 'Monthly',
    description: 'Reset every month',
    days: 30,
    incomeLabel: 'Monthly Budget',
    spendingLimitLabel: 'Monthly Spending Limit',
  },
  quarterly: {
    name: 'Quarterly',
    description: 'Reset every 3 months',
    days: 90,
    incomeLabel: 'Quarterly Budget',
    spendingLimitLabel: 'Quarterly Spending Limit',
  },
  yearly: {
    name: 'Yearly',
    description: 'Reset every year',
    days: 365,
    incomeLabel: 'Yearly Budget',
    spendingLimitLabel: 'Yearly Spending Limit',
  },
};

// Category metadata for display
export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export const CATEGORY_INFO: Record<ExpenseCategory, CategoryInfo> = {
  food: { name: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  transport: { name: 'Transport', icon: '🚌', color: '#3B82F6' },
  utilities: { name: 'Utilities', icon: '⚡', color: '#8B5CF6' },
  entertainment: { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
  shopping: { name: 'Shopping', icon: '🛒', color: '#10B981' },
  healthcare: { name: 'Healthcare', icon: '💊', color: '#EF4444' },
  bills: { name: 'Bills', icon: '📋', color: '#6366F1' },
  other: { name: 'Other', icon: '📦', color: '#6B7280' },
};

export const BILL_CATEGORY_INFO: Record<BillCategory, CategoryInfo> = {
  utilities: { name: 'Utilities', icon: '⚡', color: '#8B5CF6' },
  rent: { name: 'Rent', icon: '🏠', color: '#F59E0B' },
  subscription: { name: 'Subscription', icon: '📱', color: '#3B82F6' },
  loan: { name: 'Loan', icon: '💰', color: '#EF4444' },
  insurance: { name: 'Insurance', icon: '🛡️', color: '#10B981' },
  other: { name: 'Other', icon: '📦', color: '#6B7280' },
};

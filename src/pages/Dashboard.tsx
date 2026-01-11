// Dashboard Page - Main expense overview with professional financial theme

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import {
    formatCurrency,
    getDaysRemaining,
    getProgressPercentage,
    getCurrentPeriod,
} from '../utils/helpers';
import { CYCLE_INFO } from '../types';
import type { Expense, Bill, CategoryBudget } from '../types';
import AddExpenseModal from '../components/AddExpenseModal';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

// SVG Icons as components
const WalletIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const DollarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const ReceiptIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 17V7" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

// Icon components for categories - uses icon ID (bolt, car, utensils, etc.)
const getIcon = (iconId: string) => {
    const icons: Record<string, React.ReactNode> = {
        utensils: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        car: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />
                <path d="M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />
                <path d="M5 17H3v-6l2-4h9l4 4h3v6h-2" />
                <line x1="9" y1="17" x2="15" y2="17" />
            </svg>
        ),
        bolt: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        film: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
            </svg>
        ),
        cart: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
        ),
        heart: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        file: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        ),
        piggy: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                <path d="M16 11h.01" />
            </svg>
        ),
        book: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        coffee: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
        ),
        home: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        plane: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
        ),
        gift: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
        ),
        phone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
        ),
        wifi: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
        ),
        gamepad: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="12" x2="10" y2="12" />
                <line x1="8" y1="10" x2="8" y2="14" />
                <line x1="15" y1="13" x2="15.01" y2="13" />
                <line x1="18" y1="11" x2="18.01" y2="11" />
                <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
        ),
        music: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
            </svg>
        ),
        dumbbell: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5h11" />
                <path d="M6.5 17.5h11" />
                <path d="M6.5 6.5v11" />
                <path d="M17.5 6.5v11" />
                <path d="M4 8v8" />
                <path d="M20 8v8" />
                <path d="M2 10v4" />
                <path d="M22 10v4" />
            </svg>
        ),
        baby: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h.01" />
                <path d="M15 12h.01" />
                <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
            </svg>
        ),
        circle: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
            </svg>
        ),
    };
    return icons[iconId] || icons.circle;
};

// Legacy category name to icon mapping for backwards compatibility with expenses
const getCategoryIcon = (category: string) => {
    const nameToIconMap: Record<string, string> = {
        food: 'utensils',
        transport: 'car',
        transportation: 'car',
        utilities: 'bolt',
        entertainment: 'film',
        shopping: 'cart',
        healthcare: 'heart',
        bills: 'file',
        savings: 'piggy',
        education: 'book',
    };
    const iconId = nameToIconMap[category.toLowerCase()] || 'circle';
    return getIcon(iconId);
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const { expenses, currentBudget, bills, loading, getCategorySpending, getTotalExpenses, getTotalBills } = useExpenses();
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Get cycle info for display
    const cycleInfo = userProfile?.settings?.budgetCycle
        ? CYCLE_INFO[userProfile.settings.budgetCycle]
        : CYCLE_INFO['semi-monthly'];

    // Get user's income and category budgets - no static fallback
    const income = userProfile?.settings?.income || 0;
    const categoryBudgets = userProfile?.settings?.categoryBudgets || [];
    const dailyBudget = userProfile?.settings?.dailySpendingLimit || (income > 0 ? income / (cycleInfo.days || 15) : 0);

    // Calculate dynamic period dates based on user's current settings
    const currentPeriod = useMemo(() => {
        const cycleType = userProfile?.settings?.budgetCycle || 'semi-monthly';
        const cycleStartDay = userProfile?.settings?.cycleStartDay || 1;
        return getCurrentPeriod(new Date(), cycleType, cycleStartDay);
    }, [userProfile?.settings?.budgetCycle, userProfile?.settings?.cycleStartDay]);

    // Calculate budget metrics
    const budgetMetrics = useMemo(() => {
        const totalExpenses = getTotalExpenses(currentBudget?.id);
        const totalBills = getTotalBills();
        const spent = totalExpenses;
        const remaining = income - spent;
        const daysRemaining = currentBudget ? getDaysRemaining(currentBudget) : 0;
        const percentage = getProgressPercentage(spent, income);

        return { spent, remaining, daysRemaining, percentage, totalBills };
    }, [income, currentBudget, getTotalExpenses, getTotalBills]);

    // Calculate category budget metrics
    const categoryMetrics = useMemo(() => {
        return categoryBudgets.map((category: CategoryBudget) => {
            const spent = getCategorySpending(category.name, currentBudget?.id);
            const percentage = category.allocatedBudget > 0 ? (spent / category.allocatedBudget) * 100 : 0;
            const overBudget = spent > category.allocatedBudget;
            const remaining = category.allocatedBudget - spent;

            return {
                ...category,
                spent,
                remaining,
                percentage,
                overBudget,
            };
        });
    }, [categoryBudgets, getCategorySpending, currentBudget]);

    // Get today's expenses
    const todayExpenses = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expenses.filter((e: Expense) => {
            const expenseDate = new Date(e.date);
            expenseDate.setHours(0, 0, 0, 0);
            return expenseDate.getTime() === today.getTime();
        });
    }, [expenses]);

    const todayTotal = todayExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

    // Get this period's expenses
    const periodExpenses = useMemo(() => {
        return expenses.filter((e: Expense) => e.budgetPeriodId === currentBudget?.id);
    }, [expenses, currentBudget]);

    // Group recent expenses by date - sorted oldest to newest
    const recentExpenses = useMemo(() => {
        // Sort by date oldest to newest
        const sorted = [...expenses]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 10);
        const groups: { date: string; dateLabel: string; total: number; expenses: Expense[] }[] = [];

        sorted.forEach(expense => {
            const date = new Date(expense.date);
            const dateKey = date.toISOString().split('T')[0];

            // Get date label
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expenseDate = new Date(date);
            expenseDate.setHours(0, 0, 0, 0);

            let dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if (expenseDate.getTime() === today.getTime()) {
                dateLabel = 'Today';
            } else if (expenseDate.getTime() === today.getTime() - 86400000) {
                dateLabel = 'Yesterday';
            }

            let group = groups.find(g => g.date === dateKey);
            if (!group) {
                group = { date: dateKey, dateLabel, total: 0, expenses: [] };
                groups.push(group);
            }
            group.expenses.push(expense);
            group.total += expense.amount;
        });

        return groups;
    }, [expenses]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your expenses...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="dashboard">
                {/* Header */}
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle">Track your daily spending</p>
                </header>

                {/* Main Content */}
                <main className="dashboard-content">
                    {/* Budget Overview Card */}
                    <section className="budget-overview-card">
                        <div className="budget-header-row">
                            <div className="budget-main">
                                <div className="budget-icon">
                                    <WalletIcon />
                                </div>
                                <div>
                                    <div className="budget-label">{cycleInfo.name} Budget</div>
                                    <div className="budget-amount">{formatCurrency(income)}</div>
                                </div>
                            </div>
                            <div className="budget-period-info">
                                <div className="period-label">
                                    <CalendarIcon />
                                    {new Date() >= currentPeriod.start && new Date() <= currentPeriod.end ? 'Current Period' : 'Period ended'}
                                </div>
                                <div className="period-dates">
                                    {`${currentPeriod.start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${currentPeriod.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                                </div>
                            </div>
                        </div>

                        <div className="budget-progress-section">
                            <div className="progress-info-row">
                                <div className="progress-spent">
                                    Spent <span>{formatCurrency(budgetMetrics.spent)}</span>
                                </div>
                                <div className="progress-remaining">
                                    {formatCurrency(budgetMetrics.remaining)} remaining
                                </div>
                            </div>
                            <div className="progress-bar-track">
                                <div
                                    className={`progress-bar-fill ${budgetMetrics.percentage > 90 ? 'danger' : budgetMetrics.percentage > 75 ? 'warning' : ''}`}
                                    style={{ width: `${Math.min(100, budgetMetrics.percentage)}%` }}
                                ></div>
                            </div>
                            <div className="progress-percent">{budgetMetrics.percentage.toFixed(0)}% used</div>
                        </div>

                        <div className="quick-stats-row">
                            <div className="quick-stat-card">
                                <div className="quick-stat-icon income">
                                    <TrendingUpIcon />
                                </div>
                                <div>
                                    <div className="quick-stat-label">Budget</div>
                                    <div className="quick-stat-value">{formatCurrency(income)}</div>
                                </div>
                            </div>
                            <div className="quick-stat-card">
                                <div className="quick-stat-icon daily">
                                    <DollarIcon />
                                </div>
                                <div>
                                    <div className="quick-stat-label">Daily Budget</div>
                                    <div className="quick-stat-value">{formatCurrency(dailyBudget)}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="summary-card-header">
                                <div className="summary-card-icon today">
                                    <ReceiptIcon />
                                </div>
                                <span className="summary-card-label">Today</span>
                            </div>
                            <div className="summary-card-value">{formatCurrency(todayTotal)}</div>
                            <div className="summary-card-count">{todayExpenses.length} transaction{todayExpenses.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-card-header">
                                <div className="summary-card-icon period">
                                    <TrendingUpIcon />
                                </div>
                                <span className="summary-card-label">This Period</span>
                            </div>
                            <div className="summary-card-value">{formatCurrency(budgetMetrics.spent)}</div>
                            <div className="summary-card-count">{periodExpenses.length} transaction{periodExpenses.length !== 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    {/* Category Budget Allocation */}
                    {categoryBudgets.length > 0 && (
                        <section className="category-budgets-section">
                            <div className="section-header">
                                <h3>Category Budgets</h3>
                                <span className="section-info">{categoryBudgets.length} categories</span>
                            </div>

                            <div className="category-grid">
                                {categoryMetrics.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`category-card ${category.overBudget ? 'over-budget' : ''}`}
                                        onClick={() => navigate(`/category/${category.id}`)}
                                        style={{ '--category-color': category.color } as React.CSSProperties}
                                    >
                                        <div className="category-card-header">
                                            <div className="category-card-icon">
                                                {getIcon(category.icon)}
                                            </div>
                                            <div>
                                                <h4 className="category-card-name">{category.name}</h4>
                                                {category.overBudget && (
                                                    <span className="over-budget-badge">Over Budget</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="category-amounts">
                                            <div className="category-spent">
                                                <span className="label">Spent</span>
                                                <span className="value">{formatCurrency(category.spent)}</span>
                                            </div>
                                            <div className="category-budget">
                                                <span className="label">Budget</span>
                                                <span className="value">{formatCurrency(category.allocatedBudget)}</span>
                                            </div>
                                        </div>

                                        <div className="category-progress-bar">
                                            <div
                                                className="category-progress-fill"
                                                style={{
                                                    width: `${Math.min(100, category.percentage)}%`,
                                                    backgroundColor: category.overBudget ? '#ef4444' : category.color,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="category-percentage">{category.percentage.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>

                            <div className="add-category-prompt">
                                <p>Manage your category budgets</p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/settings')}
                                >
                                    Go to Settings
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Recent Expenses */}
                    <section className="expenses-section">
                        <div className="section-header">
                            <h3>Recent Expenses</h3>
                        </div>

                        {recentExpenses.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <ReceiptIcon />
                                </div>
                                <p>No expenses recorded yet</p>
                            </div>
                        ) : (
                            recentExpenses.map(group => (
                                <div key={group.date} className="expense-group">
                                    <div className="expense-group-header">
                                        <span className="expense-group-date">{group.dateLabel}</span>
                                        <span className="expense-group-total">{formatCurrency(group.total)}</span>
                                    </div>
                                    <div className="expense-list">
                                        {group.expenses.map((expense: Expense) => (
                                            <div key={expense.id} className="expense-item">
                                                <div className="expense-icon-wrapper" style={{ color: '#0d4d4d' }}>
                                                    {getCategoryIcon(expense.category)}
                                                </div>
                                                <div className="expense-details">
                                                    <span className="expense-description">{expense.description}</span>
                                                    <span className="expense-category">{expense.category}</span>
                                                </div>
                                                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </main>

                {/* Floating Action Button */}
                <button className="fab" onClick={() => setShowAddExpense(true)}>
                    <PlusIcon />
                </button>

                {/* Add Expense Modal */}
                {showAddExpense && (
                    <AddExpenseModal onClose={() => setShowAddExpense(false)} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;

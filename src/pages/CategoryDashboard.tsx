// Category Dashboard Page - Individual category budget tracking

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';
import type { CategoryBudget } from '../types';
import AddExpenseModal from '../components/AddExpenseModal';
import Sidebar from '../components/Sidebar';
import './CategoryDashboard.css';

// Category Icons
const getCategoryIcon = (iconId: string) => {
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
        circle: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
            </svg>
        ),
    };
    return icons[iconId] || icons.circle;
};

// Back Icon
const BackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

// Plus Icon
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

// Alert Icon
const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const CategoryDashboard: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const { getCategoryExpenses, getCategorySpending, currentBudget } = useExpenses();
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Find the category from user's settings
    const category: CategoryBudget | undefined = userProfile?.settings?.categoryBudgets?.find(
        (cat: CategoryBudget) => cat.id === categoryId
    );

    // If category not found, redirect to main dashboard
    if (!category) {
        navigate('/');
        return null;
    }

    // Get expenses for this category in current budget period
    const categoryExpenses = getCategoryExpenses(category.name, currentBudget?.id);
    const spent = getCategorySpending(category.name, currentBudget?.id);
    const remaining = category.allocatedBudget - spent;
    const percentage = category.allocatedBudget > 0 ? (spent / category.allocatedBudget) * 100 : 0;
    const overBudget = spent > category.allocatedBudget;

    // Sort expenses from oldest to newest
    const sortedExpenses = useMemo(() => {
        return [...categoryExpenses].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [categoryExpenses]);

    // Calculate today's expenses
    const todayExpenses = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sortedExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            expenseDate.setHours(0, 0, 0, 0);
            return expenseDate.getTime() === today.getTime();
        });
    }, [sortedExpenses]);

    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="category-dashboard-container">
            <Sidebar />

            <div className="category-dashboard">
                {/* Header with Back Button */}
                <header className="category-header">
                    <button className="back-button" onClick={() => navigate('/')}>
                        <BackIcon />
                        <span>Back</span>
                    </button>
                    <div className="category-header-content">
                        <div className="category-icon-wrapper" style={{ color: category.color }}>
                            {getCategoryIcon(category.icon)}
                        </div>
                        <div>
                            <h1 className="category-title">{category.name}</h1>
                            <p className="category-subtitle">Category Budget</p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="category-content">
                    {/* Over-Budget Modal */}
                    {overBudget && (
                        <div className="budget-warning-modal">
                            <div className="budget-warning-content">
                                <div className="warning-icon">
                                    <AlertIcon />
                                </div>
                                <strong>Over Budget</strong>
                                <p>
                                    You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Budget Overview Card */}
                    <section className="budget-card">
                        <div className="budget-stats">
                            <div className="budget-stat">
                                <span className="stat-label">Budget</span>
                                <span className="stat-value">{formatCurrency(category.allocatedBudget)}</span>
                            </div>
                            <div className="budget-stat">
                                <span className="stat-label">Spent</span>
                                <span className="stat-value spent">{formatCurrency(spent)}</span>
                            </div>
                            <div className="budget-stat">
                                <span className="stat-label">Remaining</span>
                                <span className={`stat-value ${overBudget ? 'over' : 'under'}`}>
                                    {formatCurrency(remaining)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-section">
                            <div className="progress-bar-container">
                                <div
                                    className={`progress-bar-fill ${overBudget ? 'danger' : percentage > 75 ? 'warning' : ''}`}
                                    style={{
                                        width: `${Math.min(100, percentage)}%`,
                                        backgroundColor: overBudget ? '#ef4444' : category.color,
                                    }}
                                ></div>
                            </div>
                            <div className="progress-info">
                                <span>{percentage.toFixed(0)}% used</span>
                                <span>{formatCurrency(spent)} of {formatCurrency(category.allocatedBudget)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Today's Expenses */}
                    <section className="expenses-section">
                        <div className="section-header">
                            <h3>Today</h3>
                            <span className="section-total">{formatCurrency(todayTotal)}</span>
                        </div>

                        {todayExpenses.length === 0 ? (
                            <div className="empty-state">
                                <p>No expenses today</p>
                            </div>
                        ) : (
                            <div className="expense-list">
                                {todayExpenses.map(expense => (
                                    <div key={expense.id} className="expense-item">
                                        <div className="expense-icon" style={{ color: category.color }}>
                                            {getCategoryIcon(category.icon)}
                                        </div>
                                        <div className="expense-details">
                                            <span className="expense-description">{expense.description}</span>
                                            <span className="expense-time">
                                                {new Date(expense.date).toLocaleTimeString('en-PH', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* All Expenses for Current Period - Sorted oldest to newest */}
                    <section className="expenses-section">
                        <div className="section-header">
                            <h3>This Period</h3>
                            <span className="section-count">{sortedExpenses.length} transactions</span>
                        </div>

                        {sortedExpenses.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon" style={{ color: category.color }}>
                                    {getCategoryIcon(category.icon)}
                                </div>
                                <p>No expenses yet</p>
                                <span className="empty-hint">Add your first {category.name.toLowerCase()} expense</span>
                            </div>
                        ) : (
                            <div className="expense-list">
                                {sortedExpenses.map(expense => (
                                    <div key={expense.id} className="expense-item">
                                        <div className="expense-icon" style={{ color: category.color }}>
                                            {getCategoryIcon(category.icon)}
                                        </div>
                                        <div className="expense-details">
                                            <span className="expense-description">{expense.description}</span>
                                            <span className="expense-date">
                                                {new Date(expense.date).toLocaleDateString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                {/* Floating Action Button - Category-specific */}
                <button className="fab" onClick={() => setShowAddExpense(true)} title={`Add ${category.name} Expense`}>
                    <PlusIcon />
                </button>

                {/* Add Expense Modal - Pre-selected to this category */}
                {showAddExpense && (
                    <AddExpenseModal
                        onClose={() => setShowAddExpense(false)}
                        fixedCategory={category}
                    />
                )}
            </div>
        </div>
    );
};

export default CategoryDashboard;

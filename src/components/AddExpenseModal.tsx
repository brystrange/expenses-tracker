// Add Expense Modal Component - Uses dynamic categories from user settings

import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import type { CategoryBudget } from '../types';
import './AddExpenseModal.css';

// Icon components for categories
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

interface AddExpenseModalProps {
    onClose: () => void;
    initialData?: {
        id?: string;
        amount?: number;
        category?: string;
        description?: string;
        date?: Date;
    };
    // Optional: pre-select a category (for category-specific expense button)
    fixedCategory?: CategoryBudget;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, initialData, fixedCategory }) => {
    const { addExpense, updateExpense, currentBudget } = useExpenses();
    const { userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get user's custom categories
    const userCategories: CategoryBudget[] = userProfile?.settings?.categoryBudgets || [];

    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [category, setCategory] = useState<string>(
        fixedCategory?.name || initialData?.category || (userCategories.length > 0 ? userCategories[0].name : '')
    );
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(
        initialData?.date
            ? new Date(initialData.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    const isEditing = !!initialData?.id;



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }

        if (!category) {
            setError('Please select a category');
            return;
        }

        setIsLoading(true);

        try {
            if (isEditing && initialData?.id) {
                await updateExpense(initialData.id, {
                    amount: parsedAmount,
                    category,
                    description: description.trim(),
                    date: new Date(date),
                });
            } else {
                await addExpense({
                    amount: parsedAmount,
                    category,
                    description: description.trim(),
                    date: new Date(date),
                    budgetPeriodId: currentBudget?.id || '',
                });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense');
        } finally {
            setIsLoading(false);
        }
    };

    // If no categories are set up
    if (userCategories.length === 0 && !fixedCategory) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal expense-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">No Categories</h2>
                        <button className="btn btn-ghost btn-icon close-btn" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="empty-categories">
                            <p>You haven't set up any expense categories yet.</p>
                            <p>Please go to <strong>Settings → Category Budgets</strong> to create categories first.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={onClose}>
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal expense-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing
                            ? 'Edit Expense'
                            : fixedCategory
                                ? `Add ${fixedCategory.name} Expense`
                                : 'Add Expense'
                        }
                    </h2>
                    <button className="btn btn-ghost btn-icon close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Amount Input */}
                    <div className="form-group amount-group">
                        <label className="form-label">Amount (PHP)</label>
                        <div className="amount-input-wrapper">
                            <input
                                type="number"
                                className="form-input amount-input"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                step="0.01"
                                min="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category Selection - Only show if not fixed */}
                    {!fixedCategory && (
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div className="category-grid">
                                {userCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`category-btn ${category === cat.name ? 'active' : ''}`}
                                        onClick={() => setCategory(cat.name)}
                                        style={{
                                            '--category-color': cat.color
                                        } as React.CSSProperties}
                                    >
                                        <span className="category-icon" style={{ color: cat.color }}>
                                            {getCategoryIcon(cat.icon)}
                                        </span>
                                        <span className="category-name">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Show selected category if fixed */}
                    {fixedCategory && (
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div className="fixed-category">
                                <span className="category-icon" style={{ color: fixedCategory.color }}>
                                    {getCategoryIcon(fixedCategory.icon)}
                                </span>
                                <span className="category-name">{fixedCategory.name}</span>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="What did you spend on?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                            ) : isEditing ? (
                                'Update Expense'
                            ) : (
                                'Add Expense'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;

// Settings Page - Budget cycle, income, and category management

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CYCLE_INFO } from '../types';
import type { BudgetCycle, UserSettings, CategoryBudget } from '../types';
import { formatCurrency } from '../utils/helpers';
import Sidebar from '../components/Sidebar';
import './Settings.css';

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Available category icons
const CATEGORY_ICONS = [
    { id: 'food', icon: 'utensils', label: 'Food' },
    { id: 'transport', icon: 'car', label: 'Transport' },
    { id: 'utilities', icon: 'bolt', label: 'Utilities' },
    { id: 'entertainment', icon: 'film', label: 'Entertainment' },
    { id: 'shopping', icon: 'cart', label: 'Shopping' },
    { id: 'healthcare', icon: 'heart', label: 'Healthcare' },
    { id: 'bills', icon: 'file', label: 'Bills' },
    { id: 'savings', icon: 'piggy', label: 'Savings' },
    { id: 'education', icon: 'book', label: 'Education' },
    { id: 'coffee', icon: 'coffee', label: 'Coffee' },
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'travel', icon: 'plane', label: 'Travel' },
    { id: 'gifts', icon: 'gift', label: 'Gifts' },
    { id: 'phone', icon: 'phone', label: 'Phone' },
    { id: 'internet', icon: 'wifi', label: 'Internet' },
    { id: 'gaming', icon: 'gamepad', label: 'Gaming' },
    { id: 'music', icon: 'music', label: 'Music' },
    { id: 'fitness', icon: 'dumbbell', label: 'Fitness' },
    { id: 'kids', icon: 'baby', label: 'Kids' },
    { id: 'other', icon: 'circle', label: 'Other' },
];

// Available colors
const CATEGORY_COLORS = [
    '#011638', '#2e294e', '#059669', '#10b981',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#ef4444', '#f59e0b', '#84cc16',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#f97316',
    '#dc2626', '#be185d', '#7c3aed', '#2563eb',
];

// Icon components
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

// Day name mapping for weekly cycle
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Generate dynamic cycle description based on selected start day
const getCycleDescription = (cycle: BudgetCycle, startDay: number): string => {
    switch (cycle) {
        case 'weekly':
            // startDay is 1-7 (1=Monday, 7=Sunday) - convert to day name
            const dayIndex = startDay === 7 ? 0 : startDay; // Sunday is 0 in array
            return `Starts every ${DAY_NAMES[dayIndex]}`;
        case 'semi-monthly':
            // 15 days after start day
            const secondDay = startDay > 15 ? startDay - 15 : startDay + 15;
            return `Reset on ${getOrdinalSuffix(startDay)} & ${getOrdinalSuffix(secondDay)}`;
        case 'monthly':
            return `Reset every ${getOrdinalSuffix(startDay)}`;
        case 'quarterly':
            return 'Reset every 3 months';
        case 'yearly':
            return 'Reset every year';
        default:
            return 'Reset every cycle';
    }
};

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, updateUserSettings } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [budgetCycle, setBudgetCycle] = useState<BudgetCycle>('semi-monthly');
    const [cycleStartDay, setCycleStartDay] = useState(1);
    const [income, setIncome] = useState('');
    const [dailyLimit, setDailyLimit] = useState('');

    // Category management state
    const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('circle');
    const [newCategoryColor, setNewCategoryColor] = useState('#011638');
    const [newCategoryBudget, setNewCategoryBudget] = useState('');

    // Inline editing and delete confirmation modal state
    const [editingCategoryBudget, setEditingCategoryBudget] = useState<{ id: string; value: string } | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryBudget | null>(null);

    // Unsaved changes state
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);

    // Check if there are unsaved changes
    const hasUnsavedChanges = useCallback(() => {
        if (!userProfile?.settings) return false;
        const settings = userProfile.settings;
        return (
            budgetCycle !== settings.budgetCycle ||
            cycleStartDay !== settings.cycleStartDay ||
            income !== (settings.income?.toString() || '') ||
            dailyLimit !== (settings.dailySpendingLimit?.toString() || '') ||
            JSON.stringify(categoryBudgets) !== JSON.stringify(settings.categoryBudgets || [])
        );
    }, [userProfile, budgetCycle, cycleStartDay, income, dailyLimit, categoryBudgets]);

    const confirmDiscard = () => {
        setShowDiscardModal(false);
        if (pendingNavigationPath) {
            navigate(pendingNavigationPath);
        }
    };

    // Warn user about unsaved changes when leaving the page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Initialize form with user's current settings
    useEffect(() => {
        if (userProfile?.settings) {
            setBudgetCycle(userProfile.settings.budgetCycle);
            setCycleStartDay(userProfile.settings.cycleStartDay);
            setIncome(userProfile.settings.income?.toString() || '');
            setDailyLimit(userProfile.settings.dailySpendingLimit?.toString() || '');
            setCategoryBudgets(userProfile.settings.categoryBudgets || []);
        }
    }, [userProfile]);

    // Calculate default daily limit based on income and cycle
    const calculateDefaultDailyLimit = () => {
        const incomeAmount = parseFloat(income) || 0;
        const cycleDays = CYCLE_INFO[budgetCycle].days;
        return incomeAmount / cycleDays;
    };

    // Calculate total allocated budget
    const totalAllocated = categoryBudgets.reduce((sum, cat) => sum + cat.allocatedBudget, 0);
    const incomeAmount = parseFloat(income) || 0;

    const handleSave = async () => {
        setIsLoading(true);
        setSuccessMessage(null);

        try {
            // Build settings object without undefined values (Firebase rejects undefined)
            const newSettings: Partial<UserSettings> = {
                budgetCycle,
                cycleStartDay,
                income: parseFloat(income) || 0,
                categoryBudgets,
            };

            // Only include dailySpendingLimit if it has a value
            if (dailyLimit && parseFloat(dailyLimit) > 0) {
                newSettings.dailySpendingLimit = parseFloat(dailyLimit);
            }

            await updateUserSettings(newSettings);
            setSuccessMessage('Settings saved successfully!');

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Category CRUD operations
    const addCategory = () => {
        if (!newCategoryName.trim() || !newCategoryBudget) return;

        const newCategory: CategoryBudget = {
            id: generateId(),
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            color: newCategoryColor,
            allocatedBudget: parseFloat(newCategoryBudget) || 0,
            createdAt: new Date(),
        };

        setCategoryBudgets([...categoryBudgets, newCategory]);
        resetCategoryForm();
        setShowAddCategory(false);
    };

    const updateCategory = (id: string, updates: Partial<CategoryBudget>) => {
        setCategoryBudgets(prev =>
            prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
        );
    };

    const deleteCategory = (id: string) => {
        setCategoryBudgets(prev => prev.filter(cat => cat.id !== id));
        setCategoryToDelete(null);
    };

    const confirmDeleteCategory = (category: CategoryBudget) => {
        setCategoryToDelete(category);
    };

    const startEditingBudget = (category: CategoryBudget) => {
        setEditingCategoryBudget({ id: category.id, value: category.allocatedBudget.toString() });
    };

    const saveEditingBudget = () => {
        if (editingCategoryBudget) {
            updateCategory(editingCategoryBudget.id, { allocatedBudget: parseFloat(editingCategoryBudget.value) || 0 });
            setEditingCategoryBudget(null);
        }
    };

    const cancelEditingBudget = () => {
        setEditingCategoryBudget(null);
    };

    const resetCategoryForm = () => {
        setNewCategoryName('');
        setNewCategoryIcon('circle');
        setNewCategoryColor('#0d4d4d');
        setNewCategoryBudget('');
    };

    // Day options for cycle start
    const getDayOptions = () => {
        if (budgetCycle === 'weekly') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days.map((day, index) => (
                <option key={index} value={index}>{day}</option>
            ));
        } else {
            return Array.from({ length: 28 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                    {i + 1}{getOrdinalSuffix(i + 1)} of the month
                </option>
            ));
        }
    };

    const getOrdinalSuffix = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return (
        <div className="settings-container">
            <Sidebar />

            <div className="settings-page">
                {/* Header */}
                <header className="settings-header">
                    <h1>Settings</h1>
                    <p className="settings-subtitle">Manage your budget preferences</p>
                </header>

                <main className="settings-content">
                    {/* Profile Section */}
                    <section className="settings-section">
                        <h2 className="section-title">Profile</h2>
                        <div className="settings-card">
                            <div className="profile-info">
                                <div className="profile-avatar">
                                    {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="profile-details">
                                    <span className="profile-name">{userProfile?.displayName}</span>
                                    <span className="profile-email">{userProfile?.email}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Budget Cycle Section */}
                    <section className="settings-section">
                        <h2 className="section-title">Budget Cycle</h2>
                        <div className="settings-card">
                            <p className="section-description">
                                Choose how often your budget resets.
                            </p>

                            <div className="cycle-options">
                                {(Object.keys(CYCLE_INFO) as BudgetCycle[]).map((cycle) => (
                                    <button
                                        key={cycle}
                                        className={`cycle-option ${budgetCycle === cycle ? 'active' : ''}`}
                                        onClick={() => setBudgetCycle(cycle)}
                                    >
                                        <span className="cycle-name">{CYCLE_INFO[cycle].name}</span>
                                        <span className="cycle-desc">{getCycleDescription(cycle, cycleStartDay)}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cycle Start Day</label>
                                <select
                                    className="form-select"
                                    value={cycleStartDay}
                                    onChange={(e) => setCycleStartDay(parseInt(e.target.value))}
                                >
                                    {getDayOptions()}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Budget Section */}
                    <section className="settings-section">
                        <h2 className="section-title">Budget</h2>
                        <div className="settings-card">
                            <div className="form-group">
                                <label className="form-label">{CYCLE_INFO[budgetCycle].incomeLabel}</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">₱</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={income}
                                        onChange={(e) => setIncome(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {income && (
                                <div className="calculated-daily">
                                    <span className="daily-label">Suggested daily limit:</span>
                                    <span className="daily-amount">{formatCurrency(calculateDefaultDailyLimit())}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Custom Daily Limit (Optional)</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">₱</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder={formatCurrency(calculateDefaultDailyLimit()).replace('₱', '')}
                                        value={dailyLimit}
                                        onChange={(e) => setDailyLimit(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Category Budget Section */}
                    <section className="settings-section">
                        <h2 className="section-title">Category Budgets</h2>
                        <div className="settings-card">
                            <p className="section-description">
                                Create spending categories and set budget limits for each.
                            </p>

                            {/* Budget Summary */}
                            {categoryBudgets.length > 0 && (
                                <div className={`budget-summary ${totalAllocated > incomeAmount ? 'over' : ''}`}>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Allocated</span>
                                        <span className="summary-value">{formatCurrency(totalAllocated)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Budget</span>
                                        <span className="summary-value">{formatCurrency(incomeAmount)}</span>
                                    </div>
                                    {totalAllocated > incomeAmount && (
                                        <div className="summary-warning">
                                            Budget exceeds income by {formatCurrency(totalAllocated - incomeAmount)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Category List */}
                            <div className="category-list">
                                {categoryBudgets.map((category) => (
                                    <div key={category.id} className="category-item">
                                        <div className="category-icon" style={{ color: category.color }}>
                                            {getIcon(category.icon)}
                                        </div>
                                        <div className="category-info">
                                            <span className="category-name">{category.name}</span>
                                            {editingCategoryBudget?.id === category.id ? (
                                                <div className="inline-edit-budget">
                                                    <div className="input-with-prefix">
                                                        <span className="input-prefix">₱</span>
                                                        <input
                                                            type="number"
                                                            className="form-input inline-budget-input"
                                                            value={editingCategoryBudget.value}
                                                            onChange={(e) => setEditingCategoryBudget({ ...editingCategoryBudget, value: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEditingBudget();
                                                                if (e.key === 'Escape') cancelEditingBudget();
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <button className="btn-icon btn-save-inline" onClick={saveEditingBudget} title="Save">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </button>
                                                    <button className="btn-icon" onClick={cancelEditingBudget} title="Cancel">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="category-budget">{formatCurrency(category.allocatedBudget)}</span>
                                            )}
                                        </div>
                                        <div className="category-actions">
                                            {editingCategoryBudget?.id !== category.id && (
                                                <>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => startEditingBudget(category)}
                                                        title="Edit budget"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-danger"
                                                        onClick={() => confirmDeleteCategory(category)}
                                                        title="Delete category"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Category Button */}
                            {!showAddCategory ? (
                                <button
                                    className="btn btn-add-category"
                                    onClick={() => setShowAddCategory(true)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Category
                                </button>
                            ) : (
                                <div className="add-category-form">
                                    <h4 className="form-title">New Category</h4>

                                    <div className="form-group">
                                        <label className="form-label">Category Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Transportation"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Icon</label>
                                        <div className="icon-picker">
                                            {CATEGORY_ICONS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className={`icon-option ${newCategoryIcon === item.icon ? 'active' : ''}`}
                                                    onClick={() => setNewCategoryIcon(item.icon)}
                                                    title={item.label}
                                                >
                                                    {getIcon(item.icon)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <div className="color-picker">
                                            {CATEGORY_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`color-option ${newCategoryColor === color ? 'active' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setNewCategoryColor(color)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Allocated Budget</label>
                                        <div className="input-with-prefix">
                                            <span className="input-prefix">₱</span>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="0.00"
                                                value={newCategoryBudget}
                                                onChange={(e) => setNewCategoryBudget(e.target.value)}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                resetCategoryForm();
                                                setShowAddCategory(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={addCategory}
                                            disabled={!newCategoryName.trim() || !newCategoryBudget}
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {successMessage}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        className="btn btn-primary btn-save"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            {categoryToDelete && (
                <div className="modal-overlay" onClick={() => setCategoryToDelete(null)}>
                    <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3 className="confirm-modal-title">Delete Category?</h3>
                        <p className="confirm-modal-message">
                            Are you sure you want to delete "{categoryToDelete.name}"? Existing expenses will not be affected.
                        </p>
                        <div className="confirm-modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setCategoryToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => deleteCategory(categoryToDelete.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Changes Confirmation Modal */}
            {showDiscardModal && (
                <div className="modal-overlay" onClick={() => setShowDiscardModal(false)}>
                    <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon logout">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h3 className="confirm-modal-title">Discard Changes?</h3>
                        <p className="confirm-modal-message">
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </p>
                        <div className="confirm-modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDiscardModal(false)}
                            >
                                Stay
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDiscard}
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

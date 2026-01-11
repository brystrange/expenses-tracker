// Bills Page - Placeholder for future bill management features

import React from 'react';
import Sidebar from '../components/Sidebar';
import './Bills.css';

const Bills: React.FC = () => {
    return (
        <div className="bills-container">
            <Sidebar />

            <div className="bills-page">
                {/* Header */}
                <header className="bills-header">
                    <h1>Bills</h1>
                    <p className="bills-subtitle">Manage your recurring bills</p>
                </header>

                <main className="bills-content">
                    <div className="coming-soon-card">
                        <div className="coming-soon-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <h2>Coming Soon</h2>
                        <p>Bill management features are under development.</p>
                        <p className="hint">Track recurring bills, set reminders, and never miss a payment.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Bills;

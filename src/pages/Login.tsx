// Login Page Component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearError();

        try {
            if (isSignUp) {
                await signUp(email, password, displayName);
            } else {
                await signIn(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        clearError();

        try {
            await signInWithGoogle();
            navigate('/');
        } catch (err) {
            console.error('Google sign-in error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo and Title */}
                <div className="login-header">
                    <div className="login-logo">SW</div>
                    <h1>SpendWise</h1>
                    <p>Online expenses tracker</p>
                </div>

                {/* Auth Form */}
                <div className="login-card">
                    <div className="login-tabs">
                        <button
                            className={`login-tab ${!isSignUp ? 'active' : ''}`}
                            onClick={() => setIsSignUp(false)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`login-tab ${isSignUp ? 'active' : ''}`}
                            onClick={() => setIsSignUp(true)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {isSignUp && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                            ) : isSignUp ? (
                                'Create Account'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>or continue with</span>
                    </div>

                    <button
                        className="btn btn-secondary btn-block google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Demo Notice */}
                <p className="login-demo-notice">
                    
                </p>
            </div>
        </div>
    );
};

export default Login;

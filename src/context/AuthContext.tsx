// Authentication Context - Manages user login state

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import type { UserProfile, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
    updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch or create user profile
                const profile = await fetchOrCreateProfile(firebaseUser);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch or create user profile in Firestore
    const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Ensure settings exist (migration for old profiles)
            return {
                ...data,
                settings: data.settings || DEFAULT_SETTINGS,
            } as UserProfile;
        }

        // Create new profile with default settings
        const newProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            settings: DEFAULT_SETTINGS,
            createdAt: new Date(),
        };

        // Only include photoURL if it exists (Firestore doesn't accept undefined)
        if (firebaseUser.photoURL) {
            newProfile.photoURL = firebaseUser.photoURL;
        }

        await setDoc(userRef, newProfile);
        return newProfile;
    };

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
            setError(errorMessage);
            throw err;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
            setError(errorMessage);
            throw err;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(errorMessage);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
            setError(errorMessage);
            throw err;
        }
    };

    const updateUserProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, updates, { merge: true });
            setUserProfile(prev => prev ? { ...prev, ...updates } : null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            throw err;
        }
    };

    const updateUserSettings = async (settings: Partial<UserSettings>) => {
        if (!user || !userProfile) return;

        try {
            const newSettings = { ...userProfile.settings, ...settings };
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { settings: newSettings }, { merge: true });
            setUserProfile(prev => prev ? { ...prev, settings: newSettings } : null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
            setError(errorMessage);
            throw err;
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        updateUserProfile,
        updateUserSettings,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

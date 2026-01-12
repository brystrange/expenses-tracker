// Firebase error message mappings to user-friendly messages

export const getAuthErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const message = error.message;

        // Extract Firebase error code from message if present
        const codeMatch = message.match(/\(auth\/([^)]+)\)/);
        const errorCode = codeMatch ? codeMatch[1] : '';

        switch (errorCode) {
            // Sign-in errors
            case 'invalid-credential':
            case 'wrong-password':
            case 'user-not-found':
                return 'Invalid email or password. Please check your credentials and try again.';

            case 'invalid-email':
                return 'Please enter a valid email address.';

            case 'user-disabled':
                return 'This account has been disabled. Please contact support for assistance.';

            case 'too-many-requests':
                return 'Too many failed attempts. Please wait a few minutes and try again.';

            // Sign-up errors
            case 'email-already-in-use':
                return 'An account with this email already exists. Please sign in instead.';

            case 'weak-password':
                return 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';

            case 'operation-not-allowed':
                return 'This sign-in method is not enabled. Please contact support.';

            // Google sign-in errors
            case 'popup-closed-by-user':
                return 'Sign-in was cancelled. Please try again.';

            case 'popup-blocked':
                return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';

            case 'unauthorized-domain':
                return 'Sign-in is not available on this domain. Please contact support.';

            case 'cancelled-popup-request':
                return 'Sign-in was interrupted. Please try again.';

            // Network errors
            case 'network-request-failed':
                return 'Network error. Please check your internet connection and try again.';

            case 'timeout':
                return 'Request timed out. Please check your connection and try again.';

            // Account errors
            case 'requires-recent-login':
                return 'For security, please sign out and sign in again to continue.';

            case 'credential-already-in-use':
                return 'This credential is already associated with another account.';

            // General errors
            case 'internal-error':
                return 'An unexpected error occurred. Please try again later.';

            default:
                // If no specific match, return a generic friendly message
                return 'Something went wrong. Please try again.';
        }
    }

    return 'An unexpected error occurred. Please try again.';
};

// Firestore error messages
export const getFirestoreErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('permission-denied') || message.includes('permission denied')) {
            return 'You do not have permission to perform this action.';
        }

        if (message.includes('not-found') || message.includes('not found')) {
            return 'The requested data could not be found.';
        }

        if (message.includes('already-exists')) {
            return 'This item already exists.';
        }

        if (message.includes('resource-exhausted')) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        if (message.includes('unavailable')) {
            return 'Service is temporarily unavailable. Please try again later.';
        }

        if (message.includes('network') || message.includes('offline')) {
            return 'Network error. Please check your internet connection.';
        }
    }

    return 'Something went wrong. Please try again.';
};

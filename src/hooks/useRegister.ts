/**
 * HSD Arena - useRegister Hook
 * 
 * Simplified hook for user-only registration (NO organization)
 */

import { useState } from 'react';
import { useAuth } from './useAuth';
import { isValidEmail } from '@/utils';

// Define types locally since the import from '../types' is removed
interface RegisterData {
    username: string;
    email: string;
    password: string;
    cfTurnstileToken: string;
}

interface AuthError {
    field?: string;
    message: string;
}

interface UseRegisterReturn {
    username: string;
    email: string;
    password: string;

    errors: {
        username?: string;
        email?: string;
        password?: string;
        general?: string;
    };
    isLoading: boolean;

    setUsername: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setCfTurnstileToken: (value: string) => void;

    handleSubmit: (e: React.FormEvent) => Promise<void>;
    clearErrors: () => void;
}

export const useRegister = (onSuccess?: () => void): UseRegisterReturn => {
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cfTurnstileToken, setCfTurnstileToken] = useState('');

    const [errors, setErrors] = useState<UseRegisterReturn['errors']>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: UseRegisterReturn['errors'] = {};

        // Username validation
        if (!username) {
            newErrors.username = 'Username is required';
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        if (!cfTurnstileToken) {
            newErrors.general = 'Please complete Turnstile verification';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const data: RegisterData = {
                username,
                email,
                password,
                cfTurnstileToken,
            };

            await register(data);
            onSuccess?.();
        } catch (error) {
            const authError = error as AuthError;
            if (authError.field) {
                setErrors({ [authError.field]: authError.message });
            } else {
                setErrors({ general: authError.message || 'An error occurred. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearErrors = () => setErrors({});

    return {
        username,
        email,
        password,
        errors,
        isLoading,
        setUsername,
        setEmail,
        setPassword,
        setCfTurnstileToken,
        handleSubmit,
        clearErrors,
    };
};

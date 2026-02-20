/**
 * HSD Arena - useLogin Hook
 * 
 * Hook for login form state and validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { isValidEmail } from '@/utils';

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthError {
    code: string;
    message: string;
}

interface UseLoginReturn {
    email: string;
    password: string;
    errors: {
        email?: string;
        password?: string;
        general?: string;
    };
    isLoading: boolean;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    clearErrors: () => void;
}

export const useLogin = (onSuccess?: () => void): UseLoginReturn => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<UseLoginReturn['errors']>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: UseLoginReturn['errors'] = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
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
            const credentials: LoginCredentials = { email, password };
            await login(credentials);
            onSuccess?.();
        } catch (error) {
            const authError = error as AuthError;
            if (authError.code === 'INVALID_CREDENTIALS') {
                setErrors({ general: authError.message });
            } else {
                setErrors({ general: 'An error occurred. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearErrors = () => setErrors({});

    return {
        email,
        password,
        errors,
        isLoading,
        setEmail,
        setPassword,
        handleSubmit,
        clearErrors,
    };
};

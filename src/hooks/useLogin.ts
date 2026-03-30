/**
 * HSD Arena - useLogin Hook
 * 
 * Hook for login form state and validation
 */

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { isValidEmail } from '@/utils';

interface LoginCredentials {
    email: string;
    password: string;
    cfTurnstileToken?: string;
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
    turnstileRenderKey: number;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setCfTurnstileToken: (token: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    clearErrors: () => void;
}

interface UseLoginOptions {
    requireTurnstile?: boolean;
}

export const useLogin = (
    onSuccess?: () => void,
    options: UseLoginOptions = {}
): UseLoginReturn => {
    const { requireTurnstile = true } = options;
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cfTurnstileToken, setCfTurnstileToken] = useState('');
    const [turnstileRenderKey, setTurnstileRenderKey] = useState(0);
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

        if (requireTurnstile && !cfTurnstileToken) {
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
            const credentials: LoginCredentials = {
                email,
                password,
                ...(requireTurnstile && cfTurnstileToken
                    ? { cfTurnstileToken }
                    : {}),
            };
            await login(credentials);

            onSuccess?.();
        } catch (error) {
            if (requireTurnstile) {
                setCfTurnstileToken('');
                setTurnstileRenderKey((prev) => prev + 1);
            }

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
        turnstileRenderKey,
        setEmail,
        setPassword,
        setCfTurnstileToken,
        handleSubmit,
        clearErrors,
    };
};

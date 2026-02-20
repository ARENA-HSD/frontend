/**
 * HSD Arena - Login Form Component
 * 
 * Functional login form with validation
 */

import { useLogin } from '@/hooks';
import { Input, Button } from '@/components';

interface LoginFormProps {
    onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const {
        email,
        password,
        errors,
        isLoading,
        setEmail,
        setPassword,
        handleSubmit,
    } = useLogin(onSuccess);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
                <div className="bg-role-danger-light border border-role-danger rounded-lg p-3">
                    <p className="text-sm text-role-danger">{errors.general}</p>
                </div>
            )}

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="your@email.com"
                disabled={isLoading}
                required
                fullWidth
            />

            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                disabled={isLoading}
                required
                fullWidth
            />

            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
        </form>
    );
};

export default LoginForm;

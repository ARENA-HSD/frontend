/**
 * HSD Arena - Login Form Component
 * 
 * Functional login form with validation
 */

import { useLogin } from '@/hooks';
import { Input, Button } from '@/components';
import { Turnstile } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/constants';

interface LoginFormProps {
    onSuccess?: () => void;
    requireTurnstile?: boolean;
}

const LoginForm = ({ onSuccess, requireTurnstile = true }: LoginFormProps) => {
    const {
        email,
        password,
        errors,
        isLoading,
        turnstileRenderKey,
        setEmail,
        setPassword,
        setCfTurnstileToken,
        handleSubmit,
    } = useLogin(onSuccess, { requireTurnstile });

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
                className="mb-4"
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
                className="mb-4"
            />

            <Button
                type="submit"
                variant="primary"
                className="font-['Titan_One',sans-serif] text-2xl py-6"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {requireTurnstile && (
                <div className="flex justify-center">
                    <Turnstile
                        key={turnstileRenderKey}
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={setCfTurnstileToken}
                        onExpire={() => setCfTurnstileToken('')}
                        options={{ theme: 'auto' }}
                    />
                </div>
            )}
        </form>
    );
};

export default LoginForm;

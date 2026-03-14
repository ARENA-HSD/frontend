/**
 * HSD Arena - Register Form Component
 * 
 * Simplified user-only registration (NO organization)
 */

import { useRegister } from '@/hooks';
import { Input, Button } from '@/components';
import { Turnstile } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/lib/constants';

interface RegisterFormProps {
    onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const {
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
    } = useRegister(onSuccess);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
                <div className="bg-role-danger-light border border-role-danger rounded-lg p-3">
                    <p className="text-md text-role-danger">{errors.general}</p>
                </div>
            )}

            <div className='flex space-x-4'>
                <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={errors.username}
                    placeholder="john_doe"
                    disabled={isLoading}
                    required
                    fullWidth
                    helperText="Letters, numbers, and underscores only"
                />

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
            </div>

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
                helperText="Min 8 characters, with uppercase, lowercase, and number"
            />

            <Button
                type="submit"
                variant="primary"
                className="font-['Titan_One',sans-serif] text-2xl py-6"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="flex justify-center">
                <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setCfTurnstileToken}
                    onExpire={() => setCfTurnstileToken('')}
                    options={{ theme: 'auto' }}
                />
            </div>
        </form>
    );
};

export default RegisterForm;

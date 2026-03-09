/**
 * HSD Arena - Login Page
 * 
 * Login page - redirects to organizations dashboard on success
 */

import { useNavigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';
import { MainLayout } from '@/components';
import { LoginForm } from '@/components';
import { authService } from '@/services';
import { useEffect } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();
    const isSubdomain = !!subdomain;
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            navigate("/dashboard")
        }
    }, [currentUser]);

    const handleSuccess = () => {
        if (isSubdomain) {
            // Subdomain: go to dashboard
            navigate('/');
        } else {
            // Main domain: go to organizations page
            navigate('/organizations');
        }
        localStorage.setItem("auth-sync", Date.now().toString());
    };

    return (
        <MainLayout sidebar={false}>
            <div className="h-full flex items-center">
                <div className="card space-y-6 w-full max-w-md mx-auto">
                    <div className="text-center">
                        <div className="text-5xl mb-4">🔐</div>
                        <h1 className="text-2xl font-bold text-primary mb-2">
                            {isSubdomain ? `Sign in to ${subdomain}` : 'Sign In'}
                        </h1>
                        <p className="text-secondary text-sm">
                            {isSubdomain
                                ? 'Access your organization dashboard'
                                : 'Access your organizations'
                            }
                        </p>
                    </div>

                    <LoginForm onSuccess={handleSuccess} />

                    {!isSubdomain && (
                        <p className="text-sm text-tertiary text-center">
                            Don't have an account?{' '}
                            <a href="/register" className="text-role-primary hover:underline">
                                Create one
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default LoginPage;
/**
 * HSD Arena - Login Page
 * 
 * Login page - redirects to organizations dashboard on success
 */

import { useNavigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';
import { MainLayout } from '@/components';
import { LoginForm } from '@/components';

const LoginPage = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();
    const isSubdomain = !!subdomain;

    const handleSuccess = () => {
        if (isSubdomain) {
            // Subdomain: go to manager dashboard
            navigate('/manager/quizzes');
        } else {
            // Main domain: go to organizations page
            navigate('/organizations');
        }
    };

    return (
        <MainLayout>
            <div className="card space-y-6">
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
        </MainLayout>
    );
};

export default LoginPage;

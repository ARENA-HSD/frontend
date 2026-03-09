/**
 * HSD Arena - Login Page
 * 
 * Login page - redirects to organizations dashboard on success
 */

import { useNavigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';
import { MainLayout } from '@/components';
import { LoginForm } from '@/components';
import maskot from "@/assets/maskot.png"
import { useAuth } from '@/hooks';
import { useEffect } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/organizations")
        }
    }, [isAuthenticated]);

    const handleSuccess = () => {
        if (subdomain) {
            navigate('/');
        } else {
            navigate('/organizations');
        }
        localStorage.setItem("auth-sync", Date.now().toString());
    };

    return (
        <MainLayout sidebar={false}>
            <div className="h-full flex items-center justify-between">
                <div className="space-y-2 w-full max-w-[50%]">
                    <div className="">
                        <h1 className="text-5xl text-primary mb-1 font-['Titan_One',sans-serif]">
                            Sign In
                        </h1>
                        <p className="text-secondary text-sm">
                            {subdomain
                                ? 'Access your organization dashboard'
                                : 'Access your organizations'
                            }
                        </p>
                    </div>
                    <LoginForm onSuccess={handleSuccess} />
                    {!subdomain && (
                        <p className="text-sm text-tertiary text-center">
                            Don't have an account?{' '}
                            <a href="/register" className="text-role-primary hover:underline">
                                Create one
                            </a>
                        </p>
                    )}
                </div>
                <img src={maskot} alt="maskot" className='w-[45%] mb-16' />
            </div>
        </MainLayout>
    );
};

export default LoginPage;

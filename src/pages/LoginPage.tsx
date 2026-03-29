/**
 * HSD Arena - Login Page
 * 
 * Login page - redirects to organizations dashboard on success
 */

import { useNavigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';
import { MainLayout, SEO } from '@/components';
import { LoginForm } from '@/components';
import maskot from "@/assets/maskot-elsalliyor.png"
import maskot320Webp from '@/assets/optimized/maskot-elsalliyor-320.webp';
import maskot640Webp from '@/assets/optimized/maskot-elsalliyor-640.webp';
import maskot960Webp from '@/assets/optimized/maskot-elsalliyor-960.webp';
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
            <SEO
                title="Sign In"
                description="Sign in to your Quiz Strike account and access your organization's quizzes."
                noIndex
            />
            <div className="h-full flex items-center sm:justify-between sm:flex-row flex-col-reverse justify-center">
                <div className="space-y-2 w-full max-w-[80%] sm:max-w-[50%]">
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
                    <LoginForm
                        onSuccess={handleSuccess}
                        requireTurnstile={!subdomain}
                    />
                    {!subdomain && (
                        <p className="text-sm text-tertiary text-center">
                            Don't have an account?{' '}
                            <a href="/register" className="text-role-primary hover:underline">
                                Create one
                            </a>
                        </p>
                    )}
                </div>
                <picture className="w-[30%] mb-8 md:mr-16 hidden sm:block">
                    <source
                        type="image/webp"
                        srcSet={`${maskot320Webp} 320w, ${maskot640Webp} 640w, ${maskot960Webp} 960w`}
                        sizes="(max-width: 768px) 35vw, 30vw"
                    />
                    <img
                        src={maskot}
                        alt="maskot"
                        className="w-full h-auto"
                        width={1670}
                        height={1689}
                        loading="lazy"
                        decoding="async"
                    />
                </picture>
            </div>
        </MainLayout>
    );
};

export default LoginPage;

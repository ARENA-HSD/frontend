/**
 * HSD Arena - Register Page
 * 
 * User registration page (NO organization creation)
 */

import { useNavigate } from 'react-router-dom';
import { MainLayout, SEO } from '@/components';
import { RegisterForm } from '@/components';
import maskot from "@/assets/maskot-elsalliyor.png"
import { useAuth } from '@/hooks';
import { useEffect } from 'react';
import { useSubdomain } from '@/hooks';

const RegisterPage = () => {
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
                title="Create Account"
                description="Sign up for Quiz Strike and start building interactive quizzes for your organization."
            />
            <div className="h-full flex items-center justify-between">
                <div className="space-y-2 w-full max-w-[50%]">
                    <div className="">
                        <h1 className="text-5xl text-primary mb-1 font-['Titan_One',sans-serif]">
                            Create Your Account
                        </h1>
                        <p className="text-secondary">
                            Join HSD Arena Platform
                        </p>
                    </div>
                    <RegisterForm onSuccess={handleSuccess} />
                    <p className="text-sm text-tertiary text-center">
                        Already have an account?{' '}
                        <a href="/login" className="text-role-primary hover:underline">
                            Sign in
                        </a>
                    </p>
                </div>
                <img src={maskot} alt="maskot" className='w-[30%] mb-16 mr-16' />
            </div>
        </MainLayout>
    );
};

export default RegisterPage;
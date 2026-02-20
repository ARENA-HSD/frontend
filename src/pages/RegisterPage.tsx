/**
 * HSD Arena - Register Page
 * 
 * User registration page (NO organization creation)
 */

import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components';
import { RegisterForm } from '@/components';

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        // After successful registration, redirect to login
        navigate('/login');
    };

    return (
        <MainLayout>
            <div className="card space-y-6">
                <div className="text-center">
                    <div className="text-6xl mb-3">🎮</div>
                    <h1 className="text-3xl font-bold text-primary mb-2">
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
        </MainLayout>
    );
};

export default RegisterPage;

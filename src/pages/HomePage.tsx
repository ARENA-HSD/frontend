/**
 * HSD Arena - Home Page
 * 
 * Landing page for main domain
 */

import { Link } from 'react-router-dom';
import { MainLayout, Button } from '@/components';

const HomePage = () => {
    return (
        <MainLayout sidebar={false}>
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-8">
                    <div>
                        <h1 className="text-5xl font-bold text-primary mb-4">
                            Welcome to HSD Arena
                        </h1>
                        <p className="text-xl text-secondary max-w-2xl mx-auto">
                            Create and host interactive quizzes for your organization
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link to="/register">
                            <Button variant="primary" size="lg">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" size="lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default HomePage;

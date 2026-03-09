/**
 * HSD Arena - Home Page
 * 
 * Landing page for main domain
 */

import { Link } from 'react-router-dom';
import { MainLayout, Button } from '@/components';
import maskot from "@/assets/maskot.png"

const HomePage = () => {
    return (
        <MainLayout sidebar={false}>
            <div className="h-full flex items-center justify-between">
                <div className="space-y-8 w-full">
                    <div>
                        <h1 className="text-8xl text-primary mb-4 font-['Titan_One',sans-serif]">
                            Welcome to Quiz Strike

                        </h1>
                        <p className="text-3xl font-[500] max-w-2xl">
                            Create and host interactive quizzes for your organization

                        </p>
                    </div>
                    <div className="flex gap-4 font-['Titan_One',sans-serif]">
                        <Link to="/register">
                            <Button variant="primary" size="xl">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" size="xl">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
                <img src={maskot} alt="maskot" className='w-[50%] mb-16' />
            </div>
        </MainLayout>
    );
};

export default HomePage;
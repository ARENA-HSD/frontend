/**
 * HSD Arena - Home Page
 * 
 * Landing page for main domain
 */

import { Link } from 'react-router-dom';
import { MainLayout, Button, SEO } from '@/components';
import maskot from "@/assets/maskot-elsalliyor.png"
import maskot320Webp from '@/assets/optimized/maskot-elsalliyor-320.webp';
import maskot640Webp from '@/assets/optimized/maskot-elsalliyor-640.webp';
import maskot960Webp from '@/assets/optimized/maskot-elsalliyor-960.webp';

const HomePage = () => {
    return (
        <MainLayout sidebar={false}>
            <SEO
                title="Interactive Quiz Platform"
                description="Create and host interactive quizzes for your organization with Quiz Strike. Get started for free."
                canonical="https://quizstrike.com.tr"
            />
            <div className="h-full flex items-center justify-between sm:flex-row flex-col-reverse">
                <div className="space-y-8 w-full m-4 md:p-0">
                    <div>
                        <h1 className="text-6xl md:text-8xl text-primary mb-4 font-['Titan_One',sans-serif]">
                            Welcome to Quiz Strike

                        </h1>
                        <p className="text-2xl md:text-3xl font-[500] max-w-2xl">
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
                <picture className='w-[60%] md:w-[30%] md:mb-8'>
                    <source
                        type="image/webp"
                        srcSet={`${maskot320Webp} 320w, ${maskot640Webp} 640w, ${maskot960Webp} 960w`}
                        sizes="(max-width: 768px) 60vw, 30vw"
                    />
                    <img
                        src={maskot}
                        alt="maskot"
                        className="w-full h-auto"
                        width={1670}
                        height={1689}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                    />
                </picture>
            </div>
        </MainLayout>
    );
};

export default HomePage;
/**
 * HSD Arena - 404 Not Found Page
 */

import { useNavigate } from 'react-router-dom';
import { MainLayout, SEO } from '@/components';
import maskotUzgun from '@/assets/maskot-uzgun.png';
import maskotUzgun320Webp from '@/assets/optimized/maskot-uzgun-320.webp';
import maskotUzgun640Webp from '@/assets/optimized/maskot-uzgun-640.webp';
import maskotUzgun960Webp from '@/assets/optimized/maskot-uzgun-960.webp';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <MainLayout sidebar={false}>
            <SEO
                title="404 - Page Not Found"
                description="The page you are looking for does not exist."
                noIndex
            />
            <div className="h-full flex items-center justify-between">
                <div className="space-y-6 w-full max-w-[50%]">
                    <div>
                        <p className="text-9xl font-['Titan_One',sans-serif] text-role-primary leading-none">
                            404
                        </p>
                        <h1 className="text-4xl text-primary mt-2 font-['Titan_One',sans-serif]">
                            Page Not Found
                        </h1>
                        <p className="text-secondary text-lg mt-3">
                            Oops! The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2 rounded-lg border border-input text-secondary hover:text-primary hover:border-primary transition-colors text-sm font-medium"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-5 py-2 rounded-lg bg-role-primary text-white hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
                <picture className="w-[30%] mb-16 md:mr-16">
                    <source
                        type="image/webp"
                        srcSet={`${maskotUzgun320Webp} 320w, ${maskotUzgun640Webp} 640w, ${maskotUzgun960Webp} 960w`}
                        sizes="(max-width: 768px) 35vw, 30vw"
                    />
                    <img
                        src={maskotUzgun}
                        alt="mascot sad"
                        className="w-full h-auto"
                        width={1516}
                        height={1689}
                        loading="lazy"
                        decoding="async"
                    />
                </picture>
            </div>
        </MainLayout>
    );
};

export default NotFoundPage;

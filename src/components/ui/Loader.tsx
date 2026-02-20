/**
 * HSD Arena - Loader Component
 * 
 * Loading spinner component with different sizes and variants.
 */

import { cn } from '@/utils/cn';

export interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse';
    className?: string;
    fullScreen?: boolean;
    text?: string;
}

const Loader = ({
    size = 'md',
    variant = 'spinner',
    className,
    fullScreen = false,
    text
}: LoaderProps) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const Spinner = () => (
        <div
            className={cn(
                'border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin',
                sizeStyles[size],
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );

    const Dots = () => (
        <div className={cn('flex space-x-2', className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'bg-primary-600 rounded-full animate-bounce',
                        size === 'sm' && 'w-2 h-2',
                        size === 'md' && 'w-3 h-3',
                        size === 'lg' && 'w-4 h-4',
                        size === 'xl' && 'w-5 h-5'
                    )}
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );

    const Pulse = () => (
        <div
            className={cn(
                'bg-primary-600 rounded-full animate-pulse',
                sizeStyles[size],
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );

    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse />;
            default:
                return <Spinner />;
        }
    };

    const content = (
        <div className="flex flex-col items-center gap-3">
            {renderLoader()}
            {text && <p className="text-secondary text-sm font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
                {content}
            </div>
        );
    }

    return content;
};

export default Loader;

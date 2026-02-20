/**
 * HSD Arena - Avatar Component
 * 
 * User avatar component with fallback initials.
 */

import { useState } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar = ({
    src,
    alt,
    name,
    size = 'md',
    className,
}: AvatarProps) => {
    const [imageError, setImageError] = useState(false);

    const sizeStyles = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    // Get initials from name
    const getInitials = (name?: string): string => {
        if (!name) return '?';

        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const showFallback = !src || imageError;

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center rounded-full',
                'bg-gradient-to-br from-primary-500 to-secondary-500',
                'text-white font-semibold',
                'overflow-hidden',
                sizeStyles[size],
                className
            )}
        >
            {!showFallback ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};

export default Avatar;

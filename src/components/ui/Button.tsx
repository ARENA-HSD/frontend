/**
 * HSD Arena - Button Component
 * 
 * Reusable button component with variants and states.
 * All hover/active states pre-calculated in variables.css.
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {

        const baseStyles = `inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none disabled:cursor-not-allowed`;

        const sizeStyles = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
            xl: 'px-8 py-4 text-xl',
        };

        const widthStyles = fullWidth ? 'w-full' : '';

        // Use CSS variables with hover/active pseudo-classes
        // No inline styles needed - all handled by CSS
        const variantClass = {
            primary: 'text-primary-oposite btn-primary shadow-[0_6px_12px_-2px_var(--btn-primary-bg)] bg-gradient-to-b from-[var(--btn-primary-bg)] to-[color-mix(in_srgb,var(--btn-primary-bg),black_40%)]',
            secondary: 'text-secondary-oposite btn-secondary shadow-[0_6px_12px_-2px_var(--btn-secondary-bg)] bg-gradient-to-b from-[var(--btn-secondary-bg)] to-[color-mix(in_srgb,var(--btn-secondary-bg),black_40%)]',
            success: 'text-success btn-success shadow-[0_6px_12px_-2px_var(--btn-success-bg)] bg-gradient-to-b from-[var(--btn-success-bg)] to-[color-mix(in_srgb,var(--btn-success-bg),black_40%)]',
            warning: 'text-warning btn-warning shadow-[0_6px_12px_-2px_var(--btn-warning-bg)] bg-gradient-to-b from-[var(--btn-warning-bg)] to-[color-mix(in_srgb,var(--btn-warning-bg),black_40%)]',
            danger: 'text-danger btn-danger shadow-[0_6px_12px_-2px_var(--btn-danger-bg)] bg-gradient-to-b from-[var(--btn-danger-bg)] to-[color-mix(in_srgb,var(--btn-danger-bg),black_40%)]',
            ghost: 'text-ghost btn-ghost shadow-[0_6px_12px_-2px_var(--btn-ghost-bg)] bg-gradient-to-b from-[var(--btn-ghost-bg)] to-[color-mix(in_srgb,var(--btn-ghost-bg),black_40%)]',
            outline: 'text-outline btn-outline shadow-[0_6px_12px_-2px_var(--btn-outline-bg)] bg-gradient-to-b from-[var(--btn-outline-bg)] to-[color-mix(in_srgb,var(--btn-outline-bg),black_40%)]',
        }[variant];

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantClass,
                    sizeStyles[size],
                    widthStyles,
                    className,
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;

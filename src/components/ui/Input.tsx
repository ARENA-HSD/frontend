/**
 * HSD Arena - Input Component
 * 
 * Reusable input component with validation and error states.
 */

import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  suffix?: string; // Text to show after input (e.g., ".hsdarena.com")
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      suffix,
      fullWidth = false,
      required = false,
      disabled = false,
      type = 'text',
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <div className="mb-2">
            <label className="text-primary text-sm font-medium">
              {label}
              {required && <span className="text-role-danger ml-1">*</span>}
            </label>
          </div>
        )}

        <div className="relative">
          {suffix ? (
            // Input with suffix
            <div className="flex items-stretch">
              <input
                ref={ref}
                type={type}
                className={cn(
                  'flex-1 px-3 py-2 rounded-l-lg border transition-colors',
                  'bg-input text-primary placeholder:text-placeholder',
                  'focus:outline-none focus:ring-2 focus:ring-role-primary focus:border-transparent',
                  error
                    ? 'border-role-danger focus:ring-role-danger'
                    : 'border-divider hover:border-tertiary',
                  disabled && 'opacity-50 cursor-not-allowed',
                  className
                )}
                required={required}
                disabled={disabled}
                onChange={onChange}
                {...props}
              />
              <div className="px-3 py-2 bg-card border border-l-0 border-divider rounded-r-lg text-tertiary text-sm flex items-center">
                {suffix}
              </div>
            </div>
          ) : (
            // Regular input without suffix
            <input
              ref={ref}
              type={type}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors',
                'bg-input text-primary placeholder:text-placeholder',
                'focus:outline-none focus:ring-2 focus:ring-role-primary focus:border-transparent',
                error
                  ? 'border-role-danger focus:ring-role-danger'
                  : 'border-divider hover:border-tertiary',
                disabled && 'opacity-50 cursor-not-allowed',
                className
              )}
              required={required}
              disabled={disabled}
              onChange={onChange}
              {...props}
            />
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-role-danger' : 'text-tertiary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

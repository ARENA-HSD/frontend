import type { MouseEvent } from 'react';
import { Link } from "react-router-dom";
import { cn } from '@/utils/cn';

interface SidebarItemData {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    label: string;
    icon: string;
    path?: string;
    disabled?: boolean;
    badge?: string;
    onClick?: () => void | Promise<void>;
}

interface SidebarItemProps {
    item: SidebarItemData;
    onClose?: () => void;
    isActive: (path: string) => boolean;
}

const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

const variantStyles = {
    primary: 'text-primary-oposite btn-primary shadow-[0_6px_12px_-2px_var(--btn-primary-bg)] bg-gradient-to-b from-[var(--btn-primary-bg)] to-[color-mix(in_srgb,var(--btn-primary-bg),black_40%)]',
    secondary: 'text-secondary-oposite btn-secondary shadow-[0_6px_12px_-2px_var(--btn-secondary-bg)] bg-gradient-to-b from-[var(--btn-secondary-bg)] to-[color-mix(in_srgb,var((--btn-secondary-bg),black_40%)]',
    danger: 'text-danger btn-danger shadow-[0_6px_12px_-2px_var(--btn-danger-bg)] bg-gradient-to-b from-[var(--btn-danger-bg)] to-[color-mix(in_srgb,var(--btn-danger-bg),black_40%)]',
    ghost: 'text-ghost btn-ghost shadow-[0_6px_12px_-2px_var(--btn-ghost-bg)] bg-gradient-to-b from-[var(--btn-ghost-bg)] to-[color-mix(in_srgb,var(--btn-ghost-bg),black_40%)]',
    outline: 'text-outline btn-outline shadow-[0_6px_12px_-2px_var(--btn-outline-bg)] bg-gradient-to-b from-[var(--btn-outline-bg)] to-[color-mix(in_srgb,var(--btn-outline-bg),black_40%)]',
};

const SidebarItem = ({ item, onClose, isActive }: SidebarItemProps) => {
    const active = !!item.path && isActive(item.path) && !item.disabled;
    const isActionItem = !item.path || !!item.onClick;
    const inactiveStyle = item.variant === 'danger'
        ? 'text-role-danger hover:bg-role-danger-light'
        : 'text-primary hover:bg-role-primary-light';
    const variant = item.variant ?? 'primary';
    const size = item.size ?? 'md';
    const commonClassName = cn(
        'inline-flex w-full items-center justify-start gap-3 font-medium rounded-xl transition-all focus:outline-none',
        sizeStyles[size],
        active ? variantStyles[variant] : inactiveStyle,
        item.disabled && 'opacity-50 cursor-not-allowed',
    );

    const handleClick = (e?: MouseEvent<HTMLButtonElement>) => {
        if (item.disabled) {
            e?.preventDefault();
            return;
        }

        onClose?.();
        if (item.onClick) {
            void item.onClick();
        }
    };

    if (isActionItem) {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={item.disabled}
                className={commonClassName}
                style={{
                    opacity: item.disabled ? 'var(--state-disabled-opacity)' : undefined,
                }}
            >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>

                {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-role-info-light text-role-info">
                        {item.badge}
                    </span>
                )}
            </button>
        );
    }

    return (
        <Link
            key={item.path}
            to={item.disabled ? '#' : item.path!}
            onClick={(e) => {
                if (item.disabled) e.preventDefault();
                handleClick();
            }}
            className={commonClassName}
            style={{
                opacity: item.disabled ? 'var(--state-disabled-opacity)' : undefined,
            }}
        >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>

            {item.badge && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-role-info-light text-role-info">
                    {item.badge}
                </span>
            )}
        </Link>
    );
};

export default SidebarItem;

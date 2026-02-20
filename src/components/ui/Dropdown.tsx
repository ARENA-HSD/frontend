/**
 * HSD Arena - Dropdown Component
 * 
 * Dropdown menu component for navigation and actions.
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItem {
    label: string;
    sublabel?: string; // Optional secondary text
    onClick: () => void;
    icon?: ReactNode;
    danger?: boolean;
    disabled?: boolean;
    divider?: boolean; // Show divider before this item
}

export interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

const Dropdown = ({ trigger, items, align = 'right', className }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleItemClick = (item: DropdownItem) => {
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div ref={dropdownRef} className={cn('relative inline-block', className)}>
            {/* Trigger */}
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {/* Menu */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute z-dropdown mt-2',
                        'bg-card rounded-lg shadow-lg border border-divider',
                        'py-1 min-w-[12rem] max-w-xs',
                        'animate-in fade-in slide-in-from-top-2 duration-200',
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {items.map((item, index) => (
                        <div key={index}>
                            {/* Divider */}
                            {item.divider && index > 0 && (
                                <div className="my-1 border-t border-divider" />
                            )}

                            {/* Item */}
                            <button
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                                className={cn(
                                    'w-full px-4 py-2.5 text-left text-sm flex items-start gap-3 transition-colors',
                                    item.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : item.danger
                                            ? 'dropdown-item-danger'
                                            : 'dropdown-item-normal'
                                )}
                            >
                                {/* Icon */}
                                {item.icon && (
                                    <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                                )}

                                {/* Label + Sublabel */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-primary truncate">
                                        {item.label}
                                    </div>
                                    {item.sublabel && (
                                        <div className="text-xs text-tertiary truncate mt-0.5">
                                            {item.sublabel}
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

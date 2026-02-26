/**
 * HSD Arena - TopBar Component
 * 
 * Top navigation bar with organization switcher
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, ThemeSwitcher } from '@/components';
import { useAuth } from '@/hooks';
import { useSubdomain } from '@/hooks';
import type { DropdownItem } from '@/components';

const TopBar = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();
    const { logout, user, currentOrganization, selectOrganization } = useAuth();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // User menu items
    const userMenuItems: DropdownItem[] = [
        {
            label: 'Profile',
            icon: '👤',
            onClick: () => console.log('Profile clicked'),
        },
        {
            label: 'Settings',
            icon: '⚙️',
            onClick: () => console.log('Settings clicked'),
        },
        {
            label: 'Logout',
            icon: '🚪',
            onClick: handleLogout,
            danger: true,
        },
    ];

    // Organization switcher items (only if user has orgs)
    const orgMenuItems: DropdownItem[] = user?.organizations
        ? [
            ...user.organizations.map(org => ({
                label: org.name,
                sublabel: org.subdomain,
                icon: org.id === currentOrganization?.id ? '✓' : '🏢',
                onClick: () => {
                    selectOrganization(org);
                    // In production, redirect to subdomain
                    window.location.href = `https://${org.subdomain}.hsdarena.com`;
                },
            })),
            {
                label: 'Manage Organizations',
                icon: '⚙️',
                onClick: () => {
                    window.location.href = '/organizations';
                },
                divider: true,
            },
        ]
        : [];

    const displayName = user?.username || 'User';
    const displayOrgName = currentOrganization?.name || 'HSD Arena';

    return (
        <header className="bg-card border-b border-divider sticky top-0 z-40">
            <div className="h-16 px-4 flex items-center justify-between gap-4">
                {/* Left: Organization Branding + Switcher */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="lg:hidden text-primary hover:text-secondary transition-colors flex-shrink-0"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="text-2xl flex-shrink-0">🎮</div>

                    {/* Organization Info + Switcher */}
                    {subdomain && currentOrganization && orgMenuItems.length > 0 ? (
                        <Dropdown
                            trigger={
                                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <h1 className="text-lg font-bold text-primary truncate">{displayOrgName}</h1>
                                            <svg className="w-4 h-4 text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-tertiary truncate">{currentOrganization.subdomain}.hsdarena.com</p>
                                    </div>
                                </button>
                            }
                            items={orgMenuItems}
                            align="left"
                        />
                    ) : (
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-primary truncate">{displayOrgName}</h1>
                            <p className="text-xs text-tertiary">Quiz Platform</p>
                        </div>
                    )}
                </div>

                {/* Right: Theme + User */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <ThemeSwitcher />

                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Avatar name={displayName} size="sm" />
                                <span className="hidden sm:block text-sm font-medium text-primary">{displayName}</span>
                            </button>
                        }
                        items={userMenuItems}
                        align="right"
                    />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="lg:hidden border-t border-divider bg-card">
                    <nav className="px-4 py-2">
                        <p className="text-sm text-tertiary">Mobile menu items here</p>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default TopBar;
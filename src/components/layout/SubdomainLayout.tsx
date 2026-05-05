/**
 * HSD Arena - Subdomain Layout
 * 
 * Authenticated layout for subdomain with TopBar and Sidebar
 */

import { type ReactNode, useMemo } from 'react';
import { useAuth, useSubdomain } from '@/hooks';
import MainLayout from './MainLayout';

interface SubdomainLayoutProps {
    children: ReactNode;
}

const SubdomainLayout = ({ children }: SubdomainLayoutProps) => {
    const { user } = useAuth();
    const subdomain = useSubdomain();

    const navItems = useMemo(() => {
        const items = [
            {
                label: 'Quizzes',
                icon: '📊',
                path: '/manager/quizzes',
            },
            {
                label: 'Members',
                icon: '👥',
                path: '/manager/members',
            },
            {
                label: 'Logs',
                icon: '📋',
                path: '/manager/logs',
                disabled: true,
                badge: 'V2',
            },
        ];

        // Only show Settings for SUPER_ADMIN
        const currentOrg = user?.organizations?.find(org => org.subdomain === subdomain);
        if (currentOrg?.role === 'SUPER_ADMIN') {
            items.push({
                label: 'Settings',
                icon: '⚙️',
                path: '/manager/settings',
            });
        }

        return items;
    }, [user, subdomain]);

    return (
        <MainLayout sidebar={true} navItems={navItems}>
            {children}
        </MainLayout>
    );
};

export default SubdomainLayout;

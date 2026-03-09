/**
 * HSD Arena - Subdomain Layout
 * 
 * Authenticated layout for subdomain with TopBar and Sidebar
 */

import { type ReactNode } from 'react';
import MainLayout from './MainLayout';

interface SubdomainLayoutProps {
    children: ReactNode;
}

const SubdomainLayout = ({ children }: SubdomainLayoutProps) => {
    const navItems = [
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
    return (
        <MainLayout sidebar={true} navItems={navItems}>
            {children}
        </MainLayout>
    );
};

export default SubdomainLayout;

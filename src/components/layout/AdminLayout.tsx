/**
 * HSD Arena - Admin Layout
 * 
 * Authenticated layout for admin with TopBar and Sidebar
 */

import { type ReactNode } from 'react';
import MainLayout from './MainLayout';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navItems = [
        {
            label: 'Info',
            icon: '📊',
            path: '/admin/info',
        },
        {
            label: 'Users',
            icon: '👥',
            path: '/admin/users',
        },
        {
            label: 'Organizations',
            icon: '🏢',
            path: '/admin/organizations',
        },
        {
            label: 'Logs',
            icon: '📋',
            path: '/admin/logs',
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

export default AdminLayout;

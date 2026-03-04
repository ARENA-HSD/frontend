/**
 * HSD Arena - Organizations Page
 * 
 * Main dashboard showing user's organizations (fetched from API)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@/hooks';
import { Button, MainLayout } from '@/components';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { user, isLoading, error, refetch, update, remove } = useUser(authUser?.id);

    useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <MainLayout>
            <div className="space-y-6">
                {user?.id}
                <br />
                {user?.username}
                <br />
                {user?.email}
                <br />
                {user?.createdAt}
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
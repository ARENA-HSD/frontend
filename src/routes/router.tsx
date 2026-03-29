/**
 * HSD Arena - Router Configuration
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';
import ProtectedRoute from './ProtectedRoute';
import SubdomainGuard from './SubdomainGuard';
import {
    HomePage,
    LoginPage,
    RegisterPage,
    OrganizationsPage,
    CreateOrganizationPage,
    UpdateOrganizationPage,
    MyInvitationsPage,
    NotFoundPage,
} from '@/pages';

// Manager Pages
import {
    QuizListPage,
    QuizDetailPage,
    CreateQuizPage,
    CreateQuestionPage,
    EditQuestionPage,
    QuizLivePage,
    MembersPage,
    InvitationsPage,
} from '@/pages/subdomain/manager';

// Participant Pages
import {
    JoinGamePage,
    ParticipantGamePage,
} from '@/pages/subdomain/participant';
import {
    AdminInfoPage,
    AdminUsersPage,
    AdminOrganizationsPage,
} from '@/pages/subdomain/admin';
import ProfilePage from '@/pages/ProfilePage';

const SubdomainHomePage = () => {
    const subdomain = useSubdomain();

    if (subdomain === 'admin') {
        return <Navigate to="/admin/info" replace />;
    }

    return <QuizListPage />;
};

/**
 * Main Domain Router
 */
const mainDomainRouter = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/organizations',
        element: (
            <ProtectedRoute>
                <OrganizationsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/organizations/create',
        element: (
            <ProtectedRoute>
                <CreateOrganizationPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/organizations/:subdomain/update',
        element: (
            <ProtectedRoute>
                <UpdateOrganizationPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/invitations',
        element: (
            <ProtectedRoute>
                <MyInvitationsPage />
            </ProtectedRoute>
        ),
    },
    // ========== Catch-all ==========
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

/**
 * Subdomain Router  
 */
const subdomainRouter = createBrowserRouter([
    {
        path: '/',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <SubdomainHomePage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/login',
        element: (
            <SubdomainGuard>
                <LoginPage />
            </SubdomainGuard>
        ),
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute>
                <Navigate to="/admin/info" replace />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/info',
        element: (
            <ProtectedRoute>
                <AdminInfoPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/users',
        element: (
            <ProtectedRoute>
                <AdminUsersPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/organizations',
        element: (
            <ProtectedRoute>
                <AdminOrganizationsPage />
            </ProtectedRoute>
        ),
    },
    // Manager Routes
    {
        path: '/manager/quizzes',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizListPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/quizzes/new',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <CreateQuizPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/quizzes/:id',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizDetailPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/quizzes/:id/live',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizLivePage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/quizzes/:id/questions/new',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <CreateQuestionPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/quizzes/:id/questions/:questionId/edit',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <EditQuestionPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/members',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <MembersPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    {
        path: '/manager/invitations',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <InvitationsPage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
    // Participant Routes (no auth required)
    {
        path: '/join',
        element: (
            <SubdomainGuard>
                <JoinGamePage />
            </SubdomainGuard>
        ),
    },
    {
        path: '/play/game',
        element: (
            <SubdomainGuard>
                <ParticipantGamePage />
            </SubdomainGuard>
        ),
    },
    {
        path: '*',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <SubdomainHomePage />
                </ProtectedRoute>
            </SubdomainGuard>
        ),
    },
]);

const AppRouter = () => {
    const subdomain = useSubdomain();
    const router = subdomain ? subdomainRouter : mainDomainRouter;
    return <RouterProvider router={router} />;
};

export default AppRouter;
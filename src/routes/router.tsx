/**
 * HSD Arena - Router Configuration
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
} from '@/pages';

// Manager Pages
import {
    QuizListPage,
    QuizDetailPage,
    CreateQuizPage,
    CreateQuestionPage,
    EditQuestionPage,
    QuizLobbyPage,
    QuizLivePage,
    QuizResultsPage,
    MembersPage,
    InvitationsPage,
} from '@/pages/subdomain/manager';

// Participant Pages
import {
    JoinGamePage,
    ParticipantLobbyPage,
    ParticipantGamePage,
    ParticipantResultPage,
} from '@/pages/subdomain/participant';
import ProfilePage from '@/pages/ProfilePage';

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
    // ========== Catch-all ==========
    {
        path: '*',
        element: <LoginPage />,
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
                    <QuizListPage />
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
        path: '/manager/quizzes/:id/lobby',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizLobbyPage />
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
        path: '/manager/quizzes/:id/results',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizResultsPage />
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
        path: '/play/lobby',
        element: (
            <SubdomainGuard>
                <ParticipantLobbyPage />
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
        path: '/play/results',
        element: (
            <SubdomainGuard>
                <ParticipantResultPage />
            </SubdomainGuard>
        ),
    },
    {
        path: '*',
        element: (
            <SubdomainGuard>
                <ProtectedRoute>
                    <QuizListPage />
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
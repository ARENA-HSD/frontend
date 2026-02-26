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
} from '@/pages';

// Quiz Pages
import QuizListPage from '@/pages/subdomain/manager/QuizListPage';
import QuizDetailPage from '@/pages/subdomain/manager/QuizDetailPage';
import CreateQuizPage from '@/pages/subdomain/manager/CreateQuizPage';
import CreateQuestionPage from '@/pages/subdomain/manager/CreateQuestionPage';
import EditQuestionPage from '@/pages/subdomain/manager/EditQuestionPage';
import QuizLobbyPage from '@/pages/subdomain/manager/QuizLobbyPage';
import QuizLivePage from '@/pages/subdomain/manager/QuizLivePage';
import QuizResultsPage from '@/pages/subdomain/manager/QuizResultsPage';

// Participant Pages
import JoinGamePage from '@/pages/subdomain/participant/JoinGamePage';
import ParticipantLobbyPage from '@/pages/subdomain/participant/ParticipantLobbyPage';
import ParticipantGamePage from '@/pages/subdomain/participant/ParticipantGamePage';
import ParticipantResultPage from '@/pages/subdomain/participant/ParticipantResultPage';

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
    // ========== Subdomain Routes (under /subdomain prefix for dev) ==========
    {
        path: '/subdomain/manager/quizzes',
        element: (
            <ProtectedRoute>
                <QuizListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/new',
        element: (
            <ProtectedRoute>
                <CreateQuizPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id',
        element: (
            <ProtectedRoute>
                <QuizDetailPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id/lobby',
        element: (
            <ProtectedRoute>
                <QuizLobbyPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id/live',
        element: (
            <ProtectedRoute>
                <QuizLivePage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id/results',
        element: (
            <ProtectedRoute>
                <QuizResultsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id/questions/new',
        element: (
            <ProtectedRoute>
                <CreateQuestionPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/subdomain/manager/quizzes/:id/questions/:questionId/edit',
        element: (
            <ProtectedRoute>
                <EditQuestionPage />
            </ProtectedRoute>
        ),
    },
    // ========== Participant Routes (under /subdomain prefix for dev, no auth required) ==========
    {
        path: '/subdomain/join',
        element: <JoinGamePage />,
    },
    {
        path: '/subdomain/play/lobby',
        element: <ParticipantLobbyPage />,
    },
    {
        path: '/subdomain/play/game',
        element: <ParticipantGamePage />,
    },
    {
        path: '/subdomain/play/results',
        element: <ParticipantResultPage />,
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
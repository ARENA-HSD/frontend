/**
 * HSD Arena - Root Application Component
 * 
 * Main entry point with router and auth provider
 */

import { AuthProvider } from '@/context';
import AppRouter from '@/routes/router';
import { AuthSync } from '@/components';

function App() {
    return (
        <AuthProvider>
            <AppRouter />
            <AuthSync />
        </AuthProvider>
    );
}

export default App;

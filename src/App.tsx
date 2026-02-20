/**
 * HSD Arena - Root Application Component
 * 
 * Main entry point with router and auth provider
 */

import { AuthProvider } from '@/context';
import AppRouter from '@/routes/router';

function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

export default App;

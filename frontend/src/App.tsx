import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AppLayout     from './components/layout/AppLayout';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage    from './pages/HabitsPage';
import GoalsPage     from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotesPage     from './pages/NotesPage';
import SettingsPage  from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

const Private = ({ children }: { children: React.ReactNode }) => {
  const ok = useAuthStore(s => s.isAuthenticated);
  return ok ? <>{children}</> : <Navigate to="/login" replace />;
};
const Public = ({ children }: { children: React.ReactNode }) => {
  const ok = useAuthStore(s => s.isAuthenticated);
  return !ok ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />
          <Route element={<Private><AppLayout /></Private>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/habits"    element={<HabitsPage />} />
            <Route path="/goals"     element={<GoalsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notes"     element={<NotesPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a28',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
          },
        }}
      />
    </QueryClientProvider>
  );
}

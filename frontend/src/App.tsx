import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSession } from '@/features/auth/useAuth';

// Lazy-load route-level pages for code splitting
const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((m) => ({ default: m.HomePage }))
);
const HadithPage = lazy(() =>
  import('@/features/hadith/HadithPage').then((m) => ({ default: m.HadithPage }))
);
const SavedPage = lazy(() =>
  import('@/features/saved/SavedPage').then((m) => ({ default: m.SavedPage }))
);
const ExplorePage = lazy(() =>
  import('@/features/explore/ExplorePage').then((m) => ({ default: m.ExplorePage }))
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const NotFoundPage = lazy(() =>
  import('@/features/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Query client with sensible defaults for a read-heavy app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 30 * 60 * 1000, // 30 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// Restores session from httpOnly cookie on app load
function SessionRestorer({ children }: { children: React.ReactNode }) {
  useSession();
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary label="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionRestorer>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/hadith" element={<HadithPage />} />
                  <Route
                    path="/saved"
                    element={
                      <AuthGuard>
                        <SavedPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <AuthGuard>
                        <ProfilePage />
                      </AuthGuard>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </SessionRestorer>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '8px',
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                fontSize: '14px',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

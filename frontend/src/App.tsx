import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSession } from '@/features/auth/useAuth';
import { CommandPalette } from '@/components/CommandPalette';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useSocket } from '@/hooks/useSocket';

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
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const SearchPage = lazy(() =>
  import('@/features/search/SearchPage').then((m) => ({ default: m.SearchPage }))
);
const CommunityPage = lazy(() =>
  import('@/features/community/CommunityPage').then((m) => ({ default: m.CommunityPage }))
);
const FeedPage = lazy(() =>
  import('@/features/feed/FeedPage').then((m) => ({ default: m.FeedPage }))
);
const PostDetailPage = lazy(() =>
  import('@/features/feed/PostDetailPage').then((m) => ({ default: m.PostDetailPage }))
);
const NotificationsPage = lazy(() =>
  import('@/features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const UserProfilePage = lazy(() =>
  import('@/features/user/UserProfilePage').then((m) => ({ default: m.UserProfilePage }))
);
const NotFoundPage = lazy(() =>
  import('@/features/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const MessagesPage = lazy(() =>
  import('@/features/messages/MessagesPage').then((m) => ({ default: m.MessagesPage }))
);
const StreamsPage = lazy(() =>
  import('@/features/streams/StreamsPage').then((m) => ({ default: m.StreamsPage }))
);
const StreamViewPage = lazy(() =>
  import('@/features/streams/StreamViewPage').then((m) => ({ default: m.StreamViewPage }))
);
const GoLivePage = lazy(() =>
  import('@/features/streams/GoLivePage').then((m) => ({ default: m.GoLivePage }))
);
const PrivacyPolicy = lazy(() => import('@/features/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/features/legal/TermsOfService'));

import CookieConsent from '@/components/CookieConsent';

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
  useSocket(); // Connect Socket.IO when authenticated
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
                  <Route
                    path="/feed"
                    element={
                      <AuthGuard>
                        <FeedPage />
                      </AuthGuard>
                    }
                  />
                  <Route path="/post/:id" element={<PostDetailPage />} />
                  <Route
                    path="/notifications"
                    element={
                      <AuthGuard>
                        <NotificationsPage />
                      </AuthGuard>
                    }
                  />
                  <Route path="/user/:username" element={<UserProfilePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/search" element={<SearchPage />} />
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
                  <Route
                    path="/settings"
                    element={
                      <AuthGuard>
                        <SettingsPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <AuthGuard>
                        <CommunityPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <AuthGuard>
                        <MessagesPage />
                      </AuthGuard>
                    }
                  />
                  <Route path="/streams" element={<StreamsPage />} />
                  <Route path="/streams/:id" element={<StreamViewPage />} />
                  <Route
                    path="/go-live"
                    element={
                      <AuthGuard>
                        <GoLivePage />
                      </AuthGuard>
                    }
                  />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </SessionRestorer>

          <CommandPalette />
          <InstallPrompt />
          <CookieConsent />

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

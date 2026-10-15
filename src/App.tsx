import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { queryClient } from '@/lib/queryClient'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { CandidateLayout, RecruiterLayout } from '@/components/layouts'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { UnauthorizedPage, NotFoundPage } from '@/pages/ErrorPages'

// Candidate feature pages
import { JobFeedPage } from '@/features/candidate/JobFeedPage'
import { CandidateProfilePage } from '@/features/candidate/CandidateProfilePage'
import { CandidateApplicationsPage, CandidateSavedJobsPage } from '@/features/candidate/CandidateApplicationsPage'

// Recruiter feature pages
import { RecruiterDashboard } from '@/features/recruiter/RecruiterDashboard'
import { RecruiterPostJobPage } from '@/features/recruiter/RecruiterPostJobPage'

/** Redirect logged-in users away from auth pages */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (session && profile) {
    return <Navigate to={profile.role === 'recruiter' ? '/recruiter' : '/candidate'} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Candidate routes */}
      <Route element={<ProtectedRoute role="candidate" />}>
        <Route element={<CandidateLayout />}>
          <Route path="/candidate" element={<JobFeedPage />} />
          <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
          <Route path="/candidate/saved" element={<CandidateSavedJobsPage />} />
        </Route>
      </Route>

      {/* Recruiter routes */}
      <Route element={<ProtectedRoute role="recruiter" />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/recruiter/post" element={<RecruiterPostJobPage />} />
          <Route path="/recruiter/post/:jobId" element={<RecruiterPostJobPage />} />
          <Route path="/recruiter/jobs/:jobId" element={<RecruiterDashboard />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px' },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

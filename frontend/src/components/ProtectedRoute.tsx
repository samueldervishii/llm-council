import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'
import './ProtectedRoute.css'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, networkError } = useAuth()

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    )
  }

  if (networkError && !isAuthenticated) {
    return (
      <div className="network-error-screen">
        <div className="network-error-card" role="alert" aria-live="polite">
          <div className="network-error-icon" aria-hidden>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          <h2 className="network-error-title">Cannot reach the server</h2>
          <p className="network-error-text">
            Cortex cannot connect right now. Check your internet connection.
          </p>
          <p className="network-error-retry-hint">
            We&apos;ll keep retrying in the background. See the{' '}
            <Link to="/status" className="network-error-link">
              status page
            </Link>{' '}
            for updates.
          </p>
          <div className="network-error-actions">
            <button
              type="button"
              className="network-error-btn primary"
              onClick={() => window.location.reload()}
            >
              Retry now
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

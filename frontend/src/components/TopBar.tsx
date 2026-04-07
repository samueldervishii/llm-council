import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface TopBarProps {
  onNewChat: () => void
  onToggleSidebar: () => void
  onOpenCommandPalette: () => void
  sidebarOpen?: boolean
  onOpenArtifacts?: () => void
  hasSession?: boolean
}

function TopBar({ onNewChat, onToggleSidebar, onOpenCommandPalette, sidebarOpen, onOpenArtifacts, hasSession }: TopBarProps) {
  const { user, logout } = useAuth() as any
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {!sidebarOpen && (
          <button className="menu-btn" onClick={onToggleSidebar} title="Open sidebar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
      </div>

      <div className="top-bar-right">
        <button className="top-bar-icon-btn" onClick={onOpenCommandPalette} title="Search (Ctrl+K)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {hasSession && onOpenArtifacts && (
          <button className="top-bar-icon-btn" onClick={onOpenArtifacts} title="Artifacts">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </button>
        )}

        <button className="top-bar-icon-btn" onClick={onNewChat} title="New chat">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {user && (
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              className="top-bar-avatar"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              title={user.email}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="top-bar-avatar-img" />
              ) : (
                (user.display_name || user.username || user.email || '?')[0].toUpperCase()
              )}
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                {(user.display_name || user.username) && (
                  <div className="user-dropdown-name">{user.display_name || user.username}</div>
                )}
                <div className="user-dropdown-email">{user.email}</div>
                <div className="user-dropdown-divider" />
                <button
                  className="user-dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate('/settings?tab=general')
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
                <button
                  className="user-dropdown-item logout"
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar

import { useState, useEffect, useRef } from 'react'
import { FRONTEND_VERSION } from '../config/api'

function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onShareSession,
  onClose,
  onNewChat,
}) {
  const [shareModal, setShareModal] = useState({ open: false, url: '', loading: false })
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const searchInputRef = useRef(null)
  const editInputRef = useRef(null)

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const title = (session.title || '').toLowerCase()
    const question = (session.question || '').toLowerCase()
    return title.includes(query) || question.includes(query)
  })

  // Separate pinned and unpinned sessions
  const pinnedSessions = filteredSessions.filter((s) => s.is_pinned)
  const recentSessions = filteredSessions.filter((s) => !s.is_pinned)

  // Ctrl+F to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery])
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const truncateQuestion = (question, maxLength = 40) => {
    if (!question) return 'Empty session'
    if (question.length <= maxLength) return question
    return question.substring(0, maxLength) + '...'
  }

  const handleShare = async (e, sessionId) => {
    e.stopPropagation()
    setShareModal({ open: true, url: '', loading: true })
    try {
      const data = await onShareSession(sessionId)
      // Build frontend share URL
      const frontendUrl = `${window.location.origin}/shared/${data.share_token}`
      setShareModal({ open: true, url: frontendUrl, loading: false })
    } catch (error) {
      setShareModal({ open: false, url: '', loading: false })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareModal.url)
  }

  const startEditing = (e, session) => {
    e.stopPropagation()
    setEditingId(session.id)
    setEditTitle(session.title || session.question?.substring(0, 50) || '')
    // Focus the input after render
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const saveEdit = async (e) => {
    e?.stopPropagation()
    if (editingId && editTitle.trim()) {
      await onRenameSession(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const cancelEdit = (e) => {
    e?.stopPropagation()
    setEditingId(null)
    setEditTitle('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit(e)
    } else if (e.key === 'Escape') {
      cancelEdit(e)
    }
  }

  const handlePin = async (e, sessionId) => {
    e.stopPropagation()
    await onTogglePinSession(sessionId)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          Chat History <span className="session-count">({sessions.length})</span>
        </h2>
        <button className="sidebar-close" onClick={onClose}>
          &times;
        </button>
      </div>

      <button className="sidebar-new-chat" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="sidebar-search">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search chats... (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            &times;
          </button>
        )}
      </div>

      <div className="sidebar-sessions">
        {filteredSessions.length === 0 ? (
          <p className="sidebar-empty">
            {searchQuery ? 'No matching chats found' : 'No chat history yet'}
          </p>
        ) : (
          <>
            {pinnedSessions.length > 0 && (
              <>
                <div className="sidebar-section-header">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M16 4a1 1 0 0 1 .117 1.993L16 6h-.09l-1.18 6.5a3 3 0 0 1-1.23 1.878V18h1a1 1 0 0 1 0 2H9.5a1 1 0 1 1 0-2h1v-3.622a3 3 0 0 1-1.23-1.878L8.09 6H8a1 1 0 0 1 0-2h8z" />
                  </svg>
                  <span>Pinned</span>
                </div>
                {pinnedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`sidebar-session ${session.id === currentSessionId ? 'active' : ''} pinned`}
                    onClick={() => editingId !== session.id && onSelectSession(session.id)}
                  >
                    <div className="session-info">
                      {editingId === session.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          className="session-edit-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={saveEdit}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="session-question">
                          {truncateQuestion(session.title || session.question)}
                        </span>
                      )}
                      <div className="session-meta">
                        <span className="session-date">{formatDate(session.created_at)}</span>
                        {session.round_count > 1 && (
                          <span className="session-rounds">{session.round_count} rounds</span>
                        )}
                      </div>
                    </div>
                    <div className="session-actions">
                      <button
                        className="session-pin active"
                        onClick={(e) => handlePin(e, session.id)}
                        title="Unpin session"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="none"
                        >
                          <path d="M16 4a1 1 0 0 1 .117 1.993L16 6h-.09l-1.18 6.5a3 3 0 0 1-1.23 1.878V18h1a1 1 0 0 1 0 2H9.5a1 1 0 1 1 0-2h1v-3.622a3 3 0 0 1-1.23-1.878L8.09 6H8a1 1 0 0 1 0-2h8z" />
                        </svg>
                      </button>
                      <button
                        className="session-edit"
                        onClick={(e) => startEditing(e, session)}
                        title="Rename session"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="session-share"
                        onClick={(e) => handleShare(e, session.id)}
                        title="Share session"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </button>
                      <button
                        className="session-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSession(session.id)
                        }}
                        title="Delete session"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {recentSessions.length > 0 && (
              <>
                {pinnedSessions.length > 0 && (
                  <div className="sidebar-section-header">
                    <span>Recent</span>
                  </div>
                )}
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`sidebar-session ${session.id === currentSessionId ? 'active' : ''} ${session.is_pinned ? 'pinned' : ''}`}
                    onClick={() => editingId !== session.id && onSelectSession(session.id)}
                  >
                    <div className="session-info">
                      {editingId === session.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          className="session-edit-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={saveEdit}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="session-question">
                          {session.is_pinned && <span className="pin-icon">📌</span>}
                          {truncateQuestion(session.title || session.question)}
                        </span>
                      )}
                      <div className="session-meta">
                        <span className="session-date">{formatDate(session.created_at)}</span>
                        {session.round_count > 1 && (
                          <span className="session-rounds">{session.round_count} rounds</span>
                        )}
                      </div>
                    </div>
                    <div className="session-actions">
                      <button
                        className={`session-pin ${session.is_pinned ? 'active' : ''}`}
                        onClick={(e) => handlePin(e, session.id)}
                        title={session.is_pinned ? 'Unpin session' : 'Pin session'}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={session.is_pinned ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={session.is_pinned ? '0' : '2'}
                        >
                          <path d="M16 4a1 1 0 0 1 .117 1.993L16 6h-.09l-1.18 6.5a3 3 0 0 1-1.23 1.878V18h1a1 1 0 0 1 0 2H9.5a1 1 0 1 1 0-2h1v-3.622a3 3 0 0 1-1.23-1.878L8.09 6H8a1 1 0 0 1 0-2h8z" />
                        </svg>
                      </button>
                      <button
                        className="session-edit"
                        onClick={(e) => startEditing(e, session)}
                        title="Rename session"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="session-share"
                        onClick={(e) => handleShare(e, session.id)}
                        title="Share session"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </button>
                      <button
                        className="session-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSession(session.id)
                        }}
                        title="Delete session"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <a
        href="https://llm-council-docs.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="sidebar-version"
      >
        v{FRONTEND_VERSION}
      </a>

      {shareModal.open && (
        <div
          className="share-modal-overlay"
          onClick={() => setShareModal({ open: false, url: '', loading: false })}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Session</h3>
              <button onClick={() => setShareModal({ open: false, url: '', loading: false })}>
                &times;
              </button>
            </div>
            <div className="share-modal-content">
              {shareModal.loading ? (
                <p>Generating share link...</p>
              ) : (
                <>
                  <p>Anyone with this link can view this session:</p>
                  <div className="share-url-container">
                    <input type="text" value={shareModal.url} readOnly />
                    <button onClick={copyToClipboard}>Copy</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar

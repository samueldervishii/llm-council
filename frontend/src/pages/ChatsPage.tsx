import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { MagnifyingGlassIcon as SearchIcon } from '@phosphor-icons/react/MagnifyingGlass'
import { TrashIcon as Trash } from '@phosphor-icons/react/Trash'
import { XIcon } from '@phosphor-icons/react/X'
import { NotePencilIcon as SquarePen } from '@phosphor-icons/react/NotePencil'
import { CheckIcon as Check } from '@phosphor-icons/react/Check'
import { MinusIcon as Minus } from '@phosphor-icons/react/Minus'
import { TopBar, Sidebar, CommandPalette } from '../components'
import useCouncil from '../hooks/useCouncil'
import { apiClient } from '../config/api'
import { useToast } from '../contexts/ToastContext'
import '../App.css'
import './ChatsPage.css'

interface Session {
  id: string
  title?: string
  question?: string
  created_at?: string
  is_pinned?: boolean
}

function formatLastMessage(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Last message just now'
  if (diffMins < 60) return `Last message ${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `Last message ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays === 1) return 'Last message yesterday'
  if (diffDays < 30) return `Last message ${diffDays} days ago`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return `Last message ${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(diffDays / 365)
  return `Last message ${years} year${years === 1 ? '' : 's'} ago`
}

function truncate(text: string, max = 80): string {
  if (!text) return 'New conversation'
  return text.length <= max ? text : text.slice(0, max) + '…'
}

function ChatsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const { sidebarOpen, toggleSidebar, closeSidebarOnMobile } = useOutletContext<any>()
  const {
    sessionId,
    sessions,
    hasMoreSessions,
    loadingMoreSessions,
    loadMoreSessions,
    fetchSessions,
    startNewChat,
    deleteSession,
    renameSession,
    togglePinSession,
    shareSession,
    exportSession,
  } = useCouncil() as any

  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    ids: string[]
    title: string
  }>({ open: false, ids: [], title: '' })
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    document.title = 'Chats — Étude'
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === '/')) {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        if (selectMode) exitSelectMode()
        else if (searchQuery) setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectMode, searchQuery])

  const filtered: Session[] = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return (sessions as Session[]).filter((s) => {
      const title = (s.title || '').toLowerCase()
      const question = (s.question || '').toLowerCase()
      return title.includes(q) || question.includes(q)
    })
  }, [sessions, searchQuery])

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id))
  const someFilteredSelected = !allFilteredSelected && filtered.some((s) => selectedIds.has(s.id))

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)))
    }
  }

  const openDeleteOne = (session: Session) => {
    setDeleteConfirm({
      open: true,
      ids: [session.id],
      title: session.title || session.question || 'this chat',
    })
  }

  const openDeleteSelected = () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const first = (sessions as Session[]).find((s) => s.id === ids[0])
    const title =
      ids.length === 1 ? first?.title || first?.question || 'this chat' : `${ids.length} chats`
    setDeleteConfirm({ open: true, ids, title })
  }

  const cancelDelete = () => setDeleteConfirm({ open: false, ids: [], title: '' })

  const handleConfirmDelete = async () => {
    const { ids } = deleteConfirm
    if (ids.length === 0) return
    setBulkDeleting(true)
    try {
      if (ids.length === 1) {
        await deleteSession(ids[0])
      } else {
        // No bulk endpoint — delete sequentially, then refresh once.
        for (const id of ids) {
          try {
            await apiClient.delete(`/session/${id}`)
          } catch (err) {
            console.error('Failed to delete session', id, err)
          }
        }
        await fetchSessions()
      }
      showToast(ids.length === 1 ? 'Chat deleted' : `${ids.length} chats deleted`, 'success')
      setSelectedIds(new Set())
      if (selectMode && ids.length > 1) setSelectMode(false)
    } finally {
      setBulkDeleting(false)
      cancelDelete()
    }
  }

  const handleRowClick = (e: React.MouseEvent, session: Session) => {
    if (selectMode) {
      e.preventDefault()
      toggleSelected(session.id)
      return
    }
    e.preventDefault()
    closeSidebarOnMobile?.()
    navigate(`/sessions/${session.id}`)
  }

  const handleNewChat = () => {
    startNewChat()
    navigate('/')
  }

  return (
    <div className={`chat-app ${sidebarOpen ? 'sidebar-visible' : ''}`}>
      <div className="chat-body">
        {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
        <Sidebar
          isOpen={sidebarOpen}
          sessions={sessions}
          currentSessionId={sessionId}
          hasMoreSessions={hasMoreSessions}
          loadingMoreSessions={loadingMoreSessions}
          onLoadMoreSessions={loadMoreSessions}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          onTogglePinSession={togglePinSession}
          onShareSession={shareSession}
          onClose={toggleSidebar}
          onCloseMobile={closeSidebarOnMobile}
          onNewChat={handleNewChat}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <div className="chat-content">
          <TopBar onNewChat={handleNewChat} onToggleSidebar={toggleSidebar} />

          <div className="chats-page">
            <div className="chats-page-inner">
              <div className="chats-header">
                <h1 className="chats-title">Chats</h1>
                <button
                  className="chats-new-btn"
                  onClick={handleNewChat}
                  aria-label="Start a new chat"
                >
                  <SquarePen size={14} weight="bold" />
                  <span>New chat</span>
                </button>
              </div>

              <div className="chats-search">
                <SearchIcon size={16} />
                <input
                  type="text"
                  placeholder="Search your chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="chats-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <XIcon size={14} weight="bold" />
                  </button>
                )}
              </div>

              {selectMode ? (
                <div className="chats-toolbar select">
                  <button
                    className={`chats-checkbox ${
                      allFilteredSelected ? 'checked' : someFilteredSelected ? 'indeterminate' : ''
                    }`}
                    onClick={toggleSelectAll}
                    aria-label={allFilteredSelected ? 'Clear selection' : 'Select all'}
                  >
                    {allFilteredSelected ? (
                      <Check size={12} weight="bold" />
                    ) : someFilteredSelected ? (
                      <Minus size={12} weight="bold" />
                    ) : null}
                  </button>
                  <span className="chats-selected-count">{selectedIds.size} selected</span>
                  <button
                    className="chats-toolbar-action danger"
                    onClick={openDeleteSelected}
                    disabled={selectedIds.size === 0}
                    aria-label="Delete selected chats"
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                  <button
                    className="chats-toolbar-close"
                    onClick={exitSelectMode}
                    aria-label="Exit selection mode"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="chats-toolbar">
                  <span className="chats-toolbar-label">Your chats with Étude</span>
                  <button
                    className="chats-select-toggle"
                    onClick={() => setSelectMode(true)}
                    disabled={filtered.length === 0}
                  >
                    Select
                  </button>
                </div>
              )}

              <ul className="chats-list" role="list">
                {filtered.length === 0 ? (
                  <li className="chats-empty">
                    {searchQuery
                      ? `No chats match "${searchQuery}"`
                      : 'No conversations yet — start a new chat to begin.'}
                  </li>
                ) : (
                  filtered.map((session) => {
                    const checked = selectedIds.has(session.id)
                    return (
                      <li
                        key={session.id}
                        className={`chats-row ${checked ? 'selected' : ''} ${selectMode ? 'select-mode' : ''}`}
                      >
                        <a
                          className="chats-row-link"
                          href={`/sessions/${session.id}`}
                          onClick={(e) => handleRowClick(e, session)}
                        >
                          {selectMode && (
                            <span
                              className={`chats-checkbox row ${checked ? 'checked' : ''}`}
                              aria-hidden="true"
                            >
                              {checked && <Check size={12} weight="bold" />}
                            </span>
                          )}
                          <span className="chats-row-body">
                            <span className="chats-row-title">
                              {truncate(session.title || session.question || '')}
                            </span>
                            <span className="chats-row-meta">
                              {formatLastMessage(session.created_at)}
                            </span>
                          </span>
                          {!selectMode && (
                            <button
                              className="chats-row-delete"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                openDeleteOne(session)
                              }}
                              aria-label={`Delete ${session.title || 'chat'}`}
                              title="Delete chat"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </a>
                      </li>
                    )
                  })
                )}
              </ul>

              {!searchQuery && hasMoreSessions && (
                <button
                  className="chats-show-more"
                  onClick={loadMoreSessions}
                  disabled={loadingMoreSessions}
                >
                  {loadingMoreSessions ? 'Loading…' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        sessions={sessions}
        onNewChat={handleNewChat}
        onExport={exportSession}
        currentSessionId={sessionId}
      />

      {deleteConfirm.open &&
        createPortal(
          <div className="delete-modal-overlay" onClick={cancelDelete}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <Trash size={24} />
              </div>
              <h3>{deleteConfirm.ids.length > 1 ? 'Delete Chats?' : 'Delete Chat?'}</h3>
              <p>
                {deleteConfirm.ids.length > 1 ? (
                  <>
                    Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This
                    action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete{' '}
                    <strong>"{truncate(deleteConfirm.title, 30)}"</strong>? This action cannot be
                    undone.
                  </>
                )}
              </p>
              <div className="delete-modal-actions">
                <button className="delete-cancel" onClick={cancelDelete} disabled={bulkDeleting}>
                  Cancel
                </button>
                <button
                  className="delete-confirm"
                  onClick={handleConfirmDelete}
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default ChatsPage

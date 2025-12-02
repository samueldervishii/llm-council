import { useEffect } from 'react'
import { AppLoader, TopBar, WelcomeScreen, ChatMessages, Sidebar } from './components'
import useCouncil from './hooks/useCouncil'
import useTheme from './hooks/useTheme'
import './App.css'

function App() {
  const {
    question,
    setQuestion,
    messages,
    loading,
    currentStep,
    appLoading,
    hasMessages,
    sessionId,
    sessions,
    sidebarOpen,
    mode,
    setMode,
    availableModels,
    selectedModels,
    toggleModel,
    selectAllModels,
    startCouncil,
    startNewChat,
    loadSession,
    deleteSession,
    renameSession,
    togglePinSession,
    toggleSidebar,
    shareSession,
    exportSession,
  } = useCouncil()

  const { theme, toggleTheme } = useTheme()

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N or Cmd+N for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        startNewChat()
      }
      // Ctrl+B or Cmd+B for toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [startNewChat, toggleSidebar])

  if (appLoading) {
    return <AppLoader />
  }

  return (
    <div className="chat-app">
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar} />
          <Sidebar
            sessions={sessions}
            currentSessionId={sessionId}
            onSelectSession={loadSession}
            onDeleteSession={deleteSession}
            onRenameSession={renameSession}
            onTogglePinSession={togglePinSession}
            onShareSession={shareSession}
            onClose={toggleSidebar}
            onNewChat={() => {
              startNewChat()
              toggleSidebar()
            }}
          />
        </>
      )}

      <TopBar
        onNewChat={startNewChat}
        onToggleSidebar={toggleSidebar}
        sessionId={sessionId}
        onShare={shareSession}
        onExport={exportSession}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {!hasMessages ? (
        <WelcomeScreen
          question={question}
          onQuestionChange={setQuestion}
          onSubmit={startCouncil}
          loading={loading}
          mode={mode}
          onModeChange={setMode}
          availableModels={availableModels}
          selectedModels={selectedModels}
          onToggleModel={toggleModel}
          onSelectAllModels={selectAllModels}
        />
      ) : (
        <ChatMessages
          messages={messages}
          loading={loading}
          currentStep={currentStep}
          question={question}
          onQuestionChange={setQuestion}
          onSubmit={startCouncil}
        />
      )}
    </div>
  )
}

export default App

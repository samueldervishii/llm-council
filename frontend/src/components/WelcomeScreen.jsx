import { useState } from 'react'
import ChatInput from './ChatInput'

function WelcomeScreen({
  question,
  onQuestionChange,
  onSubmit,
  loading,
  mode,
  onModeChange,
  availableModels = [],
  selectedModels = [],
  onToggleModel,
  onSelectAllModels,
}) {
  const [showModelSelection, setShowModelSelection] = useState(false)

  const selectedCount = selectedModels.length
  const totalCount = availableModels.length

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>LLM Council</h1>
        <p>Ask multiple AI models and get a synthesized answer</p>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'formal' ? 'active' : ''}`}
            onClick={() => onModeChange('formal')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Formal Council
          </button>
          <button
            className={`mode-btn ${mode === 'chat' ? 'active' : ''}`}
            onClick={() => onModeChange('chat')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Group Chat
          </button>
        </div>
        <p className="mode-description">
          {mode === 'formal'
            ? 'Models respond independently, then review each other. Chairman synthesizes the final answer.'
            : 'Models chat naturally and respond to each other in real-time.'}
        </p>

        {/* Model Selection */}
        <div className="model-selection">
          <button
            className="model-selection-toggle"
            onClick={() => setShowModelSelection(!showModelSelection)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Models ({selectedCount}/{totalCount})
            <span className={`chevron ${showModelSelection ? 'expanded' : ''}`}>▼</span>
          </button>

          {showModelSelection && (
            <div className="model-selection-panel">
              <div className="model-selection-header">
                <span>Select models to participate</span>
                <button className="select-all-btn" onClick={onSelectAllModels}>
                  Select All
                </button>
              </div>
              <div className="model-list">
                {availableModels.map((model) => (
                  <label key={model.id} className="model-item">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => onToggleModel(model.id)}
                    />
                    <span className="model-name">{model.name}</span>
                    {model.is_chairman && <span className="chairman-badge">Chairman</span>}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatInput
        value={question}
        onChange={onQuestionChange}
        onSubmit={onSubmit}
        disabled={loading}
        placeholder={
          mode === 'chat' ? 'Start a group chat with AI models...' : 'How can I help you today?'
        }
        centered
      />
    </div>
  )
}

export default WelcomeScreen

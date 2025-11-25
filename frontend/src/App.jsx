import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import './App.css'

const API_BASE = 'http://localhost:8000'

function App() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [appLoading, setAppLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Initial app loader - show for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type, content, modelName = null) => {
    setMessages((prev) => [...prev, { type, content, modelName, timestamp: new Date() }])
  }

  const startCouncil = async () => {
    if (!question.trim()) return

    const userQuestion = question
    setQuestion('')
    setLoading(true)

    // Add user message
    addMessage('user', userQuestion)

    try {
      // Create session
      setCurrentStep('Creating session...')
      const createRes = await axios.post(`${API_BASE}/query`, { question: userQuestion })
      const sessionId = createRes.data.session.id

      // Get responses
      setCurrentStep('Council is thinking...')
      addMessage('system', 'Gathering responses from the council...')

      const responsesRes = await axios.post(`${API_BASE}/session/${sessionId}/responses`)
      const responses = responsesRes.data.session.responses

      // Add each council member's response
      for (const resp of responses) {
        if (resp.error) {
          addMessage('error', `Error: ${resp.error}`, resp.model_name)
        } else {
          addMessage('council', resp.response, resp.model_name)
        }
      }

      // Get peer reviews (silent - don't show to user)
      setCurrentStep('Council is reviewing...')
      await axios.post(`${API_BASE}/session/${sessionId}/reviews`)

      // Synthesize - Chairman's verdict
      setCurrentStep('Chairman Grok is deciding...')
      addMessage('system', 'Chairman Grok is reviewing all responses...')

      const synthesisRes = await axios.post(`${API_BASE}/session/${sessionId}/synthesize`)

      // Add Chairman's final verdict
      addMessage('chairman', synthesisRes.data.session.final_synthesis, 'Grok 4.1 Fast (Chairman)')
    } catch (error) {
      console.error('Error:', error)
      addMessage('error', error.response?.data?.detail || error.message)
    } finally {
      setLoading(false)
      setCurrentStep('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      startCouncil()
    }
  }

  const hasMessages = messages.length > 0

  const startNewChat = () => {
    setMessages([])
    setQuestion('')
    setLoading(false)
    setCurrentStep('')
  }

  // Show loader for 2 seconds
  if (appLoading) {
    return (
      <div className="app-loader">
        <h1>LLM Council</h1>
        <div className="loader-spinner"></div>
      </div>
    )
  }

  return (
    <div className="chat-app">
      {hasMessages && (
        <div className="top-bar">
          <button className="new-chat-btn" onClick={startNewChat}>
            + New Chat
          </button>
        </div>
      )}
      {!hasMessages ? (
        // Welcome screen - centered
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>LLM Council</h1>
            <p>Ask multiple AI models and get a synthesized answer</p>
          </div>
          <div className="input-container centered">
            <div className="input-wrapper">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How can I help you today?"
                rows={1}
                disabled={loading}
                autoFocus
              />
              <button onClick={startCouncil} disabled={loading || !question.trim()}>
                <span className="send-icon">↑</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Chat screen - messages + input at bottom
        <>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.modelName && (
                  <div className="message-header">
                    <span className="model-name">{msg.modelName}</span>
                  </div>
                )}
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message system loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="status-text">{currentStep}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-container bottom">
            <div className="input-wrapper">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask the council another question..."
                rows={1}
                disabled={loading}
              />
              <button onClick={startCouncil} disabled={loading || !question.trim()}>
                <span className="send-icon">↑</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App

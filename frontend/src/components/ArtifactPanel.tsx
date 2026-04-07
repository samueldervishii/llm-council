import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Download, FileText, ChevronLeft } from 'lucide-react'
import { apiClient, API_BASE, getAccessToken } from '../config/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

interface ArtifactData {
  id: string
  session_id: string
  message_index: number
  title: string
  content: string
  created_at: string | null
}

interface ArtifactPanelProps {
  sessionId: string | null
  isOpen: boolean
  onClose: () => void
}

function ArtifactPanel({ sessionId, isOpen, onClose }: ArtifactPanelProps) {
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchArtifacts = useCallback(async () => {
    if (!sessionId) {
      setArtifacts([])
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.get(`/session/${sessionId}/artifacts`)
      setArtifacts(res.data.artifacts || [])
      // Auto-select first if none selected
      if (res.data.artifacts?.length && !selectedId) {
        setSelectedId(res.data.artifacts[0].id)
      }
    } catch {
      setArtifacts([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (isOpen && sessionId) {
      setSelectedId(null)
      fetchArtifacts()
    }
  }, [isOpen, sessionId, fetchArtifacts])

  const selected = artifacts.find((a) => a.id === selectedId) || null

  const handleCopy = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleExportDocx = async () => {
    if (!selected || !sessionId) return
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_BASE}/session/${sessionId}/message/${selected.message_index}/export-docx`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selected.title.slice(0, 30).replace(/[^a-z0-9]/gi, '-') || 'artifact'}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  const handleExportMd = () => {
    if (!selected) return
    const blob = new Blob([selected.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selected.title.slice(0, 30).replace(/[^a-z0-9]/gi, '-') || 'artifact'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="artifact-panel-overlay" onClick={onClose}>
      <div className="artifact-panel" onClick={(e) => e.stopPropagation()}>
        <div className="artifact-panel-header">
          <h3>
            <FileText size={16} />
            Artifacts
          </h3>
          <button className="artifact-panel-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="artifact-panel-empty">Loading...</div>
        ) : artifacts.length === 0 ? (
          <div className="artifact-panel-empty">
            <p>No artifacts yet.</p>
            <p className="artifact-panel-hint">
              Ask Cortex to write, draft, or generate a document and it will appear here.
            </p>
          </div>
        ) : !selected ? (
          <div className="artifact-panel-list">
            {artifacts.map((a) => (
              <button
                key={a.id}
                className="artifact-panel-item"
                onClick={() => setSelectedId(a.id)}
              >
                <FileText size={14} />
                <span>{a.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {artifacts.length > 1 && (
              <button className="artifact-panel-back" onClick={() => setSelectedId(null)}>
                <ChevronLeft size={14} />
                All artifacts
              </button>
            )}
            <div className="artifact-panel-title">{selected.title}</div>
            <div className="artifact-panel-toolbar">
              <button onClick={handleCopy} title="Copy text">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleExportDocx} title="Export as DOCX">
                <Download size={14} />
                DOCX
              </button>
              <button onClick={handleExportMd} title="Export as Markdown">
                <Download size={14} />
                MD
              </button>
            </div>
            <div className="artifact-panel-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {selected.content}
              </ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ArtifactPanel

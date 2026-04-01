import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const MODEL = {
  id: 'claude-sonnet-4-6',
  name: 'Claude Sonnet 4.6',
  description: 'Most efficient for everyday tasks',
  icon: '/models/icons8-claude-ai-96.png',
}

function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button className="model-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        <img className="model-selector-img" src={MODEL.icon} alt="" />
        <span className="model-selector-name">Sonnet 4.6</span>
        <ChevronDown size={14} className={`model-selector-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="model-selector-dropdown">
          <div className="model-selector-option selected">
            <img className="model-option-img" src={MODEL.icon} alt="" />
            <div className="model-option-info">
              <span className="model-option-name">{MODEL.name}</span>
              <span className="model-option-desc">{MODEL.description}</span>
            </div>
            <Check size={16} className="model-option-check" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector

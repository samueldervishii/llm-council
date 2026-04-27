import { useNavigate } from 'react-router-dom'
import useTitle from '../hooks/useTitle'
import './ArticlePage.css'

function NotFoundPage() {
  useTitle('404')
  const navigate = useNavigate()

  return (
    <div className="article-page">
      <div className="article-container">
        <div className="not-found">
          <h1>404</h1>
          <p className="not-found-message">This page doesn't exist.</p>
          <p className="not-found-hint">
            The page you're looking for may have been moved or removed.
          </p>
          <div className="not-found-actions">
            <button className="not-found-btn primary" onClick={() => navigate('/')}>
              Go to Étude
            </button>
            <button className="not-found-btn" onClick={() => navigate(-1)}>
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage

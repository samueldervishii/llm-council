function ChatSkeleton() {
  return (
    <div className="chat-skeleton">
      <div className="skeleton-message skeleton-message-user">
        <div className="skeleton-avatar" />
        <div className="skeleton-body">
          <div className="skeleton-header-row">
            <div className="skeleton-label" />
          </div>
          <div className="skeleton-line skeleton-line-short" />
        </div>
      </div>

      <div className="skeleton-message skeleton-message-assistant">
        <div className="skeleton-avatar" />
        <div className="skeleton-body skeleton-body-assistant">
          <div className="skeleton-header-row">
            <div className="skeleton-label" />
            <div className="skeleton-pill" />
          </div>
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-medium" />
          <div className="skeleton-line skeleton-line-short" />
        </div>
      </div>
    </div>
  )
}

export default ChatSkeleton

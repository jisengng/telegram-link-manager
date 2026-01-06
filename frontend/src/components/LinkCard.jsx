import './LinkCard.css';

function LinkCard({ link, onEdit, onDelete, onToggleComplete, bulkMode, selected, onToggleSelection }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const handleCardClick = (e) => {
    if (bulkMode) {
      e.preventDefault();
      onToggleSelection(link.id);
    }
  };

  const isCompleted = link.completed === 1;

  return (
    <div
      className={`link-card ${bulkMode ? 'bulk-mode' : ''} ${selected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={handleCardClick}
    >
      {bulkMode && (
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelection(link.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="link-main">
        {link.image_url && (
          <div className="link-thumbnail">
            <img src={link.image_url} alt={link.title} loading="lazy" />
          </div>
        )}

        <div className="link-content">
          <div className="link-header">
            <span className="category-badge">{link.category}</span>
            <span className="date">{formatDate(link.created_at)}</span>
          </div>

          <h3 className="link-title">{link.title}</h3>

          {link.description && (
            <p className="link-description">
              {link.description.length > 150
                ? link.description.substring(0, 150) + '...'
                : link.description}
            </p>
          )}

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-url"
            onClick={(e) => {
              if (bulkMode) {
                e.preventDefault();
              } else {
                e.stopPropagation();
              }
            }}
          >
            {new URL(link.url).hostname}
          </a>
        </div>
      </div>

      {!bulkMode && (
        <div className="link-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(link.id);
            }}
            className={`complete-btn ${isCompleted ? 'completed' : ''}`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? '✓' : '○'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(link);
            }}
            className="icon-btn edit-btn"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(link.id);
            }}
            className="icon-btn delete-btn"
            title="Delete"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default LinkCard;

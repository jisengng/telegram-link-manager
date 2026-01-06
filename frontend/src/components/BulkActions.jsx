import { useState } from 'react';
import './BulkActions.css';

function BulkActions({
  selectedCount,
  onSelectAll,
  allSelected,
  onAddTags,
  onRemoveTags,
  onDelete,
  availableTags
}) {
  const [showAddTagMenu, setShowAddTagMenu] = useState(false);
  const [showRemoveTagMenu, setShowRemoveTagMenu] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddTags = () => {
    const tags = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    if (tags.length > 0) {
      onAddTags(tags);
      setTagInput('');
      setShowAddTagMenu(false);
    }
  };

  const handleQuickAddTag = (tag) => {
    onAddTags([tag]);
    setShowAddTagMenu(false);
  };

  const handleRemoveTags = () => {
    const tags = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    if (tags.length > 0) {
      onRemoveTags(tags);
      setTagInput('');
      setShowRemoveTagMenu(false);
    }
  };

  const handleQuickRemoveTag = (tag) => {
    onRemoveTags([tag]);
    setShowRemoveTagMenu(false);
  };

  return (
    <div className="bulk-actions">
      <div className="bulk-actions-left">
        <button
          onClick={onSelectAll}
          className="select-all-btn"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <span className="selected-count">{selectedCount} selected</span>
      </div>

      <div className="bulk-actions-right">
        <div className="action-group">
          <button
            onClick={() => {
              setShowAddTagMenu(!showAddTagMenu);
              setShowRemoveTagMenu(false);
            }}
            className="bulk-btn add-tags-btn"
          >
            + Add Tags
          </button>

          {showAddTagMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTags()}
                  placeholder="Enter tags (comma-separated)"
                  className="tag-input"
                />
                <button onClick={handleAddTags} className="apply-btn">
                  Add
                </button>
              </div>

              <div className="quick-tags">
                <div className="quick-tags-label">Quick tags:</div>
                {availableTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleQuickAddTag(tag)}
                    className="quick-tag"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="action-group">
          <button
            onClick={() => {
              setShowRemoveTagMenu(!showRemoveTagMenu);
              setShowAddTagMenu(false);
            }}
            className="bulk-btn remove-tags-btn"
          >
            - Remove Tags
          </button>

          {showRemoveTagMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRemoveTags()}
                  placeholder="Enter tags (comma-separated)"
                  className="tag-input"
                />
                <button onClick={handleRemoveTags} className="apply-btn">
                  Remove
                </button>
              </div>

              <div className="quick-tags">
                <div className="quick-tags-label">Quick remove:</div>
                {availableTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleQuickRemoveTag(tag)}
                    className="quick-tag"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="bulk-btn delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default BulkActions;

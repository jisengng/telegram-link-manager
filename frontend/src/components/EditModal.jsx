import { useState } from 'react';
import './EditModal.css';

function EditModal({ link, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: link.title,
    description: link.description || '',
    image_url: link.image_url || '',
    category: link.category
  });

  const categories = ['article', 'video', 'product', 'tech', 'docs', 'social'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...link,
      ...formData
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Link</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                style={{
                  marginTop: '0.5rem',
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;

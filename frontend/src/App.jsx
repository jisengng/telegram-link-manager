import { useState, useEffect } from 'react';
import { linkApi } from './api';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import LinkCard from './components/LinkCard';
import EditModal from './components/EditModal';
import './App.css';

function App() {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [completionFilter, setCompletionFilter] = useState('all');

  // Edit modal state
  const [editingLink, setEditingLink] = useState(null);

  // Bulk selection state
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, completionFilter, links]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [linksRes, categoriesRes] = await Promise.all([
        linkApi.getAllLinks(),
        linkApi.getCategories()
      ]);
      setLinks(linksRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = links;

    // Apply search and category filters via API
    if (searchQuery || selectedCategory) {
      try {
        const response = await linkApi.searchLinks(
          searchQuery,
          selectedCategory,
          []
        );
        filtered = response.data;
      } catch (err) {
        console.error('Error filtering links:', err);
      }
    }

    // Apply completion filter locally
    if (completionFilter === 'completed') {
      filtered = filtered.filter(link => link.completed === 1);
    } else if (completionFilter === 'incomplete') {
      filtered = filtered.filter(link => link.completed === 0 || !link.completed);
    }

    setFilteredLinks(filtered);
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await linkApi.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
    } catch (err) {
      console.error('Error deleting link:', err);
      alert('Failed to delete link');
    }
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
  };

  const handleSaveEdit = async (updatedLink) => {
    try {
      await linkApi.updateLink(updatedLink.id, {
        title: updatedLink.title,
        description: updatedLink.description,
        image_url: updatedLink.image_url,
        category: updatedLink.category,
        tags: updatedLink.tags || []
      });
      setLinks(links.map(link => link.id === updatedLink.id ? updatedLink : link));
      setEditingLink(null);
    } catch (err) {
      console.error('Error updating link:', err);
      alert('Failed to update link');
    }
  };

  const handleToggleSelection = (id) => {
    setSelectedLinks(prev =>
      prev.includes(id)
        ? prev.filter(linkId => linkId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinks.length === filteredLinks.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(filteredLinks.map(link => link.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedLinks.length} links?`)) return;

    try {
      await linkApi.bulkDelete(selectedLinks);
      setLinks(links.filter(link => !selectedLinks.includes(link.id)));
      setSelectedLinks([]);
      setBulkMode(false);
    } catch (err) {
      console.error('Error deleting links:', err);
      alert('Failed to delete links');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Link Manager</h1>
          <div className="header-stats">
            <span>{links.length} links</span>
            <span>{categories.length} categories</span>
          </div>
          <button
            className={`bulk-mode-btn ${bulkMode ? 'active' : ''}`}
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedLinks([]);
            }}
          >
            {bulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            completionFilter={completionFilter}
            onCompletionFilterChange={setCompletionFilter}
          />
        </aside>

        <main className="content">
          {bulkMode && selectedLinks.length > 0 && (
            <div className="bulk-actions-bar">
              <div className="bulk-actions-left">
                <button onClick={handleSelectAll} className="select-all-btn">
                  {selectedLinks.length === filteredLinks.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="selected-count">{selectedLinks.length} selected</span>
              </div>
              <button onClick={handleBulkDelete} className="bulk-delete-btn">
                Delete Selected
              </button>
            </div>
          )}

          {filteredLinks.length === 0 ? (
            <div className="empty-state">
              <h2>No links found</h2>
              <p>
                {searchQuery || selectedCategory
                  ? 'Try adjusting your filters'
                  : 'Start by sending a link to your Telegram bot!'}
              </p>
            </div>
          ) : (
            <div className="links-list">
              {filteredLinks.map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={handleEditLink}
                  onDelete={handleDeleteLink}
                  onToggleComplete={async (id) => {
                    try {
                      const response = await linkApi.toggleComplete(id);
                      setLinks(links.map(l => l.id === id ? response.data : l));
                    } catch (err) {
                      console.error('Error toggling complete:', err);
                      alert('Failed to toggle complete status');
                    }
                  }}
                  bulkMode={bulkMode}
                  selected={selectedLinks.includes(link.id)}
                  onToggleSelection={handleToggleSelection}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {editingLink && (
        <EditModal
          link={editingLink}
          onSave={handleSaveEdit}
          onClose={() => setEditingLink(null)}
        />
      )}
    </div>
  );
}

export default App;

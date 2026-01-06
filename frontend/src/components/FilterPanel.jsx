import './FilterPanel.css';

function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  completionFilter,
  onCompletionFilterChange
}) {
  const handleClearFilters = () => {
    onCategoryChange('');
    onCompletionFilterChange('all');
  };

  const hasFilters = selectedCategory || completionFilter !== 'all';

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasFilters && (
          <button onClick={handleClearFilters} className="clear-filters">
            Clear
          </button>
        )}
      </div>

      <div className="filter-section">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          className="filter-select"
          value={completionFilter}
          onChange={(e) => onCompletionFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="incomplete">To Read</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.category} value={cat.category}>
              {cat.category} ({cat.count})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;

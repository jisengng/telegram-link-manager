import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Debounce the search
    setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search links..."
        value={localValue}
        onChange={handleChange}
        className="search-input"
      />
      {localValue && (
        <button onClick={handleClear} className="clear-btn">
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;

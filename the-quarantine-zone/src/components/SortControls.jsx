import React from 'react';
import './SortControls.css'; // Create this CSS file

function SortControls({ currentSort, onSortChange }) {
  return (
    <div className="sort-controls">
      <span>Order by:</span>
      <button
        className={`sort-button ${currentSort === 'newest' ? 'active' : ''}`}
        onClick={() => onSortChange('newest')}
      >
        Newest
      </button>
      <button
        className={`sort-button ${currentSort === 'popular' ? 'active' : ''}`}
        onClick={() => onSortChange('popular')}
      >
        Most Popular
      </button>
    </div>
  );
}

export default SortControls;
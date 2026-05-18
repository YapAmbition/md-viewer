import { useState } from 'react';
import FileTree from './FileTree';

const ICONS = {
  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
};

export default function Sidebar({
  collapsed,
  mobileOpen,
  treeData,
  sort,
  searchQuery,
  currentFile,
  onFileSelect,
  onDelete,
  onSortChange,
  onSearchChange,
  onOverlayClick,
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSortClick = (field) => {
    if (sort.sort === field) {
      onSortChange(field, sort.dir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, field === 'time' ? 'desc' : 'asc');
    }
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-label">Documents</span>
      </div>
      <div className="sidebar-toolbar">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button className="search-clear visible" onClick={() => onSearchChange('')} title="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="sort-controls">
          <button
            className={`sort-btn${sort.sort === 'name' ? ' active' : ''}`}
            onClick={() => handleSortClick('name')}
            title="Sort by name"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 6h12M3 12h9M3 18h6"/>
            </svg>
            <span>Name</span>
            <span className="sort-arrow">{sort.sort === 'name' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}</span>
          </button>
          <button
            className={`sort-btn${sort.sort === 'time' ? ' active' : ''}`}
            onClick={() => handleSortClick('time')}
            title="Sort by time"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Time</span>
            <span className="sort-arrow">{sort.sort === 'time' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}</span>
          </button>
        </div>
      </div>
      <nav className="file-tree">
        {treeData ? (
          <FileTree
            data={treeData}
            sort={sort}
            searchQuery={searchQuery}
            currentFile={currentFile}
            onFileSelect={onFileSelect}
            onDelete={onDelete}
          />
        ) : (
          <p style={{ padding: '16px', color: '#e05a5a', fontSize: '13px' }}>Failed to load file list.</p>
        )}
      </nav>
    </aside>
  );
}

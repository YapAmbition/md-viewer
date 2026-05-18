import { useState } from 'react';
import { Input, Button } from 'animal-island-ui';
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
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          size="small"
        />
        <div className="sort-controls">
          <Button
            type={sort.sort === 'name' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleSortClick('name')}
          >
            Name {sort.sort === 'name' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
          </Button>
          <Button
            type={sort.sort === 'time' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleSortClick('time')}
          >
            Time {sort.sort === 'time' ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
          </Button>
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

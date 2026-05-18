import { useState, useMemo } from 'react';

const ICONS = {
  chevronRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
  delete: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
};

function formatTime(mtime) {
  const date = new Date(mtime);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}

function escapeHtml(str) {
  return str; // React handles escaping automatically
}

function filterTree(node, query) {
  if (!query) return node;
  if (node.type === 'file') {
    return node.name.toLowerCase().includes(query.toLowerCase()) ? node : null;
  }
  const children = node.children
    .map(child => filterTree(child, query))
    .filter(Boolean);
  return children.length > 0 ? { ...node, children } : null;
}

function sortTree(node, sort) {
  if (node.type !== 'directory') return node;
  const children = node.children.map(child => sortTree(child, sort));

  const dirs = children.filter(c => c.type === 'directory');
  const files = children.filter(c => c.type === 'file');

  dirs.sort((a, b) => a.name.localeCompare(b.name));

  if (sort.sort === 'time') {
    files.sort((a, b) => (a.mtime || 0) - (b.mtime || 0));
  } else {
    files.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sort.dir === 'desc') {
    files.reverse();
  }

  return { ...node, children: [...dirs, ...files] };
}

function TreeItem({ item, currentFile, onFileSelect, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  if (item.type === 'directory') {
    return (
      <>
        <div
          className="tree-item"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          <span className="tree-item-chevron" dangerouslySetInnerHTML={{ __html: expanded ? ICONS.chevronDown : ICONS.chevronRight }} />
          <span className="tree-item-icon" dangerouslySetInnerHTML={{ __html: ICONS.folder }} />
          <span className="tree-item-name">{escapeHtml(item.name)}</span>
        </div>
        <div className={`tree-dir-children${expanded ? '' : ' collapsed'}`}>
          <ul>
            {item.children.map((child, i) => (
              <li key={child.path || `${child.name}-${i}`}>
                <TreeItem item={child} currentFile={currentFile} onFileSelect={onFileSelect} onDelete={onDelete} />
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  return (
    <div
      className={`tree-item${item.path === currentFile ? ' active' : ''}`}
      onClick={() => onFileSelect(item.path)}
    >
      <span className="tree-item-chevron invisible" />
      <span className="tree-item-icon" dangerouslySetInnerHTML={{ __html: ICONS.file }} />
      <span className="tree-item-name">{escapeHtml(item.name)}</span>
      {item.mtime && <span className="tree-item-time">{formatTime(item.mtime)}</span>}
      <button className="tree-item-delete" title="Delete file" onClick={(e) => { e.stopPropagation(); onDelete(item.path); }} dangerouslySetInnerHTML={{ __html: ICONS.delete }} />
    </div>
  );
}

export default function FileTree({ data, sort, searchQuery, currentFile, onFileSelect, onDelete }) {
  const processed = useMemo(() => {
    let result = sortTree(data, sort);
    result = filterTree(result, searchQuery);
    return result;
  }, [data, sort, searchQuery]);

  if (!processed || processed.children.length === 0) {
    return searchQuery ? <div className="search-empty">No matching files</div> : null;
  }

  return (
    <ul>
      {processed.children.map((child, i) => (
        <li key={child.path || `${child.name}-${i}`}>
          <TreeItem item={child} currentFile={currentFile} onFileSelect={onFileSelect} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
